import { Entity, Column, PrimaryColumn, Index, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class UnusualOptionActivityStock {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn('date')
  @Index()
  tradeDate: string;

  @PrimaryColumn('decimal', { transformer: new ColumnNumericTransformer() })
  price: number;

  @PrimaryColumn()
  @Index()
  type: 'Put' | 'Call';

  @PrimaryColumn('decimal', { transformer: new ColumnNumericTransformer() })
  strike: number;

  @PrimaryColumn('date')
  @Index()
  expDate: string;

  @PrimaryColumn('int')
  dte: number;

  @PrimaryColumn('decimal', { transformer: new ColumnNumericTransformer() })
  bid: number;

  @PrimaryColumn('decimal', { transformer: new ColumnNumericTransformer() })
  midpoint: number;

  @PrimaryColumn('decimal', { transformer: new ColumnNumericTransformer() })
  ask: number;

  @PrimaryColumn('decimal', { transformer: new ColumnNumericTransformer() })
  last: number;

  @PrimaryColumn('int')
  @Index()
  volume: number;

  @PrimaryColumn('int')
  @Index()
  openInt: number;

  @PrimaryColumn('decimal', { transformer: new ColumnNumericTransformer() })
  @Index()
  voloi: number;

  @PrimaryColumn('decimal', { transformer: new ColumnNumericTransformer() })
  @Index()
  iv: number;
}
