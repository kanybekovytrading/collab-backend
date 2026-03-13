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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../database/entities/user.entity");
const task_entity_1 = require("../database/entities/task.entity");
const application_entity_1 = require("../database/entities/application.entity");
const blogger_profile_entity_1 = require("../database/entities/blogger-profile.entity");
const brand_profile_entity_1 = require("../database/entities/brand-profile.entity");
const completion_record_entity_1 = require("../database/entities/completion-record.entity");
let AdminService = class AdminService {
    userRepo;
    taskRepo;
    appRepo;
    bloggerRepo;
    brandRepo;
    completionRepo;
    constructor(userRepo, taskRepo, appRepo, bloggerRepo, brandRepo, completionRepo) {
        this.userRepo = userRepo;
        this.taskRepo = taskRepo;
        this.appRepo = appRepo;
        this.bloggerRepo = bloggerRepo;
        this.brandRepo = brandRepo;
        this.completionRepo = completionRepo;
    }
    async getUsers(search, page = 0, size = 20) {
        const where = search
            ? [{ fullName: (0, typeorm_2.Like)(`%${search}%`) }, { email: (0, typeorm_2.Like)(`%${search}%`) }]
            : {};
        const [items, total] = await this.userRepo.findAndCount({
            where,
            order: { createdAt: 'DESC' },
            skip: page * size,
            take: size,
        });
        return {
            content: items.map((u) => this.formatUser(u)),
            page,
            size,
            totalElements: total,
            totalPages: Math.ceil(total / size),
            first: page === 0,
            last: (page + 1) * size >= total,
        };
    }
    async banUser(id, active) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.active = active;
        await this.userRepo.save(user);
        return this.formatUser(user);
    }
    async verifyUser(id, verified) {
        const user = await this.userRepo.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        user.verified = verified;
        await this.userRepo.save(user);
        return this.formatUser(user);
    }
    async getTasks(status, search, page = 0, size = 20) {
        const qb = this.taskRepo
            .createQueryBuilder('t')
            .leftJoinAndSelect('t.brand', 'u');
        if (status)
            qb.where('t.status = :status', { status });
        if (search)
            qb.andWhere('t.title ILIKE :s', { s: `%${search}%` });
        qb.orderBy('t.createdAt', 'DESC')
            .skip(page * size)
            .take(size);
        const [items, total] = await qb.getManyAndCount();
        return {
            content: items.map((t) => this.formatTask(t)),
            page,
            size,
            totalElements: total,
            totalPages: Math.ceil(total / size),
            first: page === 0,
            last: (page + 1) * size >= total,
        };
    }
    async verifyTask(id, status) {
        const task = await this.taskRepo.findOne({
            where: { id },
            relations: ['brand'],
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        task.status = status;
        await this.taskRepo.save(task);
        return this.formatTask(task);
    }
    async restoreTask(id) {
        const task = await this.taskRepo.findOne({
            where: { id },
            relations: ['brand'],
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        task.status = task_entity_1.TaskStatus.ACTIVE;
        await this.taskRepo.save(task);
        return this.formatTask(task);
    }
    async deleteTask(id, reason) {
        const task = await this.taskRepo.findOne({ where: { id } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        task.status = task_entity_1.TaskStatus.DELETED;
        await this.taskRepo.save(task);
    }
    async getStats() {
        const [totalUsers, totalBloggers, totalBrands, totalTasks, activeTasks, completedCollaborations, totalApplications,] = await Promise.all([
            this.userRepo.count(),
            this.bloggerRepo.count(),
            this.brandRepo.count(),
            this.taskRepo.count(),
            this.taskRepo.count({ where: { status: task_entity_1.TaskStatus.ACTIVE } }),
            this.completionRepo.count(),
            this.appRepo.count(),
        ]);
        return {
            totalUsers,
            totalBloggers,
            totalBrands,
            totalTasks,
            activeTasks,
            completedCollaborations,
            totalApplications,
            generatedAt: new Date(),
        };
    }
    formatUser(u) {
        return {
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            phone: u.phone,
            roles: u.roles,
            currentRole: u.currentRole,
            verified: u.verified,
            active: u.active,
            city: u.city,
            country: u.country,
            createdAt: u.createdAt,
        };
    }
    formatTask(t) {
        return {
            id: t.id,
            title: t.title,
            description: t.description,
            taskType: t.taskType,
            status: t.status,
            brandName: t.brand?.fullName,
            brandEmail: t.brand?.email,
            createdAt: t.createdAt,
        };
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(3, (0, typeorm_1.InjectRepository)(blogger_profile_entity_1.BloggerProfile)),
    __param(4, (0, typeorm_1.InjectRepository)(brand_profile_entity_1.BrandProfile)),
    __param(5, (0, typeorm_1.InjectRepository)(completion_record_entity_1.CompletionRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminService);
//# sourceMappingURL=admin.service.js.map