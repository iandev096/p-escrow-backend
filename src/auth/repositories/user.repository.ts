import { Repository, EntityRepository } from "typeorm";
import { ConflictException, InternalServerErrorException, UnauthorizedException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import * as bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { User } from "../entities/user.entity";
import { AuthCredentialDto } from "../dto/auth.dto";
import { Provider } from "../auth.service";
import { ErrorMessage, TokenVerificationType } from "../auth.enum";
import { LogAction } from "../../shared/log/log.enum";
import { generateExpDate, hashPassword } from "../auth.util";
import { createLogHelper } from "../../shared/utilities/db.util";
import { CreateContactDetailDto, UpdateContactDetailDto } from "../dto/user.dto";
import { ContactDetail } from "../entities/contact-detail.entity";
import { SendTokenFn } from "../email-service.interface";

@Injectable()
@EntityRepository(User)
export class UserRepository extends Repository<User> {

    //=====================================================
    // This method basically signs in oAuth users if they have been signed up otherwise they signed up. 
    async registerOAuthUser(
        fullName: string,
        userIdentifier: string,
        provider: Provider,
        profilePicture: string,
        email: string
    ): Promise<User> {

        let oAuthUser = await this.findOne({ email: email });

        const hasAlreadySignedUp = oAuthUser;
        const userIsVerified = (hasAlreadySignedUp?.emailVerified || hasAlreadySignedUp?.contactNumberVerified);

        if (userIsVerified) {
            const oAuthSignInLog = createLogHelper(oAuthUser.id, LogAction.O_AUTH_SIGN_IN, 'Signed up with oauth');
            await oAuthSignInLog.save();

            return this.getNormalizedUser(oAuthUser);

        } else if (hasAlreadySignedUp && !userIsVerified) {
            /* It seems rather strange that I will throw an error here 
            But I do so because if the execution of code gets here it would be inconceivable
            This is because an OAUTH user is definitely verified. Any OAUTH user who is not verified 
            is an anomaly */
            throw new UnauthorizedException(ErrorMessage.ACCOUNT_NOT_VERIFIED);
        }

        oAuthUser = await this.findOAuthUser(userIdentifier, provider);

        if (!oAuthUser) {
            try {
                oAuthUser = new User();
                oAuthUser.fullName = fullName;
                oAuthUser.userIdentifier = userIdentifier;
                oAuthUser.provider = provider;
                oAuthUser.profilePicture = profilePicture;
                oAuthUser.email = email;
                oAuthUser.emailVerified = true;

                const oAuthSignupLog = createLogHelper(oAuthUser.id, LogAction.O_AUTH_SIGN_UP, 'Signed up with oauth');

                await this.manager.transaction(async transactionManager => {
                    await transactionManager.save([oAuthUser, oAuthSignupLog]);
                });
                
                return this.getNormalizedUser(oAuthUser);
            } catch (err) {
                if (err.code === '23505') {
                    throw new ConflictException('User already exists');
                } else {
                    throw new InternalServerErrorException(err.message || null);
                }
            }
        } else {
            return this.getNormalizedUser(oAuthUser);
        }
    }

    // this can easily be replaced with ```await this.findOne({userIdentifier, provider});```
    // I chose to write this function just to make use of custom queries.
    private async findOAuthUser(userIdentifier: string, provider: Provider): Promise<User> {
        try {
            const query = this.createQueryBuilder('user');
            query.where('user.userIdentifier = :userIdentifier', { userIdentifier: userIdentifier });
            query.andWhere('user.provider = :provider', { provider: provider });
            const user = await query.getOne();

            return user;
        } catch (err) {
            throw new InternalServerErrorException();
        }
    }

    async signUp(
        authCredentialDto: AuthCredentialDto,
        sendVerificationToken: SendTokenFn,
    ): Promise<User> {
        const { email, fullName, password } = authCredentialDto;

        try {
            const user = new User();
            user.email = email;
            user.emailVerificationToken = uuid();
            user.emailVerificationTokenExp = generateExpDate(1);
            user.fullName = fullName;
            user.provider = Provider.LOCAL;
            user.salt = await bcrypt.genSalt();
            user.password = await hashPassword(password, user.salt);

            const signupLog = createLogHelper(user.id, LogAction.SIGN_UP, 'Signed up locally');

            await this.manager.transaction(async transactionManager => {
                await transactionManager.save([user, signupLog]);
            });

            await sendVerificationToken(user);
            
            return this.getNormalizedUser(user);
        } catch (err) {
            if (err.code === '23505') {
                throw new ConflictException('email already exists');
            } else {
                throw new InternalServerErrorException(err.message || null);
            }
        }
    }

    async verifyUserAccount(
        userId: string,
        sendVerificationToken: SendTokenFn
    ) {
        const user = await this.findOne({ id: userId });
        user.emailVerificationToken = uuid();
        user.emailVerificationTokenExp = generateExpDate(1);

        const tokenLog = createLogHelper(user.id, LogAction.EMAIL_VERIFICATION_TOKEN_SENT, 'Email verification token sent.');

        await this.manager.transaction(async transactionManager => {
            await transactionManager.save([user, tokenLog]);
        });

        await sendVerificationToken(user);
    }

    async passwordReset(
        email: string,
        sendPasswordResetToken: SendTokenFn
    ) {
        const user = await this.findOne({ email: email });
        if (user) {
            try {
                user.passwordResetToken = uuid();
                user.passwordResetTokenExp = generateExpDate(1);

                const tokenLog = createLogHelper(user.id, LogAction.PASSWORD_RESET_TOKEN_SENT, 'Password reset token sent');

                await this.manager.transaction(async transactionManager => {
                    await transactionManager.save([user, tokenLog]);
                });

                await sendPasswordResetToken(user);
            } catch (err) {
                throw new InternalServerErrorException(err.message ?? '');
            }
        } else {
            throw new BadRequestException('You are not allowed to make this request');
        }
    }

    async verifyUserToken(
        email: string,
        type: TokenVerificationType,
        token: string,
        password?: string
    ): Promise<User> {
        const user = await this.findOne({ email });

        let logAction!: LogAction;
        switch (type) {
            case TokenVerificationType.CONTACT_NUMBER:
                logAction = LogAction.CONTACT_NUMBER_VERIFICATION_CAN_COMPLETE;

            case TokenVerificationType.EMAIL:
                logAction = LogAction.EMAIL_VERIFICATION_CAN_COMPLETE;

            case TokenVerificationType.PASSWORD:
                logAction = LogAction.PASSWORD_RESET_CAN_COMPLETE;
        }

        const verfiedUser = await user.verifyUser({ type, token, password });
        const verfiedUserLog = createLogHelper(user.id, logAction, '');

        await this.manager.transaction(async transactionManager => {
            await transactionManager.save([verfiedUser, verfiedUserLog]);
        });

        return verfiedUser;
    }

    async validateUserPassword(authCredentialDto: AuthCredentialDto): Promise<User> {
        try {
            const { email, password } = authCredentialDto;
            const user = await this.findOne({ email });

            const userHasBeenValidated = (user && await user.validatePassword(password));
            if (userHasBeenValidated) {
                return this.getNormalizedUser(user);
            } else {
                throw new NotFoundException('User not found');
            }
        } catch (err) {
            console.log(err.message)
        }
    }

    async createContactDetail(contactDetailDto: CreateContactDetailDto, userId: string) {
        const user = await this.findOne(userId);
        if (user) {
            let contactDetail = ContactDetail.create({
                country: contactDetailDto.country,
                city: contactDetailDto.city,
                street: contactDetailDto.street,
                landMark: contactDetailDto.landMark,
                residentialAddress: contactDetailDto.residentialAddress,
                lat: contactDetailDto.lat,
                lng: contactDetailDto.lng,
                userId: user.id
            });

            const createContactDetailLog = createLogHelper(userId, LogAction.CREATE_PRODUCT,
                `Added contact detail (${contactDetail.id})`)
            try {
                await this.manager.transaction(async transactionManager => {
                    [contactDetail, ] = await transactionManager.save([contactDetail, createContactDetailLog]) as [ContactDetail, ]
                });
            } catch (err) {
                throw new InternalServerErrorException(err?.message);
            }
            return contactDetail;
        } else {
            throw new NotFoundException('User not found');
        }
    }

    async updateContactDetail(contactDetailDto: UpdateContactDetailDto, userId: string) {
        const contactDetail = await ContactDetail.findOne({ userId: userId });

        if (contactDetail) {
            const updatedContactDetail = contactDetail;
            const updateFields = Object.entries(contactDetailDto).filter(([, value]) => value);
            updateFields.forEach(([key, value]) => {
                updatedContactDetail[key] = value;
            });

            const updateContactDetailLog = createLogHelper(userId, LogAction.UPDATED_USER_CONTACT_DETAIL,
                `User (${userId}) updated his contact detail. Updated fields are '${updateFields.keys}'}`)

            try {
                await this.manager.transaction(async transactionManager => {
                    await transactionManager.save([updatedContactDetail, updateContactDetailLog]);
                });
            } catch (err) {
                throw new InternalServerErrorException(err.message);
            }
            return updatedContactDetail;
        } else {
            throw new NotFoundException('Contact detail has not been created');
        }
    }

    async getContactDetailByUserId(userId: string) {
        return await ContactDetail.findOne({userId: userId});
    }

    private getNormalizedUser(user: User): User {
        return {
            id: user.id,
            email: user.email,
            contactNumber: user.contactNumber,
            fullName: user.fullName,
            emailVerified: user.emailVerified,
            contactNumberVerified: user.contactNumberVerified,
            contactDetail: user.contactDetail
        } as User;
    }
}
