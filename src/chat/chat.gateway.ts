/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// chat.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/ws' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private typingTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private jwtService: JwtService,
    private cfg: ConfigService,
    private chatService: ChatService,
    @InjectRepository(User) private userRepo: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.cfg.get('JWT_SECRET', 'secret'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        client.disconnect();
        return;
      }

      (client as any).user = user;
      await this.cacheManager.set(`online:${user.id}`, true, 30000);
      client.broadcast.emit('user:online', { userId: user.id });
      console.log('[WS] Connected:', user.id, user.fullName);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = (client as any).user as User;
    if (user) {
      await this.cacheManager.del(`online:${user.id}`);
      await this.userRepo.update(user.id, { lastSeenAt: new Date() });
      client.broadcast.emit('user:offline', {
        userId: user.id,
        lastSeenAt: new Date(),
      });
    }
    console.log('[WS] Disconnected:', user?.id ?? client.id);
  }

  // ── Вступить в комнату чата ─────────────────────────────────────────────
  @SubscribeMessage('join')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { applicationId: string } | string,
  ) {
    const appId = typeof data === 'string' ? data : data.applicationId;
    const user = (client as any).user as User;

    client.join(`chat:${appId}`);
    console.log('[WS] User', user?.id, 'joined chat:', appId);

    if (user && typeof data === 'object') {
      await this.chatService.markAsDelivered(appId, user.id);
      this.server.to(`chat:${appId}`).emit('delivered', {
        applicationId: appId,
        deliveredAt: new Date(),
        userId: user.id,
      });
    }
  }

  // ── Отправить сообщение ─────────────────────────────────────────────────
  @SubscribeMessage('chat')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: {
      applicationId: string;
      content: string;
      attachmentUrl?: string;
      attachmentType?: string;
    },
  ) {
    const user = (client as any).user as User;
    if (!user) return;

    try {
      const msg = await this.chatService.sendMessage(
        data.applicationId,
        user,
        data,
      );

      this.server.to(`chat:${data.applicationId}`).emit('message', msg);
      return msg;
    } catch (e) {
      client.emit('error', { message: e.message });
    }
  }

  // ── Read receipts ────────────────────────────────────────────────────────
  @SubscribeMessage('read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { applicationId: string },
  ) {
    const user = (client as any).user as User;
    if (!user || !data?.applicationId) return;

    await this.chatService.markAsRead(data.applicationId, user.id);

    this.server.to(`chat:${data.applicationId}`).emit('read', {
      applicationId: data.applicationId,
      readAt: new Date(),
      userId: user.id,
    });
  }

  // ── Typing indicator ────────────────────────────────────────────────────
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { applicationId: string },
  ) {
    const user = (client as any).user as User;
    if (!user || !data?.applicationId) return;

    const key = `${user.id}:${data.applicationId}`;

    const existing = this.typingTimers.get(key);
    if (existing) clearTimeout(existing);

    client.to(`chat:${data.applicationId}`).emit('typing', {
      userId: user.id,
      name: user.fullName,
      isTyping: true,
    });

    const timer = setTimeout(() => {
      client.to(`chat:${data.applicationId}`).emit('typing', {
        userId: user.id,
        name: user.fullName,
        isTyping: false,
      });
      this.typingTimers.delete(key);
    }, 3000);

    this.typingTimers.set(key, timer);
  }

  // ── Ping для поддержания онлайн статуса ─────────────────────────────────
  @SubscribeMessage('ping')
  async handlePing(@ConnectedSocket() client: Socket & { user?: User }) {
    const user = client.user;
    if (!user) return;
    await this.cacheManager.set(`online:${user.id}`, true, 30000);
    client.emit('pong');
  }
}
