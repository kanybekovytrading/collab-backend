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
import { Task } from './task.entity';

export enum ApplicationStatus {
  PENDING = 'PENDING',
  IN_WORK = 'IN_WORK',
  SUBMITTED = 'SUBMITTED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  blogger: User;

  @ManyToOne(() => Task, { eager: true })
  @JoinColumn()
  task: Task;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.PENDING })
  status: ApplicationStatus;

  @Column({ nullable: true, type: 'text' })
  coverLetter: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  proposedPrice: number;

  @Column({ default: false })
  invited: boolean;

  @Column({ nullable: true, type: 'text' })
  workUrl: string;

  @Column({ nullable: true, type: 'text' })
  revisionComment: string;

  @Column({ default: 0 })
  revisionCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
