import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class DataLog {
  @PrimaryGeneratedColumn()
  id?: number;

  @CreateDateColumn()
  createdAt?: Date;

  @Column()
  by: string;

  @Column('uuid')
  eventId: string;

  @Column()
  eventType: string;

  @Column({ default: 'info' })
  level?: string;

  @Column({ type: 'json', nullable: true })
  data: any;
}
