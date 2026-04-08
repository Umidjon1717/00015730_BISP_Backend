import {
  createParamDecorator,
  ExecutionContext,
  NotFoundException,
} from '@nestjs/common';

export const RefreshTokenFromCookie = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const cookies = request.cookies;

    const refreshToken = cookies?.admin_refresh_token;
    if (!refreshToken) {
      throw new NotFoundException('Refresh token is missing from cookies');
    }
    return refreshToken;
  },
);
