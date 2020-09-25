import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from "passport-google-oauth20";
import { ConfigService } from "@nestjs/config";
import { AuthService, Provider } from "./auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService
    ) {
        super({
            clientID: configService.get<string>('oauth.clientId'),
            clientSecret: configService.get<string>('oauth.clientSecret'),
            callbackURL: `http://${configService.get<string>('host')}:${configService.get<string>('port')}/auth/google/callback`,
            passReqToCallback: true,
            scope: ['profile', 'email']
        })
    }
    
    authenticate(req: any, options: any) {
        let serializedState = '';

        const returnPath = req.query.returnPath ?? '';

        serializedState = JSON.stringify({returnPath})
        
        super.authenticate(req, Object.assign(options, {
            state: serializedState
        }));
    }

    async validate(request: any, accessToken: any, refreshToken: string, profile: any, done: Function) {
        try {
            // console.log('profile: ', profile);
            console.log('refreshToken: ', refreshToken);
            console.log('accessToken: ', accessToken);

            const { oAuthUser, jwt } = await this.authService.validateOAuthLogin(
                profile.displayName,
                profile.emails[0].value,
                Provider.GOOGLE,
                profile.photos[0].value,
                profile.emails[0].value
            );
            request.jwt = jwt;
            return done(null, oAuthUser);
        } catch (err) {
            return done(err, false);
        }
    }
}