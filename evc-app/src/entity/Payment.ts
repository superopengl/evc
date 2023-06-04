import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { PaymentStatus } from '../types/PaymentStatus';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Subscription } from './Subscription';
import { UserBalanceTransaction } from './UserBalanceTransaction';

@Entity()
@Index(['userId', 'createdAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  amount: number;

  @Column({ nullable: true })
  method: PaymentMethod;

  @Column('json', { nullable: true })
  rawRequest: object;

  @Column('json', { nullable: true })
  rawResponse: object;

  @Column()
  status: PaymentStatus;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ default: false })
  auto: boolean;

  @Column({ default: 1 })
  attempt: number;

  @ManyToOne(() => Subscription, subscription => subscription.payments)
  subscription: Subscription;

  @OneToOne(() => UserBalanceTransaction, { nullable: true, cascade: true })
  @JoinColumn()
  balanceTransaction: UserBalanceTransaction;
}
