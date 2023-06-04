import { Entity, Column, PrimaryGeneratedColumn, Index, Unique, OneToOne, JoinColumn, OneToMany } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionType } from '../types/SubscriptionType';
import { Payment } from './Payment';

@Entity()
@Index('idx_subscription_end_recurring', ['end', 'recurring'])
@Index('idx_subscription_userId_start_end', ['userId', 'start', 'end'])
@Index('idx_subscription_userId_createdAt', ['userId', 'createdAt'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column()
  type: SubscriptionType;

  @Column('json', { nullable: true })
  stripePaymentData: object;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column('text', { default: '{}', array: true})
  symbols: string[];

  @Column({ default: true })
  recurring: boolean;

  @Column({ type: 'int', default: 3 })
  alertDays: number;

  @Column({default: SubscriptionStatus.Provisioning})
  status: SubscriptionStatus;

  @Column({default: true})
  preferToUseBalance: boolean;

  @OneToMany(() => Payment, payment => payment.subscription, {cascade: true})
  payments: Payment[];
}

