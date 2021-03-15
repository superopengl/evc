import { Entity, Column, PrimaryColumn, Index } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class UnusalOptionActivityIndices {
  @Column()
  @Index()
  symbol: string;

  @Column('date')
  @Index()
  time: string;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  price: number;

  @Column()
  @Index()
  type: 'Put' | 'Call';

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  strike: number;

  @PrimaryColumn('date')
  @Index()
  expDate: string;

  @Column('int')
  dte: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  midpoint: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  ask: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  last: number;

  @Column('int')
  volume: number;

  @Column('int')
  openInt: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  voloi: number;

  @Column('decimal', { transformer: new ColumnNumericTransformer() })
  iv: number;
}
