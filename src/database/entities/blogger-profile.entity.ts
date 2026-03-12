import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PortfolioItem } from './portfolio-item.entity';

@Entity('blogger_profiles')
export class BloggerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ nullable: true, type: 'text' })
  bio: string;

  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  minPrice: number;

  @Column({ default: false })
  worksWithBarter: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  completedTasksCount: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ type: 'jsonb', nullable: true })
  socialAccounts: any[];

  @Column({ nullable: true })
  age: number;

  @OneToMany(() => PortfolioItem, (item) => item.blogger)
  portfolioItems: PortfolioItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
