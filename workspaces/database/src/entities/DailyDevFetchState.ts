import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class DailyDevFetchState {
  @PrimaryColumn()
  key!: string;

  @Column()
  lastFetchedAt!: string;
}
