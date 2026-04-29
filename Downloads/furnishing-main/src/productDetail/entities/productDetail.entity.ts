import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('product_detail')
export class ProductDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer', nullable: false })
  productId: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  with: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  heght: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  depth: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  weight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  seatHeight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: false })
  legHeight: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  countryOrigin: string;

  @Column({ type: 'integer', nullable: false })
  capacity: number;

  @Column({ type: 'integer', nullable: false })
  warranty: number;

  @Column({ type: 'integer', nullable: false })
  maxLoadCapacity: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  material: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  fillingMaterial: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  upholsteryMaterial: string;

  @OneToOne(() => Product, (product) => product.productDetail)
  product: Product;
}
