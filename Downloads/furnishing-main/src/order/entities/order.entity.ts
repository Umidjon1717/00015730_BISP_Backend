import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '../../common/types/order_status';
import { OrderDetail } from '../../order_detail/entities/order_detail.entity';
import { Payment } from '../../payment/entities/payment.entity';
import { OrderAddress } from '../../order_addresses/entities/order_address.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('order')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  customerId: number;

  @Column({ type: 'int' })
  orderAddressId: number;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.NEW })
  status: OrderStatus;

  @Column({ type: 'float', default: 0 })
  total_price: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  order_date: Date;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  order_details: OrderDetail[];

  @OneToOne(() => Payment, (payment) => payment.order)
  payment: Payment;

  @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => OrderAddress, (orderAddress) => orderAddress.orders, {
    nullable: true,
  })
  @JoinColumn({ name: 'orderAddressId' })
  order_address: OrderAddress;
}
