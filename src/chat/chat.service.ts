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
    // Находим все заявки где пользователь — блогер или бренд
    const applications = await this.appRepo.find({
      where: [{ blogger: { id: userId } }, { task: { brand: { id: userId } } }],
      relations: ['blogger', 'task', 'task.brand'],
      order: { createdAt: 'DESC' },
    });

    // Для каждой заявки берём последнее сообщение и кол-во непрочитанных
    const chats = await Promise.all(
      applications.map(async (app) => {
        // Последнее сообщение
        const lastMessage = await this.msgRepo.findOne({
          where: { application: { id: app.id } },
          relations: ['sender'],
          order: { createdAt: 'DESC' },
        });

        // Кол-во непрочитанных для текущего пользователя
        const unreadCount = await this.msgRepo.count({
          where: {
            application: { id: app.id },
            recipient: { id: userId },
            read: false,
          },
        });

        // Собеседник — если я блогер, то собеседник бренд и наоборот
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

    // Сортируем по времени последнего сообщения (новые сверху)
    return chats.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  async getMessages(appId: string, userId: string, page = 0, size = 50) {
    const app = await this.getApplicationAndValidate(appId, userId);

    // Mark incoming messages as read
    await this.msgRepo
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ read: true })
      .where(
        '"applicationId" = :appId AND "recipientId" = :uid AND read = false',
        { appId, uid: userId },
      )
      .execute();

    const [items, total] = await this.msgRepo.findAndCount({
      where: { application: { id: appId } },
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });

    return {
      content: items.map((m) => this.format(m)),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
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
    });
    await this.msgRepo.save(msg);

    void this.notificationService.send(
      recipient.fcmToken,
      sender.fullName ?? 'Новое сообщение',
      dto.content ?? '📎 Вложение',
      { type: 'NEW_MESSAGE', appId },
    );

    return this.format(msg);
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
      systemMessage: m.systemMessage,
      recipientId: m.recipient?.id,
      createdAt: m.createdAt,
    };
  }
}
