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
const chat_message_entity_1 = require("../database/entities/chat-message.entity");
const portfolio_item_entity_1 = require("../database/entities/portfolio-item.entity");
const notification_service_1 = require("../notifications/notification.service");
let ApplicationsService = class ApplicationsService {
    appRepo;
    taskRepo;
    bloggerRepo;
    brandRepo;
    completionRepo;
    msgRepo;
    portfolioRepo;
    notificationService;
    constructor(appRepo, taskRepo, bloggerRepo, brandRepo, completionRepo, msgRepo, portfolioRepo, notificationService) {
        this.appRepo = appRepo;
        this.taskRepo = taskRepo;
        this.bloggerRepo = bloggerRepo;
        this.brandRepo = brandRepo;
        this.completionRepo = completionRepo;
        this.msgRepo = msgRepo;
        this.portfolioRepo = portfolioRepo;
        this.notificationService = notificationService;
    }
    async apply(user, dto) {
        const task = await this.taskRepo.findOne({
            where: { id: dto.taskId },
            relations: ['brand'],
        });
        if (!task)
            throw new common_1.NotFoundException('Task not found');
        if (task.status !== task_entity_1.TaskStatus.ACTIVE)
            throw new common_1.BadRequestException('Task is not active');
        const existing = await this.appRepo.findOne({
            where: { blogger: { id: user.id }, task: { id: dto.taskId } },
        });
        if (existing)
            throw new common_1.ConflictException('Already applied to this task');
        const firstMessage = dto.message || dto.coverLetter;
        const app = this.appRepo.create({
            blogger: user,
            task,
            coverLetter: firstMessage,
            proposedPrice: dto.proposedPrice,
        });
        await this.appRepo.save(app);
        if (firstMessage) {
            const msg = this.msgRepo.create({
                application: app,
                sender: user,
                recipient: { id: task.brand.id },
                content: firstMessage,
            });
            await this.msgRepo.save(msg);
        }
        void this.notificationService.send(task.brand.fcmToken, 'Новый отклик', `${user.fullName ?? 'Блогер'} откликнулся на «${task.title}»`, { type: 'NEW_APPLICATION', appId: app.id });
        return { ...this.format(app), chatId: app.id };
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
        void this.notificationService.send(blogger.user.fcmToken, 'Вас пригласили на задание', `Бренд «${brandUser.fullName ?? 'Бренд'}» приглашает вас на «${task.title}»`, { type: 'INVITE', appId: app.id });
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
        void this.notificationService.send(app.blogger.fcmToken, 'Заявка принята', `Бренд принял вашу заявку на «${app.task.title}»`, { type: 'APPLICATION_ACCEPTED', appId: app.id });
    }
    async reject(brandUser, id) {
        const app = await this.getApp(id);
        if (app.task.brand.id !== brandUser.id)
            throw new common_1.ForbiddenException('Not your task');
        app.status = application_entity_1.ApplicationStatus.REJECTED;
        await this.appRepo.save(app);
        void this.notificationService.send(app.blogger.fcmToken, 'Заявка отклонена', `Ваша заявка на «${app.task.title}» была отклонена`, { type: 'APPLICATION_REJECTED', appId: app.id });
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
        if (dto.workUrl) {
            const isVideo = /\.(mp4|mov|webm|m4v)$/i.test(dto.workUrl);
            const msg = this.msgRepo.create({
                application: app,
                sender: app.blogger,
                recipient: { id: app.task.brand.id },
                content: dto.comment ?? '📎 Блогер сдал работу',
                attachmentUrl: dto.workUrl,
                attachmentType: isVideo ? 'video' : 'image',
            });
            await this.msgRepo.save(msg);
        }
        void this.notificationService.send(app.task.brand.fcmToken, 'Работа сдана', `${app.blogger.fullName ?? 'Блогер'} сдал работу по «${app.task.title}»`, { type: 'WORK_SUBMITTED', appId: app.id });
    }
    async requestRevision(brandUser, id, dto) {
        const app = await this.getApp(id);
        if (app.task.brand.id !== brandUser.id)
            throw new common_1.ForbiddenException('Not your task');
        app.status = application_entity_1.ApplicationStatus.REVISION_REQUESTED;
        app.revisionComment = dto.comment;
        app.revisionCount++;
        await this.appRepo.save(app);
        void this.notificationService.send(app.blogger.fcmToken, 'Нужна доработка', `Бренд запросил доработку по «${app.task.title}»`, { type: 'REVISION_REQUESTED', appId: app.id });
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
        void this.notificationService.send(app.blogger.fcmToken, 'Работа принята! 🎉', `Бренд принял вашу работу по «${app.task.title}». Оставьте отзыв!`, { type: 'WORK_APPROVED', appId: app.id });
    }
    async autoCompleteSubmitted() {
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const apps = await this.appRepo.find({
            where: { status: application_entity_1.ApplicationStatus.SUBMITTED },
            relations: ['blogger', 'task', 'task.brand'],
        });
        const stale = apps.filter((a) => a.updatedAt < threeDaysAgo);
        for (const app of stale) {
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
            void this.notificationService.send(app.blogger.fcmToken, 'Работа автоматически принята ✅', `Бренд не ответил 3 дня — работа по «${app.task.title}» засчитана. Оставьте отзыв!`, { type: 'WORK_APPROVED', appId: app.id });
            void this.notificationService.send(app.task.brand.fcmToken, 'Работа автоматически завершена', `Вы не проверили работу по «${app.task.title}» — она засчитана автоматически. Оставьте отзыв!`, { type: 'WORK_APPROVED', appId: app.id });
        }
        return stale.length;
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
            proposedPrice: a.proposedPrice != null ? Number(a.proposedPrice) : null,
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
    __param(5, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __param(6, (0, typeorm_1.InjectRepository)(portfolio_item_entity_1.PortfolioItem)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map