import { Entity, Column, PrimaryGeneratedColumn, Index, Unique, CreateDateColumn, ManyToOne } from 'typeorm';
import { ManyToMany, JoinTable } from 'typeorm-plus';
import { StockUserCustomTag } from './StockUserCustomTag';


@Entity()
@Unique('idx_user_symbol', ['userId', 'symbol'])
export class StockWatchList {
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  symbol: string;

  @Column('uuid')
  userId: string;

  @Column({ default: true })
  belled: boolean;

  @ManyToMany(() => StockUserCustomTag, tag => tag.stockInWatchList)
  @JoinTable()
  tags: StockUserCustomTag[];
}
