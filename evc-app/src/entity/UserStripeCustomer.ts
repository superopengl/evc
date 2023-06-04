import { Entity, Column, PrimaryGeneratedColumn, Index, DeleteDateColumn, IsNull, Not } from 'typeorm';



@Entity()
@Index(['userId', 'customerId'])
export class UserStripeCustomer {
  static scope = {
    'default': {
      deletedAt: IsNull()
    },
    'all': {
      deletedAt: Not(IsNull())
    }
  };

  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  @Column('uuid')
  userId: string;

  @Column()
  customerId: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
