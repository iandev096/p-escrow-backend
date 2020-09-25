import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UserRepository } from './repositories/user.repository';
import { EmailService } from './email.service';
import { Log } from '../shared/log/log.entity';
import { AuthVerifyUserGuard } from './guards/auth-verify-user.guard';
import { PassportModule } from '@nestjs/passport';
import { UserController } from './controllers/user.controller';

@Module({
  controllers: [
    AuthController,
    UserController
  ],
  imports: [
    TypeOrmModule.forFeature([
      UserRepository,
      Log
    ]),
    JwtModule.register({
      // use env viriables in the future
      secret: 'JesusIsGod',
      signOptions: {
        expiresIn: 3600,
      }
    }),
    PassportModule
  ],
  providers: [
    AuthService,
    EmailService,
    GoogleStrategy,
    JwtStrategy,
    AuthVerifyUserGuard
  ],
  exports: [
    JwtStrategy,
    GoogleStrategy,
    AuthVerifyUserGuard,
    PassportModule
  ]
})
export class AuthModule { }
