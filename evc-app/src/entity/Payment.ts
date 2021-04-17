import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { PaymentStatus } from '../types/PaymentStatus';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Subscription } from './Subscription';
import { UserCreditTransaction } from './UserCreditTransaction';

@Entity()
@Index(['userId', 'createdAt'])
@Index(['subscriptionId', 'paidAt'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  lastUpdatedAt?: Date;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  amount: number;

  @Column({ nullable: true })
  method: PaymentMethod;

  @Column({ nullable: true })
  stripeCustomerId?: string;

  @Column({ nullable: true })
  stripePaymentMethodId?: string;

  @Column({ nullable: true })
  stripeAlipayPaymentIntentId?: string;

  @Column('json', { nullable: true })
  rawResponse: object;

  @Column()
  @Index()
  status: PaymentStatus;

  @Column({nullable: true})
  @Index()
  paidAt?: Date;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ default: false })
  auto: boolean;

  @Column({ default: 1 })
  attempt: number;

  @ManyToOne(() => Subscription, subscription => subscription.payments, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'subscriptionId', referencedColumnName: 'id'})
  subscription: Subscription;

  @Column()
  subscriptionId: string;

  @OneToOne(() => UserCreditTransaction, { nullable: true, cascade: true })
  @JoinColumn({name: 'creditTransactionId', referencedColumnName: 'id'})
  creditTransaction: UserCreditTransaction;

  @Column('uuid', {nullable: true})
  creditTransactionId: string;
}
