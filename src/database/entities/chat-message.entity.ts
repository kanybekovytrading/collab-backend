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
import { ChatMessageStatus } from '../../chat/chat-message-status.enum';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Application)
  @JoinColumn()
  application: Application;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  sender: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  recipient: User;

  @Column({ nullable: true, type: 'text' })
  content: string;

  @Column({ nullable: true })
  attachmentUrl: string;

  @Column({ nullable: true })
  attachmentType: string;

  @Column({ default: false })
  read: boolean;

  @Column({ default: false })
  systemMessage: boolean;

  @Column({
    type: 'enum',
    enum: ChatMessageStatus,
    default: ChatMessageStatus.SENT,
  })
  status: ChatMessageStatus;

  @CreateDateColumn()
  createdAt: Date;
}
