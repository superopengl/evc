import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity()
@Index('idx_user_login', ['userId', 'createdAt'])
export class UserLogin {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
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
