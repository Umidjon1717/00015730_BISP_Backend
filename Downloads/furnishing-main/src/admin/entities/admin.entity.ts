import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  full_name: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  phone_number: string;

  @Column({ type: 'varchar' })
  hashed_password: string;

  @Column({ type: 'boolean', default: false, nullable: true })
  is_creator?: boolean;

  @Column({ type: 'varchar', nullable: true })
  hashed_refresh_token?: string;
}
