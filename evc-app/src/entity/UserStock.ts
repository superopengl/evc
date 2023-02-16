import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';


@Entity()
export class UserStock {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column()
  stockSymbol: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ default: 'watch' })
  action: string;
}
