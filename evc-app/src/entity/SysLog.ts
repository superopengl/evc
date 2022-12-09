import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class SysLog {
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn()
  @Index()
  createdAt?: Date;

  @Column({ default: 'system' })
  @Index()
  createdBy?: string;

  @Column({ default: 'error' })
  @Index()
  level?: string;

  @Column({ nullable: true })
  @Index()
  message?: string;

  @Column({ type: 'json', nullable: true })
  req: any;

  @Column({ type: 'json', nullable: true })
  res: any;

  @Column({ type: 'json', nullable: true })
  data: any;
}


