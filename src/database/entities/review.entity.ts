import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Application } from './application.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  author: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  target: User;

  @ManyToOne(() => Application)
  @JoinColumn()
  application: Application;

  @Column({ type: 'decimal', precision: 2, scale: 1 })
  rating: number;

  @Column({ nullable: true, type: 'text' })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}
