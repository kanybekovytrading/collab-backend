import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('brand_profiles')
export class BrandProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @Column({ nullable: true })
  companyName: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  websiteUrl: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  tasksCount: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ type: 'jsonb', nullable: true })
  socialAccounts: any[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
