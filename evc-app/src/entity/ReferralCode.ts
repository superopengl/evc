import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn } from 'typeorm';


@Entity()
export class ReferralCode {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  @Index()
  userId: string;
}

