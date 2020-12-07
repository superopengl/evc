import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Locale } from '../types/Locale';



@Entity()
export class EmailSignature {
  @PrimaryColumn()
  key: string;

  @PrimaryColumn({ default: Locale.Engish })
  locale: Locale;

  @Column()
  content: string;
}
