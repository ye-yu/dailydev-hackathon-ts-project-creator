import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BlogPost } from './BlogPost'

@Entity()
export class BlogFile {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  path!: string

  @Column()
  language!: string

  @Column('text')
  content!: string

  @ManyToOne(() => BlogPost, (post) => post.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post!: BlogPost

  @Column()
  postId!: string
}
