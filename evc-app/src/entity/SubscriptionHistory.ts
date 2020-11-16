import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity()
@Index('idx_user_subscription_history2', ['userId', 'createdAt'])
export class SubscriptionHistory {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column('uuid')
  @Index()
  subscriptionId: string;

  @Column()
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column()
  subscriptionType: string;

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
