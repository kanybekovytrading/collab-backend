import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import { ApplicationsModule } from './applications/applications.module';
import { ChatModule } from './chat/chat.module';
import { MediaModule } from './media/media.module';
import { SocialModule } from './social/social.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { BloggersModule } from './bloggers/bloggers.module';
import { BrandsModule } from './brands/brands.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { DeviceModule } from './device/device.module';
import { NotificationModule } from './notifications/notification.module';
import { databaseEntities } from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService): TypeOrmModuleOptions => {
        const databaseUrl = cfg.get<string>('DATABASE_URL');
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            ssl: { rejectUnauthorized: false },
            entities: databaseEntities,
            synchronize: true,
            logging: true,
          };
        }
        return {
          type: 'postgres',
          host: cfg.get<string>('DB_HOST', 'localhost'),
          port: +cfg.get<string>('DB_PORT', '4444'),
          username: cfg.get<string>('DB_USERNAME', 'postgres'),
          password: cfg.get<string>('DB_PASSWORD', 'postgres'),
          database: cfg.get<string>('DB_NAME', 'owner'),
          entities: databaseEntities,
          synchronize: true,
          logging: true,
        };
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    TasksModule,
    ApplicationsModule,
    ChatModule,
    MediaModule,
    SocialModule,
    ReviewsModule,
    AdminModule,
    BloggersModule,
    BrandsModule,
    PortfolioModule,
    DeviceModule,
    NotificationModule,
  ],
})
export class AppModule {}
