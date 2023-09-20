import { Entity, Column, PrimaryGeneratedColumn, Index, Unique, CreateDateColumn } from 'typeorm';


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
}
