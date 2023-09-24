import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, OneToMany } from 'typeorm';
import { ColumnNumericTransformer } from '../utils/ColumnNumericTransformer';

@Entity()
export class CommissionWithdrawal {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;

  @Column('uuid')
  @Index()
  userId: string;

  @Column()
  givenName: string;

  @Column()
  surname: string;

  @Column()
  citizenship: string;

  @Column()
  country: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  identityType: 'id' | 'passport' | 'driver';

  @Column()
  identityNumber: string;

  @Column()
  payPalAccount: string;

  @Column('uuid', { array: true })
  files: string[];

  @Column('decimal', { transformer: new ColumnNumericTransformer(), nullable: false })
  amount: number;

  @Column({ default: 'submitted' })
  @Index()
  status: 'submitted' | 'rejected' | 'done';

  @Column('uuid', { nullable: true })
  @Index()
  handledBy: string;

  @Column({ nullable: true })
  @Index()
  handledAt: Date;

  @Column({ nullable: true })
  comment: string;
}

