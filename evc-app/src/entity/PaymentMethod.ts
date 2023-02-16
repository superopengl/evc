import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity()
export class PaymentMethod {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('uuid')
  type: string;

  @Column('json')
  info: object;

  @Column()
  isActive: boolean;
}
