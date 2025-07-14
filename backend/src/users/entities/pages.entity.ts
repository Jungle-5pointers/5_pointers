import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Users } from './users.entity';
import { PageMembers } from './page_members.entity';
import { Submissions } from './submissions.entity';

// PageStatus Enum 추가
export enum PageStatus {
  DRAFT = 'DRAFT',
  DEPLOYED = 'DEPLOYED',
}

@Entity('pages')
export class Pages {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.pages, { onDelete: 'CASCADE' })
  owner: Users;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ unique: true })
  subdomain: string;

  @Column()
  title: string;

  @Column({ type: 'json', nullable: true })
  content: any;

  @Column({ type: 'enum', enum: ['desktop', 'mobile'], default: 'desktop' })
  editingMode: 'desktop' | 'mobile'; // 편집 기준 (데스크톱/모바일)

  @Column({
    type: 'enum',
    enum: PageStatus,
    default: PageStatus.DRAFT,
  })
  status: PageStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'deployed_at', nullable: true })
  deployedAt: Date;

  @OneToMany(() => PageMembers, (member) => member.page)
  members: PageMembers[];

  @OneToMany(() => Submissions, (submission) => submission.page)
  submissions: Submissions[];
}
