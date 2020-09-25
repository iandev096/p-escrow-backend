import { Injectable, InternalServerErrorException, Scope, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { UserRepository } from './repositories/user.repository';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialDto } from './dto/auth.dto';
import { EmailService } from './email.service';
import { TokenVerificationType } from './auth.enum';
import { CreateContactDetailDto, UpdateContactDetailDto } from './dto/user.dto';
import { SendTokenFn } from './email-service.interface';

export enum Provider {
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
    LOCAL = 'local',
}

@Injectable({
    scope: Scope.TRANSIENT
    /* Transient providers are not shared across consumers. 
    Each consumer that injects a transient provider will 
    receive a new, dedicated instance. */
})
export class AuthService {

    sendVerificationToken: SendTokenFn;
    sendPasswordResetToken: SendTokenFn;

    constructor(
        @InjectRepository(UserRepository)
        private userRepository: UserRepository,
        private jwtService: JwtService,
        private emailService: EmailService
    ) {
        this.sendVerificationToken = emailService.sendVerificationToken;
        this.sendPasswordResetToken = emailService.sendPasswordResetToken;
    }

    async validateOAuthLogin(
        fullName: string,
        userIdentifier: string,
        provider: Provider,
        profilePicture: string,
        email: string
    ): Promise<{ jwt: string, oAuthUser: User }> {
        try {
            const oAuthUser = await this.tryToRegisterOAuthUser(fullName, userIdentifier, provider, profilePicture, email);

            const payload: JwtPayload = {
                userId: oAuthUser.id,
                provider,
                fullName: oAuthUser.fullName,
                email: oAuthUser.email,
                verification: {
                    emailVerified: oAuthUser.emailVerified,
                    contactNumberVerified: oAuthUser.contactNumberVerified
                }
            };

            const jwt = this.jwtService.sign(payload);

            return { oAuthUser, jwt };
        } catch (err) {
            throw new InternalServerErrorException('validateOAuthLogin', err.message);
        }
    }

    private tryToRegisterOAuthUser(
        fullName: string,
        userIdentifier: string,
        provider: Provider,
        profilePicture: string,
        email: string
    ): Promise<User> {
        return this.userRepository.registerOAuthUser(fullName, userIdentifier, provider, profilePicture, email);
    }

    async signup(authCredentialDto: AuthCredentialDto) {
        const user = await this.userRepository.signUp(authCredentialDto, this.sendVerificationToken);
        const jwt = this.signJwt(user);

        return { user, jwt };
    }

    async signin(authCredentialDto: AuthCredentialDto) {
        const user = await this.userRepository.validateUserPassword(authCredentialDto);

        if (!user) throw new NotFoundException('User not found');
        
        const jwt = this.signJwt(user);

        return { user, jwt }
    }

    async verifyUserAccount(userId: string) {
        await this.userRepository.verifyUserAccount(
            userId,
            this.sendVerificationToken
        );
    }

    async resetPassword(email: string) {
        await this.userRepository.passwordReset(
            email,
            this.sendPasswordResetToken
        );
    }

    async verifyUserToken(email: string, type: TokenVerificationType, token: string, password?: string) {
        const verifiedUser = await this.userRepository.verifyUserToken(
            email,
            type,
            token,
            password
        );

        const jwt = this.signJwt(verifiedUser);
        return { jwt };
    }

    private signJwt(user: User) {
        const payload: JwtPayload = {
            userId: user.id,
            provider: user.provider,
            fullName: user.fullName,
            email: user.email,
            verification: {
                emailVerified: user.emailVerified,
                contactNumberVerified: user.contactNumberVerified
            }
        };

        const jwt = this.jwtService.sign(payload);
        return jwt;
    }

    createContactDetail(contactDetailDto: CreateContactDetailDto, userId: string) {
        return this.userRepository.createContactDetail(contactDetailDto, userId);
    }

    updateContactDetail(contactDetailDto: UpdateContactDetailDto, userId: string) {
        return this.userRepository.updateContactDetail(contactDetailDto, userId);
    }

    getContactDetailByUserId(userId: string) {
        return this.userRepository.getContactDetailByUserId(userId);
    }
}
