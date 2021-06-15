import { Entity, Column, PrimaryGeneratedColumn, Unique, CreateDateColumn, OneToMany } from 'typeorm';
import { StockWatchList } from './StockWatchList';


@Entity()
@Unique('idx_user_stock_custom_tag_userId_name', ['userId', 'name'])
export class StockUserCustomTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column()
  name: string;

  @OneToMany(() => StockWatchList, w => w.tags)
  stockInWatchList: StockWatchList[];
}
