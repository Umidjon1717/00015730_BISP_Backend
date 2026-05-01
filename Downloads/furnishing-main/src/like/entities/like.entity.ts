import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Product } from '../../product/entities/product.entity';
@Entity({ name: 'like' })
export class Likes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  customerId: number;

  @Column({ type: 'int' })
  productId: number;

  @ManyToOne(() => Customer, (customer) => customer.likes, { nullable: false })
  @JoinColumn({ name: 'customerId' })
  customer: Customer;

  @ManyToOne(() => Product, (product) => product.likes)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
