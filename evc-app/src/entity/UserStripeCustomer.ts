import { Entity, Column, PrimaryGeneratedColumn, Index, DeleteDateColumn, IsNull, Not } from 'typeorm';



@Entity()
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
  @Index()
  userId: string;

  @Column()
  @Index()
  customerId: string;

  @Column({nullable: true})
  paymentMethodId: string;

  @DeleteDateColumn()
  deletedAt: Date;
}
