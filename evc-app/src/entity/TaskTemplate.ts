import { Column, PrimaryColumn, Entity, Index } from 'typeorm';

@Entity()
export class TaskTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  lastUpdatedAt: Date;

  @Column({type: 'varchar', array: true, default: '{}'})
  docTemplateIds: string[];

  @Column({ type: 'json' })
  fields: any;
}
