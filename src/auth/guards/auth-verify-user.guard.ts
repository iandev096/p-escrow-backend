import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtPayload } from '../jwt-payload.interface';

@Injectable()
export class AuthVerifyUserGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    
    const userVerified = (user.verification.emailVerified ?? user.verification.contactNumberVerified);
    if (userVerified) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
