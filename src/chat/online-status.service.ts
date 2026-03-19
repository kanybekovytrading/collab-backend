import { Injectable } from '@nestjs/common';

@Injectable()
export class OnlineStatusService {
  private onlineUsers = new Map<string, NodeJS.Timeout>();

  setOnline(userId: string) {
    const existing = this.onlineUsers.get(userId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.onlineUsers.delete(userId);
    }, 30000);

    this.onlineUsers.set(userId, timer);
  }

  setOffline(userId: string) {
    const existing = this.onlineUsers.get(userId);
    if (existing) clearTimeout(existing);
    this.onlineUsers.delete(userId);
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
