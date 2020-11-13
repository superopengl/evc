import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity()
export class UserLogin {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ default: () => `timezone('UTC', now())` })
  @Index()
  createdAt?: Date;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  loginMethod: string;

  @Column()
  ipAddress: string;

  @Column('json', { nullable: true })
  location: object;

  @Column('json', { nullable: true })
  userAgent: object;
}
