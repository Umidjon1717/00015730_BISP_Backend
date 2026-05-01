import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CartDetail } from '../../cart_detail/entities/cart_detail.entity';
import { Product } from '../../product/entities/product.entity';
import { Customer } from '../../customer/entities/customer.entity';

@Entity('cart')
export class Cart {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  customer_id: number;

  @Column({ type: 'int' })
  total_price: number;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Column({ type: 'date' })
  time: Date;

  @OneToOne(() => Customer, (customer) => customer.cart)
  customer: Customer;

  @OneToMany(() => CartDetail, (cart_details) => cart_details.cart)
  cart_details: CartDetail[];
}
