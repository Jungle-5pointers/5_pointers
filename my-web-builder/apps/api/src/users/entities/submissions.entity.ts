import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn } from 'typeorm';
import { Pages } from './pages.entity';

@Entity('submissions')
export class Submissions {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => Pages, page => page.submissions, { onDelete: 'CASCADE' })
  page: Pages;

  @Column({ name: 'pageId' })
  pageId: string;

  @Column()
  component_id: string;

  @Column({ type: 'json' })
  data: any;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
} 