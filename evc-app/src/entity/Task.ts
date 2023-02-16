import { Column, PrimaryGeneratedColumn, Entity, Index } from 'typeorm';
import { TaskStatus } from '../types/TaskStatus';
import { TaskDoc } from '../types/TaskDoc';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  lastUpdatedAt: Date;

  @Column()
  name: string;

  @Column()
  forWhom: string;

  @Column({ default: TaskStatus.TODO })
  status: TaskStatus;

  @Column('uuid')
  taskTemplateId: string;

  @Column('uuid')
  portfolioId: string;

  @Column('uuid', { nullable: true })
  agentId?: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ type: 'json' })
  fields: any;

  // @Column({ type: 'json', default: [] })
  // genDocs: GenDoc[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // uploadDocs: string[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // signDocs: string[];

  // @Column({ type: 'varchar', array: true, default: '{}' })
  // feedbackDocs: string[];

  @Column({ type: 'json', default: [] })
  docs: TaskDoc[];
}


