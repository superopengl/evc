import { Entity, Column, Index, PrimaryGeneratedColumn } from 'typeorm';


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
