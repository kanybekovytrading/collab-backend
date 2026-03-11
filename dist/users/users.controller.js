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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../database/entities/user.entity");
const class_validator_1 = require("class-validator");
const api_response_1 = require("../common/dto/api-response");
class AddRoleDto {
    role;
}
__decorate([
    (0, class_validator_1.IsEnum)(user_entity_1.Role),
    __metadata("design:type", String)
], AddRoleDto.prototype, "role", void 0);
class SwitchRoleDto {
    role;
}
__decorate([
    (0, class_validator_1.IsEnum)(user_entity_1.Role),
    __metadata("design:type", String)
], SwitchRoleDto.prototype, "role", void 0);
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async addRole(user, dto) {
        return (0, api_response_1.apiResponse)(await this.usersService.addRole(user.id, dto.role));
    }
    async switchRole(user, dto) {
        return (0, api_response_1.apiResponse)(await this.usersService.switchRole(user.id, dto.role));
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('role'),
    (0, swagger_1.ApiOperation)({ summary: 'Добавить роль' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, AddRoleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addRole", null);
__decorate([
    (0, common_1.Put)('role/switch'),
    (0, swagger_1.ApiOperation)({ summary: 'Переключить активную роль' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, SwitchRoleDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "switchRole", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Profile'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map