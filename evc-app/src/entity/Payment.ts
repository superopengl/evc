import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
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

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @Column('uuid')
  userId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  amount: number;

  @Column({ nullable: true })
  method: PaymentMethod;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripePaymentMethodId?: string;

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
  @JoinColumn({name: 'balanceTransactionId', referencedColumnName: 'id'})
  balanceTransaction: UserBalanceTransaction;

  @Column('uuid', {nullable: true})
  balanceTransactionId: string;
}
