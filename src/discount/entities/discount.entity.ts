import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('dicount')
export class Discount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'int', default: 0 })
  percent: number;

  @Column({ type: 'int' })
  product_id: number;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @OneToOne(() => Product, (product) => product.discount)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
