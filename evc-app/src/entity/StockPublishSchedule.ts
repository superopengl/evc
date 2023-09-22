import { Entity, Column, PrimaryColumn, Index } from 'typeorm';


@Entity()
export class StockPublishSchedule {
  @PrimaryColumn()
  symbol: string;

  @PrimaryColumn()
  @Index()
  publishedAt: Date;

  @Column({ default: false })
  published: boolean;
}
