import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class DiscountUserPolicy {
  @PrimaryColumn('uuid')
  userId: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  percentage: number;

  @Column('uuid')
  by: string;
}
