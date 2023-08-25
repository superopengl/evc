import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class EmailSentOutLog {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column()
  email: string;

  @Column()
  templateKey: string;

  @Column('json')
  vars: any;

  @Column()
  result: 'sent' | 'error';
}
