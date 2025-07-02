import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Pages } from './pages.entity';
import { PageMembers } from './page_members.entity';

export enum AuthProvider {
  LOCAL = 'local',
  GOOGLE = 'google',
  KAKAO = 'kakao',
}

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  nickname: string;

  @Column()
  provider: string;

  @Column({ nullable: true })
  provider_id: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: 'USER' })
  role: string; // 'USER' | 'ADMIN'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Pages, page => page.owner)
  pages: Pages[];

  @OneToMany(() => PageMembers, member => member.user)
  pageMembers: PageMembers[];
}