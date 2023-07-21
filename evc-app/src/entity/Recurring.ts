import { Column, PrimaryColumn, Entity, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  lastUpdatedAt?: Date;

  @Column()
  nameTemplate: string;

  @Column('uuid')
  taskTemplateId: string;

  @Column('uuid')
  portfolioId: string;

  @Column()
  cron: string;

  @Column({nullable: true})
  dueDay: number;
}


