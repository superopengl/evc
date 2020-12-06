import { Entity, Column, PrimaryColumn, Index, DeleteDateColumn, IsNull, Not } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class ReferralUserPolicy {
  static scope = {
    'default': {
      deletedAt: IsNull()
    },
    'all': {
      deletedAt: Not(IsNull())
    }
  };

  @PrimaryColumn('uuid')
  userId: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column('uuid')
  by: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
