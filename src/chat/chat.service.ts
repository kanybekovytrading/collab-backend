/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// chat.service.ts
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../database/entities/chat-message.entity';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';
import { NotificationService } from '../notifications/notification.service';
import { ChatMessageStatus } from './chat-message-status.enum';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private msgRepo: Repository<ChatMessage>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
    private readonly notificationService: NotificationService,
  ) {}

  private async getApplicationAndValidate(appId: string, userId: string) {
    const app = await this.appRepo.findOne({
      where: { id: appId },
      relations: ['blogger', 'task', 'task.brand'],
    });
    if (!app) throw new NotFoundException('Application not found');
    const isParticipant =
      app.blogger.id === userId || app.task.brand.id === userId;
    if (!isParticipant) throw new ForbiddenException('Not a participant');
    return app;
  }

  // ── Список всех чатов пользователя (как Instagram Direct) ──────────────
  async getMyChats(userId: string) {
    const applications = await this.appRepo.find({
      where: [{ blogger: { id: userId } }, { task: { brand: { id: userId } } }],
      relations: ['blogger', 'task', 'task.brand'],
      order: { createdAt: 'DESC' },
    });

    const validApps = applications.filter(
      (app) => app.blogger && app.task && app.task.brand,
    );

    const chats = await Promise.all(
      validApps.map(async (app) => {
        const lastMessage = await this.msgRepo.findOne({
          where: { application: { id: app.id } },
          relations: ['sender'],
          order: { createdAt: 'DESC' },
        });

        const unreadCount = await this.msgRepo.count({
          where: {
            application: { id: app.id },
            recipient: { id: userId },
            read: false,
          },
        });

        const isBlogger = app.blogger.id === userId;
        const participant = isBlogger
          ? {
              id: app.task.brand.id,
              fullName: app.task.brand.fullName,
              avatarUrl: (app.task.brand as any).avatarUrl ?? null,
            }
          : {
              id: app.blogger.id,
              fullName: app.blogger.fullName,
              avatarUrl: app.blogger.avatarUrl ?? null,
            };

        return {
          applicationId: app.id,
          taskTitle: app.task.title,
          taskId: app.task.id,
          status: app.status,
          participant,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                senderId: lastMessage.sender?.id,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
          updatedAt: lastMessage?.createdAt ?? app.createdAt,
        };
      }),
    );

    return chats.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async getMessages(
    appId: string,
    userId: string,
    page = 0,
    size = 30,
    before?: string,
  ) {
    await this.getApplicationAndValidate(appId, userId);

    await this.markAsRead(appId, userId);

    const qb = this.msgRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.recipient', 'recipient')
      .where('m.applicationId = :appId', { appId })
      .orderBy('m.createdAt', 'DESC')
      .take(size);

    if (before) {
      const cursor = await this.msgRepo.findOne({ where: { id: before } });
      if (cursor) {
        qb.andWhere('m.createdAt < :cursorDate', {
          cursorDate: cursor.createdAt,
        });
      }
    } else {
      qb.skip(page * size);
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      content: items.map((m) => this.format(m)),
      nextCursor: items.length === size ? items[items.length - 1].id : null,
      hasMore: items.length === size,
      totalElements: total,
    };
  }

  async sendMessage(
    appId: string,
    sender: User,
    dto: { content?: string; attachmentUrl?: string; attachmentType?: string },
  ) {
    const app = await this.getApplicationAndValidate(appId, sender.id);
    const recipient =
      app.blogger.id === sender.id ? app.task.brand : app.blogger;

    const msg = this.msgRepo.create({
      application: app,
      sender,
      recipient: { id: recipient.id } as User,
      content: dto.content,
      attachmentUrl: dto.attachmentUrl,
      attachmentType: dto.attachmentType,
      status: ChatMessageStatus.SENT,
    });
    await this.msgRepo.save(msg);

    void this.notificationService.send(
      recipient?.fcmToken,
      sender.fullName ?? 'Новое сообщение',
      dto.content ?? '📎 Вложение',
      { type: 'NEW_MESSAGE', appId },
      recipient.id,
    );

    return this.format(msg);
  }

  async markAsRead(appId: string, userId: string) {
    await this.msgRepo
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ read: true, status: ChatMessageStatus.READ })
      .where(
        '"applicationId" = :appId AND "recipientId" = :uid AND read = false',
        { appId, uid: userId },
      )
      .execute();
  }

  async markAsDelivered(appId: string, userId: string) {
    await this.msgRepo
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ status: ChatMessageStatus.DELIVERED })
      .where(
        '"applicationId" = :appId AND "recipientId" = :uid AND status = :status',
        { appId, uid: userId, status: ChatMessageStatus.SENT },
      )
      .execute();
  }

  format(m: ChatMessage) {
    return {
      id: m.id,
      senderId: m.sender?.id,
      senderName: m.sender?.fullName,
      senderAvatar: m.sender?.avatarUrl,
      content: m.content,
      attachmentUrl: m.attachmentUrl,
      attachmentType: m.attachmentType,
      read: m.read,
      status: m.status || ChatMessageStatus.SENT,
      systemMessage: m.systemMessage,
      recipientId: m.recipient?.id,
      createdAt: m.createdAt,
    };
  }
}
