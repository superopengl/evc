import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';




@Entity()
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  subscriptionType: string;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ nullable: true })
  stockSymbol: string;

  @Column('uuid')
  paymentMethod: string;

  @Column({ default: true })
  recurring: boolean;

  @Column({ type: 'int', default: 7 })
  alertDays: number;
}

