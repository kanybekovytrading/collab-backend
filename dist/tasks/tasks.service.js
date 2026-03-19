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
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../database/entities/task.entity");
const brand_profile_entity_1 = require("../database/entities/brand-profile.entity");
const user_entity_1 = require("../database/entities/user.entity");
let TasksService = class TasksService {
    taskRepo;
    brandRepo;
    constructor(taskRepo, brandRepo) {
        this.taskRepo = taskRepo;
        this.brandRepo = brandRepo;
    }
    async create(user, dto) {
        if (user.currentRole !== user_entity_1.Role.BRAND)
            throw new common_1.ForbiddenException('Only brands can create tasks');
        const task = this.taskRepo.create({ ...dto, brand: user });
        await this.taskRepo.save(task);
        return this.format(task);
    }
    async findAll(filters) {
        const { taskType, city, acceptsUgc, acceptsAi, page = 0, size = 20, } = filters;
        const qb = this.taskRepo
            .createQueryBuilder('t')
            .leftJoinAndSelect('t.brand', 'u')
            .where('t.status != :status', { status: task_entity_1.TaskStatus.DELETED });
        if (taskType)
            qb.andWhere('t.taskType = :taskType', { taskType });
        if (city)
            qb.andWhere('t.city ILIKE :city', { city: `%${city}%` });
        if (acceptsUgc !== undefined)
            qb.andWhere('t.acceptsUgc = :ugc', { ugc: acceptsUgc === 'true' });
        if (acceptsAi !== undefined)
            qb.andWhere('t.acceptsAi = :ai', { ai: acceptsAi === 'true' });
        qb.orderBy('t.createdAt', 'DESC')
            .skip(page * size)
            .take(size);
        const [items, total] = await qb.getManyAndCount();
        return this.paginate(items.map((t) => this.format(t)), total, +page, +size);
    }
    async findOne(id) {
        const t = await this.taskRepo.findOne({
            where: { id },
            relations: ['brand'],
        });
        if (!t)
            throw new common_1.NotFoundException('Task not found');
        return this.format(t);
    }
    async findMyTasks(userId, page = 0, size = 20) {
        const [items, total] = await this.taskRepo.findAndCount({
            where: { brand: { id: userId } },
            relations: ['brand'],
            order: { createdAt: 'DESC' },
            skip: page * size,
            take: size,
        });
        return this.paginate(items.map((t) => this.format(t)), total, page, size);
    }
    async delete(id, user) {
        const task = await this.taskRepo.findOne({
            where: { id },
            relations: ['brand'],
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.brand.id !== user.id && user.currentRole !== user_entity_1.Role.ADMIN)
            throw new common_1.ForbiddenException('No permission');
        task.status = task_entity_1.TaskStatus.DELETED;
        await this.taskRepo.save(task);
    }
    format(t) {
        return {
            id: t.id,
            title: t.title,
            description: t.description,
            taskType: t.taskType,
            coverImageUrl: t.coverImageUrl,
            city: t.city,
            online: t.online,
            deadlineDays: t.deadlineDays,
            price: t.price != null ? Number(t.price) : null,
            priceDescription: t.priceDescription,
            status: t.status,
            reactionsCount: t.reactionsCount,
            acceptsUgc: t.acceptsUgc,
            acceptsAi: t.acceptsAi,
            genderFilter: t.genderFilter,
            categories: t.categories,
            createdAt: t.createdAt,
            brand: t.brand
                ? {
                    id: t.brand.id,
                    fullName: t.brand.fullName,
                    companyName: null,
                    avatarUrl: t.brand.avatarUrl,
                    verified: t.brand.verified,
                    rating: null,
                }
                : null,
        };
    }
    paginate(content, total, page, size) {
        return {
            content,
            page,
            size,
            totalElements: total,
            totalPages: Math.ceil(total / size),
            first: page === 0,
            last: (page + 1) * size >= total,
        };
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(brand_profile_entity_1.BrandProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map