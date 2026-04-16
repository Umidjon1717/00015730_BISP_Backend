import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  private get botToken(): string | undefined {
    return process.env.TELEGRAM_BOT_TOKEN;
  }

  private get chatId(): string | undefined {
    return process.env.TELEGRAM_CHAT_ID;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  private async sendRaw(message: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing. Skipping send.',
      );
      return false;
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    await axios.post(url, {
      chat_id: this.chatId,
      text: message,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
    return true;
  }

  async sendContactMessage(payload: {
    name: string;
    email: string;
    message: string;
  }): Promise<boolean> {
    const text = [
      '<b>New Contact Message</b>',
      '',
      `<b>Name:</b> ${this.escapeHtml(payload.name)}`,
      `<b>Email:</b> ${this.escapeHtml(payload.email)}`,
      `<b>Message:</b> ${this.escapeHtml(payload.message)}`,
    ].join('\n');

    return this.sendRaw(text);
  }

  async sendOrderMessage(payload: {
    orderId: number;
    customerId: number;
    totalPrice: number;
    itemCount: number;
  }): Promise<boolean> {
    const text = [
      '<b>New Order Created</b>',
      '',
      `<b>Order ID:</b> ${payload.orderId}`,
      `<b>Customer ID:</b> ${payload.customerId}`,
      `<b>Total Price:</b> ${payload.totalPrice}`,
      `<b>Items:</b> ${payload.itemCount}`,
    ].join('\n');

    return this.sendRaw(text);
  }

  async sendOrderCancelledMessage(payload: {
    orderId: number;
    customerId: number;
    totalPrice: number;
  }): Promise<boolean> {
    const text = [
      '<b>Order Cancelled</b>',
      '',
      `<b>Order ID:</b> ${payload.orderId}`,
      `<b>Customer ID:</b> ${payload.customerId}`,
      `<b>Total Price:</b> ${payload.totalPrice}`,
    ].join('\n');

    return this.sendRaw(text);
  }
}
