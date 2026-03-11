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
exports.DeviceModule = exports.DeviceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../database/entities/user.entity");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const api_response_1 = require("../common/dto/api-response");
const common_2 = require("@nestjs/common");
const typeorm_3 = require("@nestjs/typeorm");
let DeviceController = class DeviceController {
    userRepo;
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async updateFcmToken(user, dto) {
        await this.userRepo.update(user.id, { fcmToken: dto.token });
        return (0, api_response_1.apiResponse)(null, 'FCM token updated');
    }
};
exports.DeviceController = DeviceController;
__decorate([
    (0, common_1.Put)('fcm-token'),
    (0, swagger_1.ApiOperation)({ summary: 'Обновить FCM token устройства' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, Object]),
    __metadata("design:returntype", Promise)
], DeviceController.prototype, "updateFcmToken", null);
exports.DeviceController = DeviceController = __decorate([
    (0, swagger_1.ApiTags)('Device'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('device'),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DeviceController);
let DeviceModule = class DeviceModule {
};
exports.DeviceModule = DeviceModule;
exports.DeviceModule = DeviceModule = __decorate([
    (0, common_2.Module)({
        imports: [typeorm_3.TypeOrmModule.forFeature([user_entity_1.User])],
        controllers: [DeviceController],
    })
], DeviceModule);
//# sourceMappingURL=device.module.js.map