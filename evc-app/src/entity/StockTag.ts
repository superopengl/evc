import { Entity, Column, Index, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';


@Entity()
@Unique('idx_stock_tag_name', ['name'])
export class StockTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  @Index()
  name: string;

  @Column({ default: false })
  officialOnly: boolean;
}

