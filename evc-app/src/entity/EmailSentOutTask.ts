import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, DeleteDateColumn, Index, IsNull, Not } from 'typeorm';


@Entity()
export class EmailSentOutTask {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  createdAt: Date;

  @Index()
  @Column({ nullable: true })
  sentAt: Date;

  @Column()
  to: string;

  @Column()
  from: string;

  @Column()
  template: string;

  @Column('json')
  vars: object;

  @Column('json', { nullable: true })
  attachments: object;

  @Column({ default: true })
  shouldBcc: boolean;

  @Column('int', { default: 0 })
  failedCount: number;
}
