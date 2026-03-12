import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../database/entities/user.entity';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Public()
  @Get('user/:userId')
  @ApiOperation({ summary: 'Отзывы о пользователе' })
  async getByUser(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('page') page = 0,
    @Query('size') size = 20,
  ) {
    return apiResponse(
      await this.reviewsService.getByUser(userId, +page, +size),
    );
  }

  @ApiBearerAuth()
  @Get('can-review/:applicationId')
  @ApiOperation({ summary: 'Проверить, можно ли оставить отзыв' })
  async canReview(
    @CurrentUser() user: User,
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
  ) {
    return apiResponse(
      await this.reviewsService.canReview(user, applicationId),
    );
  }

  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Оставить отзыв' })
  async create(@CurrentUser() user: User, @Body() dto: any) {
    return apiResponse(
      await this.reviewsService.create(user, dto),
      'Review saved',
    );
  }
}
