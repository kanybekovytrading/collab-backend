import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { Notification, NotificationType } from '../database/entities/notification.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly expo = new Expo();

  constructor(
    @InjectRepository(Notification)
    private notifRepo: Repository<Notification>,
  ) {}

  async send(
    token: string | null | undefined,
    title: string,
    body: string,
    data?: Record<string, string>,
    recipientId?: string,
  ) {
    // Persist to DB
    if (recipientId) {
      const notif = this.notifRepo.create({
        recipient: { id: recipientId } as User,
        type: (data?.type as NotificationType) ?? NotificationType.SYSTEM,
        title,
        body,
        data: data ?? {},
      });
      await this.notifRepo.save(notif);
    }

    if (!token || !Expo.isExpoPushToken(token)) return;

    // Get unread badge count
    let badge = 1;
    if (recipientId) {
      badge = await this.notifRepo.count({
        where: { recipient: { id: recipientId }, read: false },
      });
    }

    try {
      const message: ExpoPushMessage = {
        to: token,
        title,
        body,
        data: data ?? {},
        sound: 'default',
        priority: 'high',
        badge,
      };
      await this.expo.sendPushNotificationsAsync([message]);
    } catch (e) {
      this.logger.warn(`Push failed: ${e.message}`);
    }
  }

  async sendToMany(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    const valid = tokens.filter((t) => t && Expo.isExpoPushToken(t));
    if (!valid.length) return;

    const messages: ExpoPushMessage[] = valid.map((token) => ({
      to: token,
      title,
      body,
      data: data ?? {},
      sound: 'default',
      priority: 'high',
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (e) {
        this.logger.warn(`Push chunk failed: ${e.message}`);
      }
    }
  }

  async getForUser(userId: string, page = 0, size = 20) {
    const [items, total] = await this.notifRepo.findAndCount({
      where: { recipient: { id: userId } },
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
    return {
      content: items,
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
    };
  }

  async getUnreadCount(userId: string) {
    return this.notifRepo.count({
      where: { recipient: { id: userId }, read: false },
    });
  }

  async markRead(userId: string, id: string) {
    await this.notifRepo.update(
      { id, recipient: { id: userId } },
      { read: true },
    );
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update(
      { recipient: { id: userId }, read: false },
      { read: true },
    );
  }
}
