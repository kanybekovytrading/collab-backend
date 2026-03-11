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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../database/entities/user.entity");
const blogger_profile_entity_1 = require("../database/entities/blogger-profile.entity");
const brand_profile_entity_1 = require("../database/entities/brand-profile.entity");
let UsersService = class UsersService {
    userRepo;
    bloggerRepo;
    brandRepo;
    constructor(userRepo, bloggerRepo, brandRepo) {
        this.userRepo = userRepo;
        this.bloggerRepo = bloggerRepo;
        this.brandRepo = brandRepo;
    }
    async addRole(userId, role) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        const allowed = {
            [user_entity_1.Role.BLOGGER]: [user_entity_1.Role.AI_CREATOR],
            [user_entity_1.Role.AI_CREATOR]: [user_entity_1.Role.BLOGGER],
        };
        const allowedRoles = allowed[user.currentRole] || [];
        if (!allowedRoles.includes(role)) {
            throw new common_1.ForbiddenException(`Cannot add role ${role} from current role ${user.currentRole}`);
        }
        if (user.roles.includes(role))
            throw new common_1.BadRequestException('Role already added');
        user.roles = [...user.roles, role];
        await this.userRepo.save(user);
        const existing = await this.bloggerRepo.findOne({ where: { user: { id: userId } } });
        if (!existing) {
            await this.bloggerRepo.save(this.bloggerRepo.create({ user }));
        }
        return { currentRole: user.currentRole, allRoles: user.roles };
    }
    async switchRole(userId, role) {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user.roles.includes(role))
            throw new common_1.BadRequestException('Role not added to your account');
        user.currentRole = role;
        await this.userRepo.save(user);
        return { currentRole: user.currentRole, allRoles: user.roles };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(blogger_profile_entity_1.BloggerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(brand_profile_entity_1.BrandProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map