import { Entity, Column, PrimaryGeneratedColumn, Index, Unique, CreateDateColumn, ManyToOne } from 'typeorm';
import { StockUserCustomTag } from "./StockUserCustomTag";


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

  @Column({default: true})
  belled: boolean;

  @ManyToOne(() => StockUserCustomTag)
  tags: StockUserCustomTag[];
}
