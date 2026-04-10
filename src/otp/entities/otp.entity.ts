import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Otp {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column()
  otp: string;

  @Column('date')
  expiration_time: Date;

  @Column({ type: 'boolean', default: false })
  verified: boolean;

  @Column()
  email: string;
}
