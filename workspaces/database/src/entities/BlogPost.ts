import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { BlogFile } from "./BlogFile";

@Entity()
export class BlogPost {
  @PrimaryColumn()
  id!: string;

  @Column()
  title!: string;

  @Column()
  timestamp!: string;

  @Column()
  author!: string;

  @Column("simple-array")
  tags!: string[];

  @Column()
  description!: string;

  @Column("text")
  content!: string;

  @Column()
  gitUrl!: string;

  @Column()
  dailyDevUrl!: string;

  @Column()
  externalUrl!: string;

  @OneToMany(() => BlogFile, (file) => file.post, { cascade: true })
  files!: BlogFile[];
}
