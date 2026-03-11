import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { databaseEntities } from './database/entities';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: +cfg.get('DB_PORT', 5432),
        username: cfg.get('DB_USERNAME', 'postgres'),
        password: cfg.get('DB_PASSWORD', 'postgres'),
        database: cfg.get('DB_NAME', 'collab'),
        entities: databaseEntities,
        synchronize: true, // use migrations in production
        logging: false,
      }),
    }),
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
  ],
})
export class AppModule {}
