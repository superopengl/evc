import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class ReferralUserPolicy {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column({ default: true })
  active: boolean;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column('uuid')
  by: string;
}
