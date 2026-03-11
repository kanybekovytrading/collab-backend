import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessage } from '../database/entities/chat-message.entity';
import { Application } from '../database/entities/application.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage) private msgRepo: Repository<ChatMessage>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
  ) {}

  private async getApplicationAndValidate(appId: string, userId: string) {
    const app = await this.appRepo.findOne({
      where: { id: appId },
      relations: ['blogger', 'task', 'task.brand'],
    });
    if (!app) throw new NotFoundException('Application not found');
    const isParticipant = app.blogger.id === userId || app.task.brand.id === userId;
    if (!isParticipant) throw new ForbiddenException('Not a participant');
    return app;
  }

  async getMessages(appId: string, userId: string, page = 0, size = 50) {
    const app = await this.getApplicationAndValidate(appId, userId);

    // Mark incoming messages as read
    await this.msgRepo
      .createQueryBuilder()
      .update(ChatMessage)
      .set({ read: true })
      .where('"applicationId" = :appId AND "recipientId" = :uid AND read = false', {
        appId,
        uid: userId,
      })
      .execute();

    const [items, total] = await this.msgRepo.findAndCount({
      where: { application: { id: appId } },
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });

    return {
      content: items.map(m => this.format(m)),
      page, size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
    };
  }

  async sendMessage(appId: string, sender: User, dto: any) {
    const app = await this.getApplicationAndValidate(appId, sender.id);
    const recipientId =
      app.blogger.id === sender.id ? app.task.brand.id : app.blogger.id;

    const msg = this.msgRepo.create({
      application: app,
      sender,
      recipient: { id: recipientId } as User,
      content: dto.content,
      attachmentUrl: dto.attachmentUrl,
      attachmentType: dto.attachmentType,
    });
    await this.msgRepo.save(msg);
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
