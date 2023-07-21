import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class ReferralGlobalPolicy {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  @Index()
  createdAt?: Date;

  @Column({ nullable: true })
  description?: string;

  @Column()
  start: Date;

  @Column({ nullable: true })
  end?: Date;

  @Column({ default: false })
  active: boolean;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  amount: number;

  @Column('uuid')
  by: string;
}
