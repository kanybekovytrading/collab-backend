import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { Public } from '../common/decorators/public.decorator';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Social')
@Controller('social')
export class SocialController {
  constructor(private socialService: SocialService) {}

  @Public()
  @Get('validate')
  @ApiOperation({ summary: 'Валидация аккаунта соц. сети' })
  async validate(@Query('platform') platform: string, @Query('username') username?: string) {
    return apiResponse(await this.socialService.validate(platform, username));
  }

  @Public()
  @Get('oauth/:platform/connect')
  @ApiOperation({ summary: 'Получить OAuth URL для подключения соц. сети' })
  async connect(@Param('platform') platform: string) {
    return apiResponse(this.socialService.getOAuthUrl(platform));
  }

  @Public()
  @Get('oauth/:platform/callback')
  @ApiOperation({ summary: 'OAuth callback' })
  async callback(
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') state: string,
  ) {
    return this.socialService.handleCallback(platform, code, state);
  }
}
