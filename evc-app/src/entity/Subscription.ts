import { Entity, Column, PrimaryGeneratedColumn, Index, Unique } from 'typeorm';
import { SubscriptionType } from '../types/SubscriptionType';




@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column()
  subscriptionType: SubscriptionType;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ nullable: true })
  stockSymbol: string;

  @Column('uuid')
  paymentMethod: string;

  @Column({ default: true })
  recurring: boolean;

  @Column({ type: 'int', default: 7 })
  alertDays: number;
}

