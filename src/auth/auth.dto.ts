import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  BLOGGER = 'BLOGGER',
  AI_CREATOR = 'AI_CREATOR',
  BRAND = 'BRAND',
  ADMIN = 'ADMIN',
}

export class RegisterDto {
  @ApiProperty() @IsNotEmpty() @IsString() fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @MinLength(8) password: string;
  @ApiProperty({ enum: Role }) @IsEnum(Role) role: Role;
  @ApiProperty({ required: false }) @IsOptional() @IsString() phone?: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsNotEmpty() password: string;
}

export class RefreshDto {
  @ApiProperty() @IsNotEmpty() @IsString() refreshToken: string;
}

export class OAuthDto {
  @ApiProperty() @IsNotEmpty() @IsString() firebaseToken: string;
  @ApiProperty({ enum: Role }) @IsEnum(Role) role: Role;
}

export class InstagramLoginDto {
  @ApiProperty() @IsNotEmpty() @IsString() code: string;
  @ApiProperty() @IsNotEmpty() @IsString() redirectUri: string;
  @ApiProperty({ enum: Role }) @IsEnum(Role) role: Role;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@gmail.com' }) @IsEmail() email: string;
  @ApiProperty({ example: 'randomchik' }) @IsNotEmpty() password: string;
}
