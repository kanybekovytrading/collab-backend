import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { User } from '../database/entities/user.entity';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private brandsService: BrandsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Список брендов' })
  async getAll(@Query('page') page = 0, @Query('size') size = 20) {
    return apiResponse(await this.brandsService.findAll(+page, +size));
  }

  @Public()
  @Get(':userId')
  @ApiOperation({ summary: 'Профиль бренда по ID' })
  async getOne(@Param('userId') userId: string) {
    return apiResponse(await this.brandsService.findOne(userId));
  }

  @ApiBearerAuth()
  @Put()
  @ApiOperation({ summary: 'Обновить профиль бренда' })
  async update(@CurrentUser() user: User, @Body() dto: any) {
    return apiResponse(await this.brandsService.update(user.id, dto));
  }
}
