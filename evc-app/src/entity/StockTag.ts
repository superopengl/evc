import { Entity, Column, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';


@Entity()
@Unique('idx_stock_tag_name', ['name'])
export class StockTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column()
  @Index()
  name: string;

  @Column()
  color: string;
}
