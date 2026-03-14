import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AdminService } from './admin.service';
import { Roles } from '../common/decorators/roles.decorator';
import { apiResponse } from '../common/dto/api-response';
import { TaskStatus } from '../database/entities/task.entity';

class VerifyTaskDto {
  @ApiProperty({ enum: TaskStatus, example: TaskStatus.ACTIVE })
  @IsEnum(TaskStatus)
  status: TaskStatus;
}

class BanUserDto {
  @ApiProperty({ example: true }) active: boolean;
  @ApiProperty({ required: false }) @IsOptional() @IsString() reason?: string;
}

class VerifyUserDto {
  @ApiProperty({ example: true }) verified: boolean;
}

class DeleteTaskDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() reason?: string;
}

@ApiTags('Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Список пользователей' })
  async getUsers(
    @Query('search') search?: string,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return apiResponse(await this.adminService.getUsers(search, +page, +size));
  }

  @Put('users/:id/ban')
  @ApiOperation({ summary: 'Заблокировать / разблокировать пользователя' })
  async banUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: BanUserDto,
  ) {
    return apiResponse(await this.adminService.banUser(id, dto.active));
  }

  @Put('users/:id/verify')
  @ApiOperation({ summary: 'Верифицировать пользователя' })
  async verifyUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyUserDto,
  ) {
    return apiResponse(await this.adminService.verifyUser(id, dto.verified));
  }

  @Get('tasks')
  @ApiOperation({ summary: 'Список заданий (для модерации)' })
  async getTasks(
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return apiResponse(
      await this.adminService.getTasks(status, search, +page, +size),
    );
  }

  @Put('tasks/:id/verify')
  @ApiOperation({ summary: 'Изменить статус задания' })
  async verifyTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyTaskDto,
  ) {
    return apiResponse(await this.adminService.verifyTask(id, dto.status));
  }

  @Put('tasks/:id/restore')
  @ApiOperation({ summary: 'Восстановить задание' })
  async restoreTask(@Param('id', ParseUUIDPipe) id: string) {
    return apiResponse(await this.adminService.restoreTask(id));
  }

  @Delete('tasks/:id')
  @ApiOperation({ summary: 'Удалить задание (модерация)' })
  async deleteTask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DeleteTaskDto,
  ) {
    await this.adminService.deleteTask(id, dto.reason);
    return apiResponse(null, 'Task deleted');
  }

  @Get('stats')
  @ApiOperation({ summary: 'Статистика платформы' })
  async getStats() {
    return apiResponse(await this.adminService.getStats());
  }
}
