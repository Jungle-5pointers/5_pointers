import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Users } from './users.entity';
import { PageMembers } from './page_members.entity';
import { Submissions } from './submissions.entity';

@Entity('pages')
export class Pages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, user => user.pages, { onDelete: 'CASCADE' })
  owner: Users;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ unique: true })
  subdomain: string;

  @Column()
  title: string;

  @Column({ type: 'longblob', nullable: true })
  content: Buffer;

  @Column({ default: 'DRAFT' })
  status: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PageMembers, member => member.page)
  members: PageMembers[];

  @OneToMany(() => Submissions, submission => submission.page)
  submissions: Submissions[];
} 