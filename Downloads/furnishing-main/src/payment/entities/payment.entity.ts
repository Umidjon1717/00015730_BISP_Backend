import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { PaymentStatus } from '../../common/types/payment_status';
import { PaymentMethod } from '../../common/types/payment_method';

@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  orderId: number;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.Card })
  payment_method: PaymentMethod;

  @Column({ type: 'timestamp' })
  payment_date: Date;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @OneToOne(() => Order, (order) => order.order_details)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
