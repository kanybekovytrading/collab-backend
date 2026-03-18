import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../database/entities/user.entity';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Tasks')
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список активных заданий' })
  async getAll(@Query() query: any) {
    return apiResponse(await this.tasksService.findAll(query));
  }

  @ApiBearerAuth()
  @Get('my')
  @ApiOperation({ summary: 'Мои задания (для бренда)' })
  async getMy(
    @CurrentUser() user: User,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return apiResponse(
      await this.tasksService.findMyTasks(user.id, +page, +size),
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Детали задания по ID' })
  async getOne(@Param('id', ParseUUIDPipe) id: string) {
    return apiResponse(await this.tasksService.findOne(id));
  }

  @ApiBearerAuth()
  @Roles('BRAND')
  @Post()
  @ApiOperation({ summary: 'Создать задание' })
  async create(@CurrentUser() user: User, @Body() dto: any) {
    return apiResponse(await this.tasksService.create(user, dto));
  }

  @ApiBearerAuth()
  @Delete(':id')
  @ApiOperation({ summary: 'Удалить задание' })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    await this.tasksService.delete(id, user);
    return apiResponse(null, 'Task deleted');
  }
}
