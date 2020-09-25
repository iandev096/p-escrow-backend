import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const GetJWT = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.jwt;
});