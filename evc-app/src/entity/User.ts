import { Entity, Column, PrimaryGeneratedColumn, Index, PrimaryColumn, JoinColumn, OneToOne, IsNull, Not } from 'typeorm';
import { Role } from '../types/Role';
import { UserStatus } from '../types/UserStatus';
import { DeleteDateColumn } from 'typeorm-plus'
import { UserProfile } from './UserProfile';


@Entity()
@Index('user_email_hash_unique', { synchronize: false })
export class User {
  static scope = {
    'default': {
      deletedAt: IsNull()
    },
    'all': {
      deletedAt: Not(IsNull())
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ default: () => `timezone('UTC', now())` })
  createdAt?: Date;

  // @Index('user_email_unique', { unique: true })
  /**
   * The unique index of user_email_unique will be created by migration script,
   * as TypeOrm doesn't support case insensitive index.
   */
  @Column()
  emailHash!: string;


  @Column({ default: 'local' })
  loginType: string;

  @Column()
  secret!: string;

  @Column({ type: 'uuid' })
  salt!: string;

  @Column({ nullable: false })
  @Index()
  role!: Role;

  @Column({ nullable: true })
  lastLoggedInAt?: Date;

  @Column({ nullable: true })
  lastNudgedAt?: Date;

  @Column({ default: UserStatus.Enabled })
  status!: UserStatus;

  @Index('user_resetPasswordToken_unique', { unique: true })
  @Column({ type: 'uuid', nullable: true })
  resetPasswordToken?: string;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToOne(() => UserProfile)
  @JoinColumn({ name: 'profileId', referencedColumnName: 'id' })
  profile: UserProfile;

  @Column()
  profileId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index({ where: `"everPaid" = TRUE` })
  referredBy: string;

  @Column({ default: false })
  everPaid: boolean;
}


