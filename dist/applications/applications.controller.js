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
exports.ApplicationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const applications_service_1 = require("./applications.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../database/entities/user.entity");
const api_response_1 = require("../common/dto/api-response");
let ApplicationsController = class ApplicationsController {
    appsService;
    constructor(appsService) {
        this.appsService = appsService;
    }
    async apply(user, dto) {
        return (0, api_response_1.apiResponse)(await this.appsService.apply(user, dto));
    }
    async invite(user, dto) {
        await this.appsService.invite(user, dto);
        return (0, api_response_1.apiResponse)(null, 'Blogger invited');
    }
    async getMy(user, page = 0, size = 20) {
        return (0, api_response_1.apiResponse)(await this.appsService.getMy(user.id, +page, +size));
    }
    async getByTask(user, taskId, page = 0, size = 20) {
        return (0, api_response_1.apiResponse)(await this.appsService.getByTask(user, taskId, +page, +size));
    }
    async accept(user, id) {
        await this.appsService.accept(user, id);
        return (0, api_response_1.apiResponse)(null, 'Application accepted');
    }
    async reject(user, id) {
        await this.appsService.reject(user, id);
        return (0, api_response_1.apiResponse)(null, 'Application rejected');
    }
    async cancel(user, id) {
        await this.appsService.cancel(user, id);
        return (0, api_response_1.apiResponse)(null, 'Application cancelled');
    }
    async submit(user, id, dto) {
        await this.appsService.submit(user.id, id, dto);
        return (0, api_response_1.apiResponse)(null, 'Work submitted');
    }
    async revision(user, id, dto) {
        await this.appsService.requestRevision(user, id, dto);
        return (0, api_response_1.apiResponse)(null, 'Revision requested');
    }
    async approve(user, id) {
        await this.appsService.approve(user, id);
        return (0, api_response_1.apiResponse)(null, 'Collaboration completed');
    }
};
exports.ApplicationsController = ApplicationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Подать заявку на задание' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "apply", null);
__decorate([
    (0, common_1.Post)('invite'),
    (0, swagger_1.ApiOperation)({ summary: 'Пригласить блогера на задание' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "invite", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, swagger_1.ApiOperation)({ summary: 'Мои заявки (для блогера)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getMy", null);
__decorate([
    (0, common_1.Get)('task/:taskId'),
    (0, swagger_1.ApiOperation)({ summary: 'Заявки на задание (для бренда)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('taskId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('size')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "getByTask", null);
__decorate([
    (0, common_1.Put)(':id/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Принять заявку' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "accept", null);
__decorate([
    (0, common_1.Put)(':id/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Отклонить заявку' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "reject", null);
__decorate([
    (0, common_1.Put)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Отменить заявку' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Put)(':id/submit'),
    (0, swagger_1.ApiOperation)({ summary: 'Сдать работу' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "submit", null);
__decorate([
    (0, common_1.Put)(':id/revision'),
    (0, swagger_1.ApiOperation)({ summary: 'Запросить доработку' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String, Object]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "revision", null);
__decorate([
    (0, common_1.Put)(':id/approve'),
    (0, swagger_1.ApiOperation)({ summary: 'Принять финальную работу' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], ApplicationsController.prototype, "approve", null);
exports.ApplicationsController = ApplicationsController = __decorate([
    (0, swagger_1.ApiTags)('Applications'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('applications'),
    __metadata("design:paramtypes", [applications_service_1.ApplicationsService])
], ApplicationsController);
//# sourceMappingURL=applications.controller.js.map