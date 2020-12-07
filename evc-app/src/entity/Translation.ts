import { Entity, Column, PrimaryColumn } from 'typeorm';
import { Locale } from '../types/Locale';

@Entity()
export class Translation {
  @PrimaryColumn()
  key: string;

  @PrimaryColumn({ default: Locale.Engish })
  locale: Locale;

  @Column()
  value: string;
}
