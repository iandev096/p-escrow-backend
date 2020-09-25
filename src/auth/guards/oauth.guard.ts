import { ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OauthGuard extends AuthGuard('google') {
  
  returnRoute: string;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // const request = context.switchToHttp().getRequest();
    // if (request.query.route) this.returnRoute = request.query.route;
    
    return super.canActivate(context);
  }
}
