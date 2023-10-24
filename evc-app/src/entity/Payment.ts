import { Entity, Column, PrimaryGeneratedColumn, Index, ManyToOne, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Generated } from 'typeorm';
import { PaymentMethod } from '../types/PaymentMethod';
import { PaymentStatus } from '../types/PaymentStatus';
import { SubscriptionType } from '../types/SubscriptionType';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Subscription } from './Subscription';
import { UserCreditTransaction } from './UserCreditTransaction';

@Entity()
@Index(['userId', 'createdAt'])
@Index(['subscriptionId', 'paidAt'])
@Index(['subscriptionId', 'start'], { unique: true, where: `status = '${PaymentStatus.Paid}'` })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  @Generated('increment')
  seqId: number;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  lastUpdatedAt?: Date;

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
  @Index()
  status: PaymentStatus;

  @Column({ nullable: true })
  @Index()
  paidAt?: Date;

  @Column('date')
  start: Date;

  @Column('date')
  end: Date;

  @Column({ default: false })
  auto: boolean;

  @Column({ default: 1 })
  attempt: number;

  @ManyToOne(() => Subscription, subscription => subscription.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscriptionId', referencedColumnName: 'id' })
  subscription: Subscription;

  @Column()
  subscriptionId: string;

  @OneToOne(() => UserCreditTransaction, { nullable: true, cascade: true })
  @JoinColumn({ name: 'creditTransactionId', referencedColumnName: 'id' })
  creditTransaction: UserCreditTransaction;

  @Column('uuid', { nullable: true })
  creditTransactionId: string;
}
