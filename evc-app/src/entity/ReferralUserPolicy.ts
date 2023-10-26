import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
export class ReferralUserPolicy {
  @PrimaryColumn('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column('uuid')
  by: string;
}
