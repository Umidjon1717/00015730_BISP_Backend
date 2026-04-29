import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('order_addresses')
export class OrderAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  customer_id: number;

  @Column({ type: 'varchar' })
  region: string;

  @Column({ type: 'varchar' })
  district: string;

  @Column({ type: 'varchar' })
  street: string;

  @Column()
  zip_code: number;

  @Column({ type: 'varchar', nullable: true })
  additional_info?: string;

  @OneToMany(() => Order, (order) => order.order_address)
  orders: Order[];

  @ManyToOne(() => Customer, (customer) => customer.order_addresses)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;
}
