import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderDetail } from '../../order_detail/entities/order_detail.entity';
import { Likes } from '../../like/entities/like.entity';
import { Review } from '../../review/entities/review.entity';
import { ProductDetail } from '../../productDetail/entities/productDetail.entity';
import { Rating } from '../../rating/entities/rating.entity';
import { Category } from '../../category/entities/category.entity';
import { Discount } from '../../discount/entities/discount.entity';
import { CartDetail } from '../../cart_detail/entities/cart_detail.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'category_id', type: 'int' })
  categoryId: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 1000 })
  description: string;

  @Column({ type: 'float', default: 0 })
  price: number;

  @Column({ name: 'average_rating', type: 'int', default: 0 })
  averageRating: number;

  @Column({ type: 'int' })
  stock: number;

  @Column({ type: 'simple-array', nullable: true })
  colors: string[];

  @Column({ type: 'varchar', nullable: true, unique: true })
  sku: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'boolean', default: false })
  is_liked: boolean;

  @OneToMany(() => Likes, (like) => like.product)
  likes: Likes[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
  orderDetails: OrderDetail[];

  @OneToMany(() => CartDetail, (cartDetail) => cartDetail.product)
  cart_details: CartDetail[];

  @OneToMany(() => Rating, (rating) => rating.product)
  ratings: Rating[];

  @OneToOne(() => ProductDetail, (productDetail) => productDetail.product)
  productDetail: ProductDetail;

  @Column({ type: 'simple-array', nullable: true })
  images: string[];

  @OneToOne(() => Discount, (discount) => discount.product)
  discount: Discount;

  @ManyToOne(() => Category, (category) => category.products, {
    nullable: true,
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;
}
