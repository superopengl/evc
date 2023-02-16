import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  amount: number;

  @Column('json')
  rawResponse: object;

  @Column('uuid')
  paymentType: string;

  @Column('json')
  info: object;

  @Column()
  ipAddress: string;

  @Column()
  status: string;

  @Column()
  auto: boolean;
}
