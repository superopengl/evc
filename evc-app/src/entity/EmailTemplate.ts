import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Locale } from '../types/Locale';



@Entity()
export class EmailTemplate {
  @PrimaryColumn()
  key: string;

  @PrimaryColumn({ default: Locale.Engish })
  locale: Locale;

  @Column({nullable: true})
  subject: string;

  @Column({nullable: true})
  body: string;

  @Column('text', { array: true, default: '{}' })
  vars: string[];
}

