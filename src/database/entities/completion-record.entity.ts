import {
  Entity,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Application } from './application.entity';

@Entity('completion_records')
export class CompletionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Application)
  @JoinColumn()
  application: Application;

  @CreateDateColumn()
  completedAt: Date;
}
