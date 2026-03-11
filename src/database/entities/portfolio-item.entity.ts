import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { BloggerProfile } from './blogger-profile.entity';

@Entity('portfolio_items')
export class PortfolioItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => BloggerProfile, (b) => b.portfolioItems)
  @JoinColumn()
  blogger: BloggerProfile;

  @Column()
  mediaUrl: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  contentType: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;
}
