import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
@Entity()
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column({ default: 'system' })
  createdBy?: string;

  @Column()
  fileName: string;

  @Column()
  mime: string;

  @Column()
  location: string;

  @Column()
  md5: string;

  @Column({ nullable: true })
  lastReadAt?: Date;

  // @Column({ nullable: true })
  // signedAt?: Date;
}
