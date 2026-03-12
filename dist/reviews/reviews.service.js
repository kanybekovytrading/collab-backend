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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../database/entities/review.entity");
const application_entity_1 = require("../database/entities/application.entity");
const completion_record_entity_1 = require("../database/entities/completion-record.entity");
const blogger_profile_entity_1 = require("../database/entities/blogger-profile.entity");
const brand_profile_entity_1 = require("../database/entities/brand-profile.entity");
let ReviewsService = class ReviewsService {
    reviewRepo;
    appRepo;
    completionRepo;
    bloggerRepo;
    brandRepo;
    constructor(reviewRepo, appRepo, completionRepo, bloggerRepo, brandRepo) {
        this.reviewRepo = reviewRepo;
        this.appRepo = appRepo;
        this.completionRepo = completionRepo;
        this.bloggerRepo = bloggerRepo;
        this.brandRepo = brandRepo;
    }
    async canReview(user, applicationId) {
        const app = await this.appRepo.findOne({
            where: { id: applicationId },
            relations: ['blogger', 'task', 'task.brand'],
        });
        if (!app)
            return { canReview: false, reason: 'Application not found' };
        const isParticipant = app.blogger.id === user.id || app.task.brand.id === user.id;
        if (!isParticipant)
            return { canReview: false, reason: 'Not a participant' };
        if (app.status !== application_entity_1.ApplicationStatus.COMPLETED)
            return { canReview: false, reason: 'Collaboration not completed' };
        const existing = await this.reviewRepo.findOne({
            where: { author: { id: user.id }, application: { id: applicationId } },
        });
        if (existing)
            return { canReview: false, reason: 'Already reviewed' };
        return { canReview: true, reason: null };
    }
    async create(author, dto) {
        const app = await this.appRepo.findOne({
            where: { id: dto.applicationId },
            relations: ['blogger', 'task', 'task.brand'],
        });
        if (!app)
            throw new common_1.NotFoundException('Application not found');
        if (app.status !== application_entity_1.ApplicationStatus.COMPLETED)
            throw new common_1.BadRequestException('Collaboration not completed');
        const completion = await this.completionRepo.findOne({
            where: { application: { id: app.id } },
        });
        if (!completion)
            throw new common_1.BadRequestException('No completion record');
        const isParticipant = app.blogger.id === author.id || app.task.brand.id === author.id;
        if (!isParticipant)
            throw new common_1.ForbiddenException('Not a participant');
        const existing = await this.reviewRepo.findOne({
            where: {
                author: { id: author.id },
                application: { id: dto.applicationId },
            },
        });
        if (existing)
            throw new common_1.ConflictException('Already reviewed');
        const targetId = author.id === app.blogger.id ? app.task.brand.id : app.blogger.id;
        const target = { id: targetId };
        const review = this.reviewRepo.create({
            author,
            target,
            application: app,
            rating: dto.rating,
            comment: dto.comment,
        });
        await this.reviewRepo.save(review);
        await this.recalculateRating(targetId);
        return this.format(review);
    }
    async getByUser(userId, page = 0, size = 20) {
        const [items, total] = await this.reviewRepo.findAndCount({
            where: { target: { id: userId } },
            relations: ['author', 'target'],
            order: { createdAt: 'DESC' },
            skip: page * size,
            take: size,
        });
        return {
            content: items.map((r) => this.format(r)),
            page,
            size,
            totalElements: total,
            totalPages: Math.ceil(total / size),
            first: page === 0,
            last: (page + 1) * size >= total,
        };
    }
    async recalculateRating(userId) {
        const result = await this.reviewRepo
            .createQueryBuilder('r')
            .select('AVG(r.rating)', 'avg')
            .addSelect('COUNT(*)', 'count')
            .where('"targetId" = :userId', { userId })
            .getRawOne();
        const avg = parseFloat(result?.avg || '0');
        const count = parseInt(result?.count || '0');
        await this.bloggerRepo
            .createQueryBuilder()
            .update(blogger_profile_entity_1.BloggerProfile)
            .set({ rating: avg, reviewsCount: count })
            .where('"userId" = :userId', { userId })
            .execute();
        await this.brandRepo
            .createQueryBuilder()
            .update(brand_profile_entity_1.BrandProfile)
            .set({ rating: avg, reviewsCount: count })
            .where('"userId" = :userId', { userId })
            .execute();
    }
    format(r) {
        return {
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            author: r.author
                ? {
                    id: r.author.id,
                    fullName: r.author.fullName,
                    avatarUrl: r.author.avatarUrl,
                }
                : null,
            createdAt: r.createdAt,
        };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(application_entity_1.Application)),
    __param(2, (0, typeorm_1.InjectRepository)(completion_record_entity_1.CompletionRecord)),
    __param(3, (0, typeorm_1.InjectRepository)(blogger_profile_entity_1.BloggerProfile)),
    __param(4, (0, typeorm_1.InjectRepository)(brand_profile_entity_1.BrandProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map