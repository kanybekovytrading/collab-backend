import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshDto, OAuthDto, InstagramLoginDto } from './auth.dto';
import { Public } from '../common/decorators/public.decorator';
import { apiResponse } from '../common/dto/api-response';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  async register(@Body() dto: RegisterDto) {
    return apiResponse(await this.authService.register(dto), 'Registered successfully');
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  async login(@Body() dto: LoginDto) {
    return apiResponse(await this.authService.login(dto), 'Logged in successfully');
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Обновить access токен' })
  async refresh(@Body() dto: RefreshDto) {
    return apiResponse(await this.authService.refresh(dto.refreshToken));
  }

  @Public()
  @Post('oauth')
  @ApiOperation({ summary: 'Вход / регистрация через Google или Apple ID' })
  async oauth(@Body() dto: OAuthDto) {
    return apiResponse(await this.authService.oauthLogin(dto));
  }

  @Public()
  @Post('instagram')
  @ApiOperation({ summary: 'Вход / регистрация через Instagram' })
  async instagram(@Body() dto: InstagramLoginDto) {
    return apiResponse(await this.authService.instagramLogin(dto));
  }
}
