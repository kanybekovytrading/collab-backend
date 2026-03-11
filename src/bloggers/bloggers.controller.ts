import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BloggersService } from './bloggers.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../database/entities/user.entity';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Bloggers')
@Controller('bloggers')
export class BloggersController {
  constructor(private bloggersService: BloggersService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Поиск блогеров с расширенными фильтрами' })
  async getAll(@Query() query: any) {
    return apiResponse(await this.bloggersService.findAll(query));
  }

  @Public()
  @Get(':userId')
  @ApiOperation({ summary: 'Профиль блогера по ID' })
  async getOne(@Param('userId') userId: string) {
    return apiResponse(await this.bloggersService.findOne(userId));
  }

  @ApiBearerAuth()
  @Put()
  @ApiOperation({ summary: 'Обновить профиль блогера' })
  async update(@CurrentUser() user: User, @Body() dto: any) {
    return apiResponse(await this.bloggersService.update(user.id, dto));
  }
}
