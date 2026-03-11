import { Body, Controller, Post, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User, Role } from '../database/entities/user.entity';
import { IsEnum } from 'class-validator';
import { apiResponse } from '../common/dto/api-response';

class AddRoleDto {
  @IsEnum(Role) role: Role;
}
class SwitchRoleDto {
  @IsEnum(Role) role: Role;
}

@ApiTags('Profile')
@ApiBearerAuth()
@Controller('profile')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('role')
  @ApiOperation({ summary: 'Добавить роль' })
  async addRole(@CurrentUser() user: User, @Body() dto: AddRoleDto) {
    return apiResponse(await this.usersService.addRole(user.id, dto.role));
  }

  @Put('role/switch')
  @ApiOperation({ summary: 'Переключить активную роль' })
  async switchRole(@CurrentUser() user: User, @Body() dto: SwitchRoleDto) {
    return apiResponse(await this.usersService.switchRole(user.id, dto.role));
  }
}
