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
      const token = client.handshake.headers.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }
      const payload = this.jwtService.verify(token, { secret: this.cfg.get('JWT_SECRET', 'secret') });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) { client.disconnect(); return; }
      (client as any).user = user;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    // cleanup if needed
  }

  @SubscribeMessage('chat')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { applicationId: string; content: string; attachmentUrl?: string; attachmentType?: string },
  ) {
    const user = (client as any).user;
    if (!user) return;

    const msg = await this.chatService.sendMessage(data.applicationId, user, data);
    this.server.to(`chat:${data.applicationId}`).emit('message', msg);
    return msg;
  }

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() appId: string) {
    client.join(`chat:${appId}`);
  }
}
