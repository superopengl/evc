import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  createdAt?: Date;

  @Column('uuid')
  createdBy: string;

  @Column()
  fileName: string;

  @Column()
  mime: string;

  @Column()
  location: string;

  @Column()
  md5: string;
}

