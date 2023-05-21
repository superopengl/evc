import { Entity, Column, PrimaryColumn, Index, PrimaryGeneratedColumn, Unique, ManyToMany, JoinTable, ManyToOne } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';


@Entity()
export class Stock {
  @PrimaryColumn()
  symbol: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column()
  company: string;

  @Column({ nullable: true })
  market: string;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  peLo: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  peHi: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  value: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  supportPriceLo: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  supportPriceHi: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  pressurePriceLo: number;

  @Column('decimal', {transformer: new ColumnNumericTransformer()})
  pressurePriceHi: number;

  @Column('uuid')
  by: string;

  @Column({ default: false })
  isPublished: boolean;
}

// @Entity()
// export class Stock {
//   @PrimaryColumn()
//   symbol: string;

//   @Column({ default: () => `timezone('UTC', now())` })
//   createdAt?: Date;

//   @Column()
//   company: string;

//   @ManyToMany(type => StockTag, { onDelete: 'CASCADE' })
//   @JoinTable()
//   tags: string[];
// }

@Entity()
export class StockTag {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column()
  name: string;

  @Column()
  color: string;
}

// @Entity()
// @Index('idx_stockSupport_symbol_createAt', ['symbol', 'createdAt'])
// export class StockSupport {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ default: () => `timezone('UTC', now())` })
//   createdAt?: Date;

//   @Column('uuid')
//   symbol: string;

//   @Column('uuid')
//   author: string;

//   @Column('decimal', {transformer: new ColumnNumericTransformer(), nullable: true})
//   lo: number;

//   @Column('decimal', {transformer: new ColumnNumericTransformer(), nullable: true})
//   hi: number;
// }

// @Entity()
// @Index('idx_stockResistance_symbol_createAt', ['symbol', 'createdAt'])
// export class StockResistance {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ default: () => `timezone('UTC', now())` })
//   createdAt?: Date;

//   @Column('uuid')
//   symbol: string;

//   @Column('uuid')
//   author: string;

//   @Column('decimal', {transformer: new ColumnNumericTransformer(), nullable: true})
//   lo: number;

//   @Column('decimal', {transformer: new ColumnNumericTransformer(), nullable: true})
//   hi: number;
// }

// @Entity()
// @Index('idx_stockEps_symbol_year_quarter', ['symbol', 'year', 'quarter'])
// export class StockEps {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ default: () => `timezone('UTC', now())` })
//   createdAt?: Date;

//   @Column('uuid')
//   symbol: string;

//   @Column('uuid')
//   author: string;

//   @Column('smallint')
//   year: number;

//   @Column('smallint')
//   quarter: number;

//   @Column('decimal', {transformer: new ColumnNumericTransformer()})
//   value: number;
// }

// @Entity()
// @Index('idx_stockPe_symbol_createAt', ['symbol', 'createdAt'])
// export class StockPe {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ default: () => `timezone('UTC', now())` })
//   createdAt?: Date;

//   @Column('uuid')
//   symbol: string;

//   @Column('uuid')
//   author: string;

//   @Column('decimal', {transformer: new ColumnNumericTransformer(), nullable: true})
//   lo: number;

//   @Column('decimal', {transformer: new ColumnNumericTransformer(), nullable: true})
//   hi: number;
// }

// @Entity()
// @Index('idx_stockFairValue_symbol_createAt', ['symbol', 'createdAt'])
// export class StockValue {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column({ default: () => `timezone('UTC', now())` })
//   createdAt?: Date;

//   @Column('uuid')
//   symbol: string;

//   @Column('uuid')
//   author: string;

//   @Column('decimal', {transformer: new ColumnNumericTransformer(), nullable: true})
//   lo: number;

//   @Column('decimal', {transformer: new ColumnNumericTransformer(), nullable: true})
//   hi: number;

//   @Column({default: false})
//   special: boolean;
// }

// export class StockPublish {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column({ default: () => `timezone('UTC', now())` })
//   createdAt?: Date;

//   @Column('uuid')
//   symbol: string;

//   @Column('uuid')
//   author: string;

//   @ManyToOne(() => StockSupport)
//   support: StockSupport;

//   @ManyToOne(() => StockResistance)
//   resistance: StockResistance;

//   @ManyToOne(() => StockValue)
//   value: StockValue;
// }
