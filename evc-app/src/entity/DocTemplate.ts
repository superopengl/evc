import { Column, PrimaryColumn, Entity, Index } from 'typeorm';


@Entity()
export class DocTemplate {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  @Index({ unique: true })
  name: string;

  @Column({default: ''})
  description: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  @Index()
  lastUpdatedAt: Date;

  @Column({ type: 'text' })
  md: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  variables: string[];
}
