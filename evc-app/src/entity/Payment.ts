import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, OneToOne } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { PaymentStatus } from '../types/PaymentStatus';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Subscription } from './Subscription';
import { UserBalanceTransaction } from './UserBalanceLog';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @OneToOne(() => UserBalanceTransaction)
  balanceTransaction: UserBalanceTransaction;

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
}
