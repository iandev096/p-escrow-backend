/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseEntity, Entity, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable, OneToOne, JoinColumn, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { Provider } from "../auth.service";
import { InternalServerErrorException, ForbiddenException } from "@nestjs/common";
import { TokenVerificationType, ErrorMessage } from "../auth.enum";
import { Log } from "../../shared/log/log.entity";
import { Product } from "../../products/entities/product.entity";
import { Cart } from "../../products/entities/cart.entity";
import { Order } from "../../orders/entities/order.entity";
import { UserRating } from "./user-rating.entity";
import { ContactDetail } from "./contact-detail.entity";
import { hashPassword } from "../auth.util";
import { PaymentAccount } from "../../payments/entities/payment-account.entity";
import { LikedProduct } from "../../products/entities/liked-product.entity";

@Entity()
export class User extends BaseEntity {

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({
        unique: true
    })
    email: string;

    @Column({
        nullable: true
    })
    contactNumber: string;

    @Column()
    fullName: string;

    @Column({
        nullable: true
    })
    userIdentifier: string; // could be a username or an email based on the provider

    @Column({
        nullable: true
    })
    provider: Provider;

    @Column({
        nullable: true
    })
    password: string;

    @Column({
        nullable: true
    })
    passwordResetToken: string;

    @Column({
        nullable: true
    })
    passwordResetTokenExp: Date;

    @Column({
        nullable: true
    })
    profilePicture: string;

    @Column({
        nullable: true
    })
    salt: string;

    @Column({
        nullable: true
    })
    contactNumberVerified: boolean;

    @Column({
        nullable: true
    })
    contactNumberVerificationToken: string;

    @Column({
        nullable: true
    })
    contactNumberVerificationTokenExp: Date;

    @Column({
        nullable: true
    })
    emailVerified: boolean;

    @Column({
        nullable: true
    })
    emailVerificationToken: string;

    @Column({
        nullable: true
    })
    emailVerificationTokenExp: Date;

    @OneToMany(() => Log, log => log.user, { cascade: true })
    logs: Log[];

    @OneToMany(() => Product, product => product.user, { cascade: true })
    products: Product[];

    @OneToMany(() => Order, order => order.user, { cascade: true })
    orders: Order[];
    
    @OneToOne(() => ContactDetail, contactDetail => contactDetail.user, { cascade: true, eager: true })
    contactDetail: ContactDetail;

    @OneToMany(() => PaymentAccount, paymentAccount => paymentAccount.user, { cascade: true })
    paymentAccounts: PaymentAccount[];

    @OneToMany(() => UserRating, userRating => userRating.user, { cascade: true, eager: true })
    ratings: UserRating[];

    @OneToOne(() => Cart, cart => cart.user)
    cart: Cart;

    @OneToMany(() => LikedProduct, likedProduct => likedProduct.user)
    likedProducts: LikedProduct[];

    async validatePassword(password: string): Promise<boolean> {
        if (this.password && this.salt) {
            const hash = await bcrypt.hash(password, this.salt);
            return hash === this.password;
        } else {
            throw new InternalServerErrorException('Operation is not available for this user');
        }
    }

    private verifyUserHelper(userToken: string, token: string, userTokenExp: Date, errorMessage: ErrorMessage) {
        const currentDate = new Date();
        const tokenIsValidAndHasNotExpired = (
            (userToken === token) &&
            (userTokenExp > currentDate)
        );
        if (tokenIsValidAndHasNotExpired) {
            return true;
        } else {
            throw new ForbiddenException(errorMessage);
        }
    }

    //================================================================================
    // Returns true if the user is verified. The user can then be allowed to make the appropriate verification update to his record, either phone, email or password
    async verifyUser(verificationOptions: { type: TokenVerificationType, token: string, password?: string }) {
        switch (verificationOptions.type) {
            case TokenVerificationType.EMAIL:
                const isEmailVerified = this.verifyUserHelper(
                    this.emailVerificationToken,
                    verificationOptions.token,
                    this.emailVerificationTokenExp,
                    ErrorMessage.EMAIL_VERIFICATION_FAILED
                );

                if (isEmailVerified) {
                    this.emailVerificationToken = null;
                    this.emailVerificationTokenExp = null;
                    this.emailVerified = true;
                    return this;
                }

            case TokenVerificationType.CONTACT_NUMBER:
                const isContactVerified = this.verifyUserHelper(
                    this.contactNumberVerificationToken,
                    verificationOptions.token,
                    this.emailVerificationTokenExp,
                    ErrorMessage.CONTACT_NUMBER_VERIFICATION_FAILED
                );

                if (isContactVerified) {
                    this.contactNumberVerificationToken = null;
                    this.contactNumberVerificationTokenExp = null;
                    this.contactNumberVerified = true;
                    return this;
                }

            case TokenVerificationType.PASSWORD:
                const canResetPassword = this.verifyUserHelper(
                    this.passwordResetToken,
                    verificationOptions.token,
                    this.passwordResetTokenExp,
                    ErrorMessage.PASSWORD_VERIFICATION_FAILED
                );

                if (canResetPassword) {
                    this.passwordResetToken = null;
                    this.passwordResetTokenExp = null;
                    this.password = await hashPassword(verificationOptions.password, this.salt);
                    return this;
                }

            default:
                // I don't think execution will ever get here
                throw new InternalServerErrorException('Impossible error');
        }
    }
}
