import { Entity, Column, PrimaryGeneratedColumn, Index, Unique } from 'typeorm';


@Entity()
@Unique('idx_user_symbol', ['userId', 'symbol'])
export class StockWatchList {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  symbol: string;

  @Column('uuid')
  userId: string;
}
