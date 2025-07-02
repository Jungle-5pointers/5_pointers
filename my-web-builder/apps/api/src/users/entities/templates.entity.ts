import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './users.entity';

@Entity('templates')
export class Templates {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users)
  @JoinColumn({ name: 'authorId' })
  author: Users;

  @Column()
  authorId: number;

  @Column()
  name: string;

  @Column()
  category: string; // 'wedding', 'events', 'portfolio', etc.

  @Column({ nullable: true })
  thumbnail_url: string;

  @Column({ type: 'json' })
  content: any; // 컴포넌트 배열

  @Column({ type: 'json', nullable: true })
  tags: string[]; // 검색용 태그

  @Column({ default: true })
  isPublic: boolean; // 공개/비공개

  @Column({ default: 0 })
  usageCount: number; // 사용 횟수

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}