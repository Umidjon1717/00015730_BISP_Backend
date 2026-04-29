import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from '../../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from '../../admin/entities/admin.entity';
import { Repository } from 'typeorm';
import { AdminJwtPayload } from '../../common/types/admin-jwt-payload';
import { Tokens } from '../../common/types';
import { compare, hash } from 'bcrypt';
import { Request, Response } from 'express';
import { CreateAdminDto } from '../../admin/dto/create-admin.dto';
import { createApiResponse } from '../../common/utils';
import { AdminSignInDto } from '../dto/admin-signin.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly adminService: AdminService,
    private readonly jwtService: JwtService,
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
  ) {}

  async adminGenerateTokens(admin: Admin): Promise<Tokens> {
    const payload: AdminJwtPayload = {
      id: admin.id,
      email: admin.email,
      is_creator: admin.is_creator,
    };
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.sign(payload, {
        secret: process.env.ADMIN_ACCESS_TOKEN_KEY,
        expiresIn: process.env.ADMIN_ACCESS_TOKEN_TIME,
      }),
      this.jwtService.sign(payload, {
        secret: process.env.ADMIN_REFRESH_TOKEN_KEY,
        expiresIn: process.env.ADMIN_REFRESH_TOKEN_TIME,
      }),
    ]);
    return { access_token, refresh_token };
  }

  async updateRefreshToken(adminId: number, refresh_token: string) {
    const hashed_refresh_token = await hash(refresh_token, 7);
    await this.adminRepo.update({ id: adminId }, { hashed_refresh_token });
  }

  async addAdmin(res: Response, createAdminDto: CreateAdminDto) {
    const admin = await this.adminService.create(createAdminDto);
    const { access_token, refresh_token } =
      await this.adminGenerateTokens(admin);

    if (!access_token && refresh_token) {
      throw new BadRequestException('Token not found');
    }
    res.cookie('admin_refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: +process.env.COOKIE_TIME,
    });
    const newAdmin = {
      id: admin.id,
      email: admin.email,
      phone: admin.phone_number,
      is_creator: admin.is_creator,
      full_name: admin.full_name,
    };

    await this.updateRefreshToken(admin.id, refresh_token);
    return createApiResponse(201, 'Admin added successfully', {
      newAdmin,
      access_token,
    });
  }

  async adminSignIn(res: Response, adminSignInDto: AdminSignInDto) {
    const { password, email } = adminSignInDto;
    const admin = await this.adminRepo.findOne({ where: { email } });
    if (!admin) {
      throw new UnauthorizedException('Password or Email incorrect');
    }
    const validPassword = await compare(password, admin.hashed_password);
    if (!validPassword) {
      throw new UnauthorizedException('Password or Email incorrect');
    }
    const { access_token, refresh_token } =
      await this.adminGenerateTokens(admin);
    res.cookie('admin_refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: +process.env.COOKIE_TIME,
    });
    const response = {
      id: admin.id,
      access_token,
    };
    await this.updateRefreshToken(admin.id, refresh_token);
    return createApiResponse(200, 'Admin signed in successfully', response);
  }

  async handleRefreshToken(res: Response, req: Request) {
    const { id: userId, admin_refresh_token: refreshToken } = req['user'];

    const admin = await this.adminRepo.findOne({ where: { id: +userId } });
    console.log(admin);

    if (!admin || !admin.hashed_refresh_token) {
      throw new BadRequestException('Admin not found');
    }

    const rMatchesh = await compare(refreshToken, admin.hashed_refresh_token);
    if (!rMatchesh) {
      throw new ForbiddenException('Access denied');
    }

    const decodedToken = await this.jwtService.decode(refreshToken);
    if (!decodedToken) {
      throw new UnauthorizedException('Token expired');
    }
    const { access_token, refresh_token } =
      await this.adminGenerateTokens(admin);
    res.cookie('admin_refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: +process.env.COOKIE_TIME,
    });
    const response = {
      id: admin.id,
      access_token,
    };
    await this.updateRefreshToken(admin.id, refresh_token);
    return createApiResponse(200, 'Token refreshed successfully', response);
  }

  async adminSignOut(res: Response, req: Request) {
    const { id: adminId, admin_refresh_token: refreshToken } = req['user'];

    if (!adminId || !refreshToken) {
      throw new UnauthorizedException('No valid user data in request');
    }

    const result = await this.adminRepo.update(+adminId, {
      hashed_refresh_token: null,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Admin not found');
    }

    res.clearCookie('admin_refresh_token');
    return createApiResponse(200, 'Admin signout successfully', {
      id: adminId,
    });
  }
}
