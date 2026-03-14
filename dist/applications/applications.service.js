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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const application_entity_1 = require("../database/entities/application.entity");
const task_entity_1 = require("../database/entities/task.entity");
const blogger_profile_entity_1 = require("../database/entities/blogger-profile.entity");
const brand_profile_entity_1 = require("../database/entities/brand-profile.entity");
const completion_record_entity_1 = require("../database/entities/completion-record.entity");
let ApplicationsService = class ApplicationsService {
    appRepo;
    taskRepo;
    bloggerRepo;
    brandRepo;
    completionRepo;
    constructor(appRepo, taskRepo, bloggerRepo, brandRepo, completionRepo) {
        this.appRepo = appRepo;
        this.taskRepo = taskRepo;
        this.bloggerRepo = bloggerRepo;
        this.brandRepo = brandRepo;
        this.completionRepo = completionRepo;
    }
    async apply(user, dto) {
        const task = await this.taskRepo.findOne({ where: { id: dto.taskId } });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.status !== task_entity_1.TaskStatus.ACTIVE)
            throw new common_1.BadRequestException('Task is not active');
        const existing = await this.appRepo.findOne({
            where: { blogger: { id: user.id }, task: { id: dto.taskId } },
        });
        if (existing)
            throw new common_1.ConflictException('Already applied to this task');
        const app = this.appRepo.create({
            blogger: user,
            task,
            coverLetter: dto.coverLetter,
            proposedPrice: dto.proposedPrice,
        });
        await this.appRepo.save(app);
        return this.format(app);
    }
    async invite(brandUser, dto) {
        const task = await this.taskRepo.findOne({
            where: { id: dto.taskId, brand: { id: brandUser.id } },
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found or not yours');
        const blogger = await this.bloggerRepo.findOne({
            where: { user: { id: dto.bloggerId } },
        });
        if (!blogger)
            throw new common_1.NotFoundException('Blogger not found');
        const app = this.appRepo.create({
            blogger: blogger.user,
            task,
            invited: true,
        });
        await this.appRepo.save(app);
    }
    async getByTask(brandUser, taskId, page = 0, size = 20) {
        const task = await this.taskRepo.findOne({
            where: { id: taskId, brand: { id: brandUser.id } },
        });
        if (!task)
            throw new common_1.ForbiddenException('Not your task');
        const [items, total] = await this.appRepo.findAndCount({
            where: { task: { id: taskId } },
            relations: ['blogger', 'task'],
            order: { createdAt: 'DESC' },
            skip: page * size,
            take: size,
        });
        return this.paginate(items.map((a) => this.format(a)), total, page, size);
    }
    async getMy(userId, page = 0, size = 20) {
        const [items, total] = await this.appRepo.findAndCount({
            where: { blogger: { id: userId } },
            relations: ['task', 'blogger'],
            order: { createdAt: 'DESC' },
            skip: page * size,
            take: size,
        });
        return this.paginate(items.map((a) => this.format(a)), total, page, size);
    }
    async accept(brandUser, id) {
        const app = await this.getApp(id);
        if (app.task.brand.id !== brandUser.id)
            throw new common_1.ForbiddenException('Not your task');
        if (app.status !== application_entity_1.ApplicationStatus.PENDING)
            throw new common_1.BadRequestException('Application is not PENDING');
        app.status = application_entity_1.ApplicationStatus.IN_WORK;
        await this.appRepo.save(app);
    }
    async reject(brandUser, id) {
        const app = await this.getApp(id);
        if (app.task.brand.id !== brandUser.id)
            throw new common_1.ForbiddenException('Not your task');
        app.status = application_entity_1.ApplicationStatus.REJECTED;
        await this.appRepo.save(app);
    }
    async cancel(user, id) {
        const app = await this.getApp(id);
        if (app.blogger.id !== user.id && app.task.brand.id !== user.id)
            throw new common_1.ForbiddenException('Not your application');
        if (app.status === application_entity_1.ApplicationStatus.COMPLETED)
            throw new common_1.BadRequestException('Cannot cancel completed application');
        app.status = application_entity_1.ApplicationStatus.CANCELLED;
        await this.appRepo.save(app);
    }
    async submit(userId, id, dto) {
        const app = await this.getApp(id);
        if (app.blogger.id !== userId)
            throw new common_1.ForbiddenException('Not your application');
        if (![
            application_entity_1.ApplicationStatus.IN_WORK,
            application_entity_1.ApplicationStatus.REVISION_REQUESTED,
        ].includes(app.status))
            throw new common_1.BadRequestException('Invalid status for submission');
        app.status = application_entity_1.ApplicationStatus.SUBMITTED;
        app.workUrl = dto.workUrl;
        await this.appRepo.save(app);
    }
    async requestRevision(brandUser, id, dto) {
        const app = await this.getApp(id);
        if (app.task.brand.id !== brandUser.id)
            throw new common_1.ForbiddenException('Not your task');
        app.status = application_entity_1.ApplicationStatus.REVISION_REQUESTED;
        app.revisionComment = dto.comment;
        app.revisionCount++;
        await this.appRepo.save(app);
    }
    async approve(brandUser, id) {
        const app = await this.getApp(id);
        if (app.task.brand.id !== brandUser.id)
            throw new common_1.ForbiddenException('Not your task');
        if (app.status !== application_entity_1.ApplicationStatus.SUBMITTED)
            throw new common_1.BadRequestException('Work not submitted yet');
        app.status = application_entity_1.ApplicationStatus.COMPLETED;
        await this.appRepo.save(app);
        const rec = this.completionRepo.create({ application: app });
        await this.completionRepo.save(rec);
        await this.bloggerRepo
            .createQueryBuilder()
            .update(blogger_profile_entity_1.BloggerProfile)
            .set({ completedTasksCount: () => '"completedTasksCount" + 1' })
            .where('"userId" = :uid', { uid: app.blogger.id })
            .execute();
        await this.brandRepo
            .createQueryBuilder()
            .update(brand_profile_entity_1.BrandProfile)
            .set({ tasksCount: () => '"tasksCount" + 1' })
            .where('"userId" = :uid', { uid: app.task.brand.id })
            .execute();
    }
    async getApp(id) {
        const app = await this.appRepo.findOne({
            where: { id },
            relations: ['blogger', 'task', 'task.brand'],
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        return app;
    }
    format(a) {
        return {
            id: a.id,
            status: a.status,
            coverLetter: a.coverLetter,
            proposedPrice: a.proposedPrice,
            invited: a.invited,
            workUrl: a.workUrl,
            revisionComment: a.revisionComment,
            revisionCount: a.revisionCount,
            createdAt: a.createdAt,
            blogger: a.blogger
                ? {
                    id: a.blogger.id,
                    fullName: a.blogger.fullName,
                    avatarUrl: a.blogger.avatarUrl,
                }
                : null,
            task: a.task ? { id: a.task.id, title: a.task.title } : null,
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
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(2, (0, typeorm_1.InjectRepository)(blogger_profile_entity_1.BloggerProfile)),
    __param(3, (0, typeorm_1.InjectRepository)(brand_profile_entity_1.BrandProfile)),
    __param(4, (0, typeorm_1.InjectRepository)(completion_record_entity_1.CompletionRecord)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map