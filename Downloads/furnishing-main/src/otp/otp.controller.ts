import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Otp } from './entities/otp.entity';
import { Response } from 'express';

@ApiTags('Otp')
@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Otp' })
  @ApiResponse({
    status: 201,
    description: 'Otp successfully created. ',
    type: Otp,
  })
  create(@Body() createOtpDto: CreateOtpDto) {
    return this.otpService.create(createOtpDto);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify an OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP successfully verified.',
    type: VerifyOtpDto,
  })
  @HttpCode(HttpStatus.OK)
  verifyOtp(
    @Body() verifyOtpDto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.otpService.verifyOtp(verifyOtpDto,res);
  }
}
