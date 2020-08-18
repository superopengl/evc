import { Column, PrimaryColumn, Entity } from 'typeorm';

@Entity()
export class Recurring {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

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

  @Column()
  lastUpdatedAt: Date;
}


