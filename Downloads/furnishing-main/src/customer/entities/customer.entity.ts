import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from '../../order/entities/order.entity';
import { OrderAddress } from '../../order_addresses/entities/order_address.entity';
import { Likes } from '../../like/entities/like.entity';
import { Review } from '../../review/entities/review.entity';
import { Rating } from '../../rating/entities/rating.entity';
import { Cart } from '../../cart/entities/cart.entity';

@Entity('customer')
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  first_name: string;

  @Column({ type: 'varchar' })
  last_name: string;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_active: boolean;

  @Column({ type: 'varchar' })
  phone_number: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  hashed_password: string;

  @Column({ type: 'varchar', nullable: true })
  hashed_refresh_token: string;

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @OneToMany(() => OrderAddress, (orderAddress) => orderAddress.customer_id)
  order_addresses: OrderAddress[];

  @OneToMany(() => Likes, (like) => like.customer)
  likes: Likes[];

  @OneToMany(() => Review, (review) => review.customer)
  reviews: Review[];

  @OneToMany(() => Rating, (rating) => rating.customer)
  ratings: Rating[];

  @OneToOne(() => Cart, (cart) => cart.customer)
  cart: Cart;
}
