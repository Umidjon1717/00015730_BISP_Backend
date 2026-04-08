import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthService } from './admin.auth.service';
import { Admin } from '../../admin/entities/admin.entity';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateAdminDto } from '../../admin/dto/create-admin.dto';
import { Request, Response } from 'express';
import { AdminSignInDto } from '../dto/admin-signin.dto';
import { AdminRefreshTokenGuard } from '../../common/guards/admin-refresh-token.guard';
import { IsCreatorGuard } from '../../common/guards/creator.guard';

@ApiTags('Auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @ApiBearerAuth()
  // @UseGuards(IsCreatorGuard)
  @ApiOperation({ summary: 'Add new Admin' })
  @ApiResponse({
    status: 201,
    description: 'Admin has been created successfully',
    type: Admin,
  })
  @Post()
  async addAdmin(
    @Res({ passthrough: true }) res: Response,
    @Body() createAdminDto: CreateAdminDto,
  ) {
    return this.adminAuthService.addAdmin(res, createAdminDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Admin signIn' })
  @ApiResponse({
    status: 200,
    description: 'Admin signed in successfully',
  })
  @HttpCode(HttpStatus.OK)
  async adminSignIn(
    @Res({ passthrough: true }) res: Response,
    @Body() adminSignInDto: AdminSignInDto,
  ) {
    return this.adminAuthService.adminSignIn(res, adminSignInDto);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRefreshTokenGuard)
  @ApiOperation({ summary: 'Admin refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Admin refresh token refreshed successfully',
  })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async handleRefreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.adminAuthService.handleRefreshToken(res, req);
  }

  @ApiBearerAuth()
  @UseGuards(AdminRefreshTokenGuard)
  @ApiOperation({ summary: 'Admin logout' })
  @ApiResponse({ status: 200, description: 'Admin logged out successfully' })
  @Post('signout')
  async adminSignOut(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.adminAuthService.adminSignOut(res, req);
  }
}
