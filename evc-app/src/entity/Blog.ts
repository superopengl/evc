import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column()
  lastUpdatedAt: Date;

  @Column({ type: 'varchar', array: true, default: '{}' })
  files: string[];

  @Column()
  title: string;

  @Column()
  md: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  tags: string[];
}
