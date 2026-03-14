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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';

@WebSocketGateway({ cors: { origin: '*' }, namespace: '/ws' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private jwtService: JwtService,
    private cfg: ConfigService,
    private chatService: ChatService,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // ── Читаем токен из auth (socket.io-client передаёт через { auth: { token } })
      // или из Authorization header как fallback
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        console.log('[WS] No token, disconnecting', client.id);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.cfg.get('JWT_SECRET', 'secret'),
      });

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) {
        console.log('[WS] User not found, disconnecting', client.id);
        client.disconnect();
        return;
      }

      (client as any).user = user;
      console.log('[WS] Connected:', user.id, user.fullName);
    } catch (e) {
      console.log('[WS] Auth error, disconnecting', client.id, e.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = (client as any).user;
    console.log('[WS] Disconnected:', user?.id ?? client.id);
  }

  // ── Вступить в комнату чата ─────────────────────────────────────────────
  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() appId: string) {
    client.join(`chat:${appId}`);
    console.log('[WS] User', (client as any).user?.id, 'joined chat:', appId);
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

      // Отправляем всем в комнате (включая отправителя)
      this.server.to(`chat:${data.applicationId}`).emit('message', msg);

      // Возвращаем подтверждение отправителю (callback)
      return msg;
    } catch (e) {
      console.error('[WS] handleMessage error:', e.message);
      client.emit('error', { message: e.message });
    }
  }

  // ── Typing indicator ────────────────────────────────────────────────────
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { applicationId: string },
  ) {
    const user = (client as any).user as User;
    if (!user || !data?.applicationId) return;

    // Отправляем остальным участникам чата (не себе)
    client.to(`chat:${data.applicationId}`).emit('typing', {
      userId: user.id,
      name: user.fullName,
    });
  }
}
