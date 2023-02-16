import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class StockSearch {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  symbol: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt: Date;

  @Column({ type: 'uuid', nullable: true })
  by: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;
}
