import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { createApiResponse } from '../common/utils';
import { Repository } from 'typeorm';
import { PaginationDto } from '../admin/dto/pagination.dto';
import { PaymentStatus } from '../common/types/payment_status';
import { PaymentMethod } from '../common/types/payment_method';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepo: Repository<Payment>,
  ) {}

  private get stripe() {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new InternalServerErrorException('STRIPE_SECRET_KEY is not configured');
    return new Stripe(key, { apiVersion: '2026-05-27.dahlia' });
  }

  async createStripeIntent(orderId: number, amount: number) {
    const amountInCents = Math.round(amount * 100);
    const intent = await this.stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      metadata: { orderId: String(orderId) },
    });

    await this.paymentRepo.save({
      orderId,
      amount,
      payment_method: PaymentMethod.Card,
      payment_date: new Date(),
      status: PaymentStatus.PENDING,
    });

    return createApiResponse(200, 'Payment intent created', {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
    });
  }

  async confirmStripePayment(orderId: number, paymentIntentId: string) {
    const intent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

    if (intent.status !== 'succeeded') {
      throw new BadRequestException(`Payment not completed. Status: ${intent.status}`);
    }

    const payment = await this.paymentRepo.findOne({ where: { orderId } });
    if (payment) {
      await this.paymentRepo.update(payment.id, { status: PaymentStatus.COMPLETED });
    } else {
      await this.paymentRepo.save({
        orderId,
        amount: intent.amount / 100,
        payment_method: PaymentMethod.Card,
        payment_date: new Date(),
        status: PaymentStatus.COMPLETED,
      });
    }

    return createApiResponse(200, 'Payment confirmed successfully', { orderId });
  }

  async createCodPayment(orderId: number, amount: number) {
    const existing = await this.paymentRepo.findOne({ where: { orderId } });
    if (existing) {
      await this.paymentRepo.update(existing.id, {
        payment_method: PaymentMethod.Cash,
        status: PaymentStatus.PENDING,
        amount,
      });
    } else {
      await this.paymentRepo.save({
        orderId,
        amount,
        payment_method: PaymentMethod.Cash,
        payment_date: new Date(),
        status: PaymentStatus.PENDING,
      });
    }
    return createApiResponse(200, 'Cash on delivery order placed successfully', {
      orderId,
      payment_method: 'Cash',
      status: 'PENDING',
    });
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const newPayment = this.paymentRepo.create(createPaymentDto);
    await this.paymentRepo.save(newPayment);
    return createApiResponse(201, 'Payment created successfully', { newPayment });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;
    const calculatedSkip = (page - 1) * limit;
    const total = await this.paymentRepo.count();
    const payment = await this.paymentRepo.find({
      relations: ['order'],
      skip: calculatedSkip,
      take: limit,
    });
    return createApiResponse(200, 'List of payment retrieved successfully', {
      payment,
      total,
      limit,
      page,
    });
  }

  async findOne(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with id ${id} not found`);
    return createApiResponse(200, `Payment with id ${id} retrieved successfully`, { payment });
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const existing = await this.paymentRepo.findOne({ where: { id } });
    if (!existing) throw new NotFoundException(`Payment with id ${id} not found`);
    await this.paymentRepo.update(id, updatePaymentDto);
    const updatedPayment = await this.paymentRepo.findOne({ where: { id } });
    return createApiResponse(200, 'Payment updated successfully', { updatedPayment });
  }

  async remove(id: number) {
    const payment = await this.paymentRepo.findOne({ where: { id } });
    if (!payment) throw new NotFoundException(`Payment with id ${id} not found`);
    await this.paymentRepo.delete(id);
    return createApiResponse(200, `Payment with id ${id} removed successfully`);
  }
}
