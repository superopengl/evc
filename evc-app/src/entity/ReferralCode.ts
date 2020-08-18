import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class ReferralCode {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column({ default: 0 })
  kickback: number;

  @Column({ default: 0 })
  discountAmount: number;

  @Column({ default: 0 })
  discountPercentage: number;
}
