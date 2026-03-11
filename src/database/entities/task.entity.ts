import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum TaskStatus {
  ACTIVE = 'ACTIVE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELETED = 'DELETED',
  MODERATION = 'MODERATION',
}

export enum TaskType {
  VIDEO = 'VIDEO',
  PHOTO = 'PHOTO',
  REELS = 'REELS',
  AI_PHOTO = 'AI_PHOTO',
  AI_TEXT = 'AI_TEXT',
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: TaskType, nullable: true })
  taskType: TaskType;

  @Column({ nullable: true })
  coverImageUrl: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: false })
  online: boolean;

  @Column({ nullable: true })
  deadlineDays: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  priceDescription: string;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.MODERATION })
  status: TaskStatus;

  @Column({ default: 0 })
  reactionsCount: number;

  @Column({ default: false })
  acceptsUgc: boolean;

  @Column({ default: false })
  acceptsAi: boolean;

  @Column({ type: 'simple-array', nullable: true })
  genderFilter: string[];

  @Column({ type: 'simple-array', nullable: true })
  categories: string[];

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  brand: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
