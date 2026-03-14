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
exports.PortfolioController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const portfolio_service_1 = require("./portfolio.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const user_entity_1 = require("../database/entities/user.entity");
const api_response_1 = require("../common/dto/api-response");
let PortfolioController = class PortfolioController {
    portfolioService;
    constructor(portfolioService) {
        this.portfolioService = portfolioService;
    }
    async getFeed(query) {
        return (0, api_response_1.apiResponse)(await this.portfolioService.getFeed(query));
    }
    async getPortfolio(userId) {
        return (0, api_response_1.apiResponse)(await this.portfolioService.getPortfolio(userId));
    }
    async add(user, dto) {
        return (0, api_response_1.apiResponse)(await this.portfolioService.add(user.id, dto));
    }
    async delete(user, itemId) {
        await this.portfolioService.delete(user.id, itemId);
        return (0, api_response_1.apiResponse)(null, 'Item deleted');
    }
    async reorder(user, dto) {
        return (0, api_response_1.apiResponse)(await this.portfolioService.reorder(user.id, dto.orderedIds));
    }
};
exports.PortfolioController = PortfolioController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('portfolio/feed'),
    (0, swagger_1.ApiOperation)({ summary: 'Лента портфолио для Discover (контент + блогер)' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getFeed", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('bloggers/:userId/portfolio'),
    (0, swagger_1.ApiOperation)({ summary: 'Получить портфолио блогера' }),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "getPortfolio", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('profile/portfolio'),
    (0, swagger_1.ApiOperation)({ summary: 'Добавить элемент в портфолио' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "add", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Delete)('profile/portfolio/:itemId'),
    (0, swagger_1.ApiOperation)({ summary: 'Удалить элемент из портфолио' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('itemId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "delete", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Put)('profile/portfolio/reorder'),
    (0, swagger_1.ApiOperation)({ summary: 'Изменить порядок элементов портфолио' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], PortfolioController.prototype, "reorder", null);
exports.PortfolioController = PortfolioController = __decorate([
    (0, swagger_1.ApiTags)('Portfolio'),
    (0, common_1.Controller)(''),
    __metadata("design:paramtypes", [portfolio_service_1.PortfolioService])
], PortfolioController);
//# sourceMappingURL=portfolio.controller.js.map