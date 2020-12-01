import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

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
}
