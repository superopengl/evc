import { Entity, PrimaryColumn, Column } from 'typeorm';


@Entity()
export class OptionPutCallStockOrdinal {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('uuid')
  tag: string;

  @Column('smallint', { nullable: true })
  ordinal: number;
}
