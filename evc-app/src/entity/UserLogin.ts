import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity()
export class UserLogin {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  ipAddress: string;

  @Column()
  userAgent: string;
}
