import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from '@sendgrid/mail';
import { verifyTemplate } from "./templates/verify-email-template";
import { User } from "./entities/user.entity";
import { passwordResetTemplate } from "./templates/password-reset-template";
import { SendTokenFn } from "./email-service.interface";

@Injectable()
export class EmailService {
    private feDomain: string;
    private from = 'escrow@biz.gh.com'

    constructor(
        private readonly config: ConfigService
    ) {
        const sendgridApiKey = this.config.get<string>('sendgrid.apiKey');
        sgMail.setApiKey(sendgridApiKey);

        this.feDomain = this.config.get<string>('feUrl');
    }

    sendVerificationToken: SendTokenFn = async (user: User) => {
        try {
            const redirectUrl = encodeURI(`${this.feDomain}/auth/verify-email-token?token=${user.emailVerificationToken}&email=${user.email}`);
            const msg = {
                to: user.email,
                from: this.from,
                subject: 'Verify your Kasuwa Account',
                // text: 'and easy to do anywhere, even with Node.js',
                html: verifyTemplate(user.fullName, redirectUrl)
            };
            await sgMail.send(msg);
            return true;
        } catch (err) {
            console.log(`Error sending user account verification token. User(${user.id}) must manually confirm account`);
            return false;
        }
    }

    sendPasswordResetToken: SendTokenFn = async (user: User) => {
        try {
            const redirectUrl = encodeURI(`${this.feDomain}/auth/verify-password-token?token=${user.passwordResetToken}&email=${user.email}`);
            const msg = {
                to: user.email,
                from: this.from,
                subject: 'Password reset',
                // text: 'and easy to do anywhere, even with Node.js',
                html: passwordResetTemplate(redirectUrl)
            };
            await sgMail.send(msg);
        } catch (err) {
            throw new InternalServerErrorException('Error sending password reset token');
        }
    }
}
