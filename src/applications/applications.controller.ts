import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private appsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Подать заявку на задание' })
  async apply(@CurrentUser() user: User, @Body() dto: any) {
    return apiResponse(await this.appsService.apply(user, dto));
  }

  @Post('invite')
  @ApiOperation({ summary: 'Пригласить блогера на задание' })
  async invite(@CurrentUser() user: User, @Body() dto: any) {
    await this.appsService.invite(user, dto);
    return apiResponse(null, 'Blogger invited');
  }

  @Get('my')
  @ApiOperation({ summary: 'Мои заявки (для блогера)' })
  async getMy(
    @CurrentUser() user: User,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return apiResponse(await this.appsService.getMy(user.id, +page, +size));
  }

  @Get('task/:taskId')
  @ApiOperation({ summary: 'Заявки на задание (для бренда)' })
  async getByTask(
    @CurrentUser() user: User,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return apiResponse(
      await this.appsService.getByTask(user, taskId, +page, +size),
    );
  }

  @Put(':id/accept')
  @ApiOperation({ summary: 'Принять заявку' })
  async accept(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.appsService.accept(user, id);
    return apiResponse(null, 'Application accepted');
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Отклонить заявку' })
  async reject(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.appsService.reject(user, id);
    return apiResponse(null, 'Application rejected');
  }

  @Put(':id/cancel')
  @ApiOperation({ summary: 'Отменить заявку' })
  async cancel(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.appsService.cancel(user, id);
    return apiResponse(null, 'Application cancelled');
  }

  @Put(':id/submit')
  @ApiOperation({ summary: 'Сдать работу' })
  async submit(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    await this.appsService.submit(user.id, id, dto);
    return apiResponse(null, 'Work submitted');
  }

  @Put(':id/revision')
  @ApiOperation({ summary: 'Запросить доработку' })
  async revision(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    await this.appsService.requestRevision(user, id, dto);
    return apiResponse(null, 'Revision requested');
  }

  @Put(':id/approve')
  @ApiOperation({ summary: 'Принять финальную работу' })
  async approve(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.appsService.approve(user, id);
    return apiResponse(null, 'Collaboration completed');
  }
}
