import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class ReferralUserPolicy {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column({ nullable: true })
  description?: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ default: true })
  active: boolean;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  amount: number;
}
