import { Entity, Column, PrimaryGeneratedColumn, Index, OneToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Payment } from './Payment';

@Entity()
@Index('idx_userCreditTransaction_user_createdAt', ['userId', 'createdAt'])
export class UserCreditTransaction {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => 'now()' })
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column('uuid', {nullable: true})
  referredUserId?: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column('uuid', { nullable: true })
  revertedCreditTransactionId?: string;

  @Column()
  type: 'adjust' | 'withdrawal' | 'recurring' | 'user-pay' | 'revert' | 'commission';
}
