import { Injectable, Logger } from '@nestjs/common';
import Expo, { ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly expo = new Expo();

  async send(
    token: string | null | undefined,
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    if (!token || !Expo.isExpoPushToken(token)) return;

    try {
      const message: ExpoPushMessage = {
        to: token,
        title,
        body,
        data: data ?? {},
        sound: 'default',
        priority: 'high',
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
}
