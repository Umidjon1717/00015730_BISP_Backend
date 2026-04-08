import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class CustomerRefreshTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const refresh_token = request.cookies?.refresh_token;
    if (!refresh_token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const verifyToken = this.jwtService.decode(refresh_token);
    if (!verifyToken) {
      throw new ForbiddenException('Token expired');
    }
    verifyToken['refresh_token'] = refresh_token;
    request.user = verifyToken;

    return true;
  }
}
