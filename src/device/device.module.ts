import { Body, Controller, Delete, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { apiResponse } from '../common/dto/api-response';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@ApiTags('Device')
@ApiBearerAuth()
@Controller('device')
export class DeviceController {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  @Put('fcm-token')
  @ApiOperation({ summary: 'Обновить FCM token устройства' })
  async updateFcmToken(@CurrentUser() user: User, @Body() dto: { token: string }) {
    await this.userRepo.update(user.id, { fcmToken: dto.token });
    return apiResponse(null, 'FCM token updated');
  }

  @Delete('fcm-token')
  @ApiOperation({ summary: 'Удалить FCM token (logout / отписка от уведомлений)' })
  async deleteFcmToken(@CurrentUser() user: User) {
    await this.userRepo.update(user.id, { fcmToken: null });
    return apiResponse(null, 'FCM token removed');
  }
}

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [DeviceController],
})
export class DeviceModule {}
