"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const tasks_module_1 = require("./tasks/tasks.module");
const applications_module_1 = require("./applications/applications.module");
const chat_module_1 = require("./chat/chat.module");
const media_module_1 = require("./media/media.module");
const social_module_1 = require("./social/social.module");
const reviews_module_1 = require("./reviews/reviews.module");
const admin_module_1 = require("./admin/admin.module");
const bloggers_module_1 = require("./bloggers/bloggers.module");
const brands_module_1 = require("./brands/brands.module");
const portfolio_module_1 = require("./portfolio/portfolio.module");
const device_module_1 = require("./device/device.module");
const entities_1 = require("./database/entities");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => {
                    const databaseUrl = cfg.get('DATABASE_URL');
                    const isProduction = cfg.get('NODE_ENV') === 'production';
                    if (databaseUrl) {
                        return {
                            type: 'postgres',
                            url: databaseUrl,
                            ssl: { rejectUnauthorized: false },
                            entities: entities_1.databaseEntities,
                            synchronize: !isProduction,
                            logging: false,
                        };
                    }
                    return {
                        type: 'postgres',
                        host: cfg.get('DB_HOST', 'localhost'),
                        port: +cfg.get('DB_PORT', '4444'),
                        username: cfg.get('DB_USERNAME', 'postgres'),
                        password: cfg.get('DB_PASSWORD', 'postgres'),
                        database: cfg.get('DB_NAME', 'owner'),
                        entities: entities_1.databaseEntities,
                        synchronize: true,
                        logging: false,
                    };
                },
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            tasks_module_1.TasksModule,
            applications_module_1.ApplicationsModule,
            chat_module_1.ChatModule,
            media_module_1.MediaModule,
            social_module_1.SocialModule,
            reviews_module_1.ReviewsModule,
            admin_module_1.AdminModule,
            bloggers_module_1.BloggersModule,
            brands_module_1.BrandsModule,
            portfolio_module_1.PortfolioModule,
            device_module_1.DeviceModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map