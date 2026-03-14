"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const auth_dto_1 = require("./auth.dto");
const public_decorator_1 = require("../common/decorators/public.decorator");
const api_response_1 = require("../common/dto/api-response");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async register(dto) {
        return (0, api_response_1.apiResponse)(await this.authService.register(dto), 'Registered successfully');
    }
    async login(dto) {
        return (0, api_response_1.apiResponse)(await this.authService.login(dto), 'Logged in successfully');
    }
    async refresh(dto) {
        return (0, api_response_1.apiResponse)(await this.authService.refresh(dto.refreshToken));
    }
    async oauth(dto) {
        return (0, api_response_1.apiResponse)(await this.authService.oauthLogin(dto));
    }
    async instagram(dto) {
        return (0, api_response_1.apiResponse)(await this.authService.instagramLogin(dto));
    }
    async seedAdmin() {
        return (0, api_response_1.apiResponse)(await this.authService.seedAdmin());
    }
    async adminLogin(dto) {
        return (0, api_response_1.apiResponse)(await this.authService.adminLogin(dto.email, dto.password));
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: 'Регистрация нового пользователя' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    (0, swagger_1.ApiOperation)({ summary: 'Вход в систему' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить access токен' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.RefreshDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('oauth'),
    (0, swagger_1.ApiOperation)({ summary: 'Вход / регистрация через Google или Apple ID' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.OAuthDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "oauth", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('instagram'),
    (0, swagger_1.ApiOperation)({ summary: 'Вход / регистрация через Instagram' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.InstagramLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "instagram", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('admin/seed'),
    (0, swagger_1.ApiOperation)({ summary: 'Создать админа (только один раз)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "seedAdmin", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('admin/login'),
    (0, swagger_1.ApiOperation)({ summary: 'Вход как администратор' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.AdminLoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map