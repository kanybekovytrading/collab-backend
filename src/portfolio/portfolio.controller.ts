import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../database/entities/user.entity';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Portfolio')
@Controller('')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  @Public()
  @Get('portfolio/feed')
  @ApiOperation({ summary: 'Лента портфолио для Discover (контент + блогер)' })
  async getFeed(@Query() query: any) {
    return apiResponse(await this.portfolioService.getFeed(query));
  }

  @Public()
  @Get('bloggers/:userId/portfolio')
  @ApiOperation({ summary: 'Получить портфолио блогера' })
  async getPortfolio(@Param('userId', ParseUUIDPipe) userId: string) {
    return apiResponse(await this.portfolioService.getPortfolio(userId));
  }

  @ApiBearerAuth()
  @Post('profile/portfolio')
  @ApiOperation({ summary: 'Добавить элемент в портфолио' })
  async add(@CurrentUser() user: User, @Body() dto: any) {
    return apiResponse(await this.portfolioService.add(user.id, dto));
  }

  @ApiBearerAuth()
  @Delete('profile/portfolio/:itemId')
  @ApiOperation({ summary: 'Удалить элемент из портфолио' })
  async delete(
    @CurrentUser() user: User,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    await this.portfolioService.delete(user.id, itemId);
    return apiResponse(null, 'Item deleted');
  }

  @ApiBearerAuth()
  @Put('profile/portfolio/reorder')
  @ApiOperation({ summary: 'Изменить порядок элементов портфолио' })
  async reorder(@CurrentUser() user: User, @Body() dto: { orderedIds: string[] }) {
    return apiResponse(await this.portfolioService.reorder(user.id, dto.orderedIds));
  }
}
