import { Entity, Column, PrimaryGeneratedColumn, Index, OneToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';
import { Payment } from './Payment';

@Entity()
@Index('idx_userBalanceTransaction_user_createdAt', ['userId', 'createdAt'])
export class UserBalanceTransaction {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: true })
  amountBeforeRollback: number;
}
