import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity()
export class StockSearch {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  @Index()
  symbol: string;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  by: string;

  @Column()
  ipAddress: string;

  @Column('json', {nullable: true})
  country: object;

  @Column('json', {nullable: true})
  userAgent: object;
}
