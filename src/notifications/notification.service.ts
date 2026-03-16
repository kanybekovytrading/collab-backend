import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async send(fcmToken: string | null | undefined, title: string, body: string, data?: Record<string, string>) {
    if (!fcmToken) return;

    try {
      await admin.messaging().send({
        token: fcmToken,
        notification: { title, body },
        data: data ?? {},
        apns: { payload: { aps: { sound: 'default', badge: 1 } } },
        android: { priority: 'high', notification: { sound: 'default' } },
      });
    } catch (e) {
      this.logger.warn(`Push failed for token ${fcmToken?.slice(0, 20)}...: ${e.message}`);
    }
  }

  async sendToMany(fcmTokens: string[], title: string, body: string, data?: Record<string, string>) {
    const valid = fcmTokens.filter(Boolean);
    if (!valid.length) return;
    await Promise.all(valid.map((token) => this.send(token, title, body, data)));
  }
}
