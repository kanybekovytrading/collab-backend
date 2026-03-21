import { Controller, Get, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Список уведомлений' })
  async getAll(
    @CurrentUser() user: User,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return apiResponse(
      await this.notificationService.getForUser(user.id, +page, +size),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Количество непрочитанных уведомлений' })
  async getUnreadCount(@CurrentUser() user: User) {
    const count = await this.notificationService.getUnreadCount(user.id);
    return apiResponse({ count });
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Отметить все уведомления как прочитанные' })
  async readAll(@CurrentUser() user: User) {
    await this.notificationService.markAllRead(user.id);
    return apiResponse(null, 'All notifications marked as read');
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  async readOne(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.notificationService.markRead(user.id, id);
    return apiResponse(null, 'Notification marked as read');
  }
}
