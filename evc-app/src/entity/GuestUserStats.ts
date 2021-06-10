import { Entity, Column, PrimaryGeneratedColumn, Index, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserStatus } from '../types/UserStatus';

@Entity()
export class GuestUserStats {
  @PrimaryGeneratedColumn('uuid')
  deviceId?: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn({ nullable: true })
  @Index()
  lastNudgedAt?: Date;

  @Column('int', { default: 1 })
  count: number;
}
