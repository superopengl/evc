import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class DiscountGlobalPolicy {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  @Index()
  createdAt?: Date;

  @Column({ nullable: true })
  description?: string;

  @Column('date')
  @Index()
  start: Date;

  @Column('date', { nullable: true })
  end?: Date;

  @Column({ default: false })
  active: boolean;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  percentage: number;

  @Column('uuid')
  by: string;
}
