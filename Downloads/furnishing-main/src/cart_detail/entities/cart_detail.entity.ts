import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cart } from '../../cart/entities/cart.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('cart_detail')
export class CartDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  cart_id: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'int' })
  quantity: number;

  @ManyToOne(() => Product, (product) => product.cart_details)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => Cart, (cart) => cart.cart_details)
  @JoinColumn({ name: 'cart_id' })
  cart: Cart;
}
