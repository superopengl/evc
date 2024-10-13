import { Entity, PrimaryColumn, Column } from 'typeorm';


@Entity()
export class OptionPutCallStockOrdinal {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('uuid')
  tag: string;

  @Column('smallint', { default: 0 })
  ordinal: number;
}
