import { Column, PrimaryGeneratedColumn, Entity, Index } from 'typeorm';


@Entity()
export class TaskComment {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  @Index()
  taskId: string;

  @Column('uuid')
  senderId: string;

  @Column()
  content: string;
}
