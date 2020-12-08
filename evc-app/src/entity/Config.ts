import { Entity, Column, PrimaryColumn } from 'typeorm';


@Entity()
export class Config {
  @PrimaryColumn()
  key: string;

  @Column('json')
  value: any;
}
