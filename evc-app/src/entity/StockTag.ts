import { Entity, Column, Index, PrimaryGeneratedColumn, Unique, CreateDateColumn } from 'typeorm';


@Entity()
@Unique('idx_stock_tag_name', ['name'])
@Index('idx_symbol_includeoptioncallput_true', ['id', 'includesOptionPutCall'])
export class StockTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  name: string;

  @Column({ default: false })
  builtIn: boolean;

  @Column({ default: false })
  officialOnly: boolean;

  @Column({ default: false })
  includesOptionPutCall: boolean;

  @Column({ default: 999999 })
  sortGroup: number;
}

