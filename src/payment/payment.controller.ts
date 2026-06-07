import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Payment } from './entities/payment.entity';
import { PaginationDto } from '../admin/dto/pagination.dto';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('stripe/create-intent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Create Stripe payment intent for card payment' })
  @ApiResponse({ status: 200, description: 'Returns clientSecret for Stripe Elements' })
  createStripeIntent(@Body() body: { orderId: number; amount: number }) {
    return this.paymentService.createStripeIntent(body.orderId, body.amount);
  }

  @Post('stripe/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm Stripe payment after card charge succeeds' })
  @ApiResponse({ status: 200, description: 'Payment confirmed and saved' })
  confirmStripePayment(@Body() body: { orderId: number; paymentIntentId: string }) {
    return this.paymentService.confirmStripePayment(body.orderId, body.paymentIntentId);
  }

  @Post('cod')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Place order with Cash on Delivery payment' })
  @ApiResponse({ status: 200, description: 'COD order placed successfully' })
  createCodPayment(@Body() body: { orderId: number; amount: number }) {
    return this.paymentService.createCodPayment(body.orderId, body.amount);
  }

  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payment details' })
  @ApiResponse({
    status: 200,
    description: 'List of payment details',
    type: [Payment],
  })
  findAll(@Query() paginationDto: PaginationDto) {
    return this.paymentService.findAll(paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Get payment detail by id retrived successfully',
    type: Payment,
  })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment detail by ID' })
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Payment detail updated successfully',
    type: Payment,
  })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete payment detail by ID' })
  @ApiResponse({
    status: 200,
    description: 'Removed payment detail successfully',
  })
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}
