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
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { OnlineStatusService } from './online-status.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/ws' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private typingTimers = new Map<string, NodeJS.Timeout>();

  constructor(
    private jwtService: JwtService,
    private cfg: ConfigService,
    private chatService: ChatService,
    private onlineStatus: OnlineStatusService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) { client.disconnect(); return; }

      const payload = this.jwtService.verify(token, {
        secret: this.cfg.get('JWT_SECRET', 'secret'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) { client.disconnect(); return; }

      (client as any).user = user;
      this.onlineStatus.setOnline(user.id);
      client.broadcast.emit('user:online', { userId: user.id });
      console.log('[WS] Connected:', user.id, user.fullName);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const user = (client as any).user as User;
    if (user) {
      this.onlineStatus.setOffline(user.id);
      await this.userRepo.update(user.id, { lastSeenAt: new Date() });
      client.broadcast.emit('user:offline', {
        userId: user.id,
        lastSeenAt: new Date(),
      });
    }
    console.log('[WS] Disconnected:', user?.id ?? client.id);
  }

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

  @SubscribeMessage('chat')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: {
      applicationId: string;
      content: string;
      attachmentUrl?: string;
      attachmentType?: string;
    },
  ) {
    const user = (client as any).user as User;
    if (!user) return;
    try {
      const msg = await this.chatService.sendMessage(data.applicationId, user, data);
      this.server.to(`chat:${data.applicationId}`).emit('message', msg);
      return msg;
    } catch (e) {
      client.emit('error', { message: e.message });
    }
  }

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

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket) {
    const user = (client as any).user as User;
    if (!user) return;
    this.onlineStatus.setOnline(user.id);
    client.emit('pong');
  }
}
