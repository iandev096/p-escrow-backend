import { Controller, Get, UseGuards, Res, InternalServerErrorException, Post, Body, ValidationPipe, Query, UsePipes, Req, Patch } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { GetJWT } from '../decorators/get-jwt.decorator';
import { AuthCredentialDto, EmailDto, VerifyTokenDto, UserIdDto, PasswordDto } from '../dto/auth.dto';
import { AuthService } from '../auth.service';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { AuthVerifyUserGuard } from '../guards/auth-verify-user.guard';
import { TokenVerificationType } from '../auth.enum';
import { OauthGuard } from '../guards/oauth.guard';


@Controller('auth')
export class AuthController {

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService
    ) {}

    @Get('google')
    @UseGuards(OauthGuard)
    googleLogin() {
        // initiates Google OAuth2 callback
    }

    @Get('google/callback')
    @UseGuards(OauthGuard)
    googleLoginCallback(
        @Query('state') state: string,
        @Res() res: any,
        @GetUser() user: User,
        @GetJWT() jwt: string
    ) {
        // handles the Google OAuth2 callback
        const feUrlDomain = this.configService.get('feUrl');
        const returnPath = JSON.parse(state).returnPath ?? '';
        
        console.log(user);
        
        if (jwt) {
            res.redirect(`${feUrlDomain}/home/?jwt=${jwt}&returnPath=${returnPath}`);
        } else {
            res.redirect(`${feUrlDomain}/auth/login/failure`);
        }
    }

    @Get('login/success/:jwt') 
    loginSuccess() {
        console.log('LOGIN success: ');
    }

    @Get('login/failure')
    loginFailure(
        // @Req() req: any
    ) {
        console.log('LOGIN failure');
        throw new InternalServerErrorException();
    }

    @Get('protected')
    @UseGuards(AuthGuard('jwt'), AuthVerifyUserGuard)
    protectedResource(
        @GetUser() user: User,
        @GetJWT() jwt: string
    ) {
        return { protected: true }
    }

    @Post('signup')
    async signup(@Body(ValidationPipe) authCredentialDto: AuthCredentialDto) {
        return await this.authService.signup(authCredentialDto);
    }

    @Post('signin')
    async signin(@Body(ValidationPipe) authCredentialDto: AuthCredentialDto) {
        return await this.authService.signin(authCredentialDto);
    }

    @Post('reset-password')
    async resetPassword(@Body(ValidationPipe) { email }: EmailDto) {
        return await this.authService.resetPassword(email);
    }

    @Patch('verify-user')
    async verifyUser(@Query(ValidationPipe) { userId }: UserIdDto) {
        return await this.authService.verifyUserAccount(userId);
    }

    @Patch('verify-email-token')
    @UsePipes(new ValidationPipe())
    async verifyEmailToken(@Query() { email, token }: VerifyTokenDto) {
        return await this.authService.verifyUserToken(
            email,
            TokenVerificationType.EMAIL,
            token
        );
    }

    @Get('verify-password-token')
    async verifyPasswordToken(@Query() { email, token }: VerifyTokenDto, @Body() { password }: PasswordDto) {
        return await this.authService.verifyUserToken(
            email,
            TokenVerificationType.PASSWORD,
            token,
            password
        );
    }
}
