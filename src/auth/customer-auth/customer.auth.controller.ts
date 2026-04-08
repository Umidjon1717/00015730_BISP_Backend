import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CustomerAuthService } from './customer.auth.service';
import { Request, Response } from 'express';
import { CreateCustomerDto } from '../../customer/dto/create-customer.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CustomerSignInDto } from '../dto/customer-signin.dto';
import { CustomerRefreshTokenGuard } from '../../common/guards/customer.refreshtoken.guard';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';

@ApiTags('Customer Auth')
@Controller('customer/auth')
export class CustomerAuthController {
  constructor(private readonly customerAuthService: CustomerAuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Sign up a new customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
    type: CreateCustomerDto,
  })
  async signUp(
    @Res({ passthrough: true }) res: Response,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return await this.customerAuthService.signUp(res, createCustomerDto);
  }

  @Get('check-token')
  async checkToken(@Headers('authorization') authorization: string) {
    if (!authorization) {
      throw new BadRequestException('Authorization token is required');
    }

    const token = authorization.replace('Bearer ', '').trim();
    return this.customerAuthService.checkToken(token);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Customer signIn' })
  @ApiResponse({
    status: 200,
    description: 'Customer signed in successfully',
  })
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Res({ passthrough: true }) res: Response,
    @Body() customerSignInDto: CustomerSignInDto,
  ) {
    return this.customerAuthService.signIn(res, customerSignInDto);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerRefreshTokenGuard)
  @ApiOperation({ summary: 'Customer refresh token' })
  @ApiResponse({
    status: 200,
    description: 'Customer refresh token refreshed successfully',
  })
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  async handleRefreshToken(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.customerAuthService.handleRefreshToken(res, req);
  }

  @ApiBearerAuth()
  @UseGuards(CustomerRefreshTokenGuard)
  @ApiOperation({ summary: 'Customer logout' })
  @ApiResponse({ status: 200, description: 'Customer logged out successfully' })
  @Post('signout')
  async customerSignOut(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.customerAuthService.signOut(res, req);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Customer forgot password' })
  @ApiResponse({
    status: 200,
    description: 'Password reset code sent to email',
  })
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;
    return this.customerAuthService.forgotPassword(email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Customer reset password' })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reseted',
  })
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.customerAuthService.resetPassword(resetPasswordDto);
  }
}
