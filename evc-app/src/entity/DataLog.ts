import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class DataLog {
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn()
  @Index()
  createdAt?: Date;

  @Column()
  @Index()
  by: string;

  @Column('uuid')
  @Index()
  eventId: string;

  @Column()
  @Index()
  eventType: string;

  @Column({ default: 'info' })
  @Index()
  level?: string;

  @Column({ type: 'json', nullable: true })
  data: any;
}
