"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BloggersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const bloggers_controller_1 = require("./bloggers.controller");
const bloggers_service_1 = require("./bloggers.service");
const blogger_profile_entity_1 = require("../database/entities/blogger-profile.entity");
let BloggersModule = class BloggersModule {
};
exports.BloggersModule = BloggersModule;
exports.BloggersModule = BloggersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([blogger_profile_entity_1.BloggerProfile])],
        controllers: [bloggers_controller_1.BloggersController],
        providers: [bloggers_service_1.BloggersService],
        exports: [bloggers_service_1.BloggersService],
    })
], BloggersModule);
//# sourceMappingURL=bloggers.module.js.map