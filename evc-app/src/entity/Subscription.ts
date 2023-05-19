import { Entity, Column, PrimaryGeneratedColumn, Index, Unique } from 'typeorm';
import { SubscriptionStatus } from '../types/SubscriptionStatus';
import { SubscriptionType } from '../types/SubscriptionType';




@Entity()
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

  @Column()
  start: Date;

  @Column({nullable: true})
  end: Date;

  @Column('text', { default: '{}', array: true})
  symbols: string[];

  @Column({ default: true })
  recurring: boolean;

  @Column({ type: 'int', default: 7 })
  alertDays: number;

  @Column()
  status: SubscriptionStatus;
}

