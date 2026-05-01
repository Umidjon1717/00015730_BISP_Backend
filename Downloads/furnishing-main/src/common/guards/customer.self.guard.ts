import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

@Injectable()
export class CustomerSelfGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    let payload: any;
    let adminPayload: any;

    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });
    } catch (e) {
      adminPayload = this.jwtService.verify(token, {
        secret: process.env.ADMIN_ACCESS_TOKEN_KEY,
      });
    }

    // console.log(request.method);
    // console.log(payload);
    // console.log(adminPayload);

    if (adminPayload) {
      if (['DELETE', 'PUT', 'PATCH'].includes(request.method)) {
        throw new UnauthorizedException(
          'You are not authorized to perform this action',
        );
      } else {
        return true;
      }
    }

    const { id } = request.params;
    if (payload.id !== Number(id)) {
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );
    }
    request.user = payload;
    return true;
  }
}
