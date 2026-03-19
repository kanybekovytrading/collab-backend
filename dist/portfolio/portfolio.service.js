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
exports.PortfolioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const portfolio_item_entity_1 = require("../database/entities/portfolio-item.entity");
const blogger_profile_entity_1 = require("../database/entities/blogger-profile.entity");
let PortfolioService = class PortfolioService {
    itemRepo;
    bloggerRepo;
    constructor(itemRepo, bloggerRepo) {
        this.itemRepo = itemRepo;
        this.bloggerRepo = bloggerRepo;
    }
    async getPortfolio(userId) {
        const items = await this.itemRepo.find({
            where: { blogger: { user: { id: userId } } },
            order: { sortOrder: 'ASC' },
        });
        return items.map(i => this.format(i));
    }
    async add(userId, dto) {
        const blogger = await this.bloggerRepo.findOne({ where: { user: { id: userId } } });
        if (!blogger)
            throw new common_1.NotFoundException('Blogger profile not found');
        const count = await this.itemRepo.count({ where: { blogger: { id: blogger.id } } });
        if (count >= 20)
            throw new common_1.BadRequestException('Portfolio limit reached (max 20)');
        const item = this.itemRepo.create({ ...dto, blogger });
        await this.itemRepo.save(item);
        return this.format(item);
    }
    async delete(userId, itemId) {
        const item = await this.itemRepo.findOne({
            where: { id: itemId, blogger: { user: { id: userId } } },
        });
        if (!item)
            throw new common_1.NotFoundException('Portfolio item not found');
        await this.itemRepo.remove(item);
    }
    async reorder(userId, orderedIds) {
        const blogger = await this.bloggerRepo.findOne({ where: { user: { id: userId } } });
        if (!blogger)
            throw new common_1.NotFoundException('Blogger profile not found');
        for (let i = 0; i < orderedIds.length; i++) {
            await this.itemRepo.update({ id: orderedIds[i], blogger: { id: blogger.id } }, { sortOrder: i });
        }
        const items = await this.itemRepo.find({
            where: { blogger: { id: blogger.id } },
            order: { sortOrder: 'ASC' },
        });
        return items.map(i => this.format(i));
    }
    async getFeed(query) {
        const page = Math.max(0, parseInt(query.page ?? '0', 10));
        const size = Math.min(50, Math.max(1, parseInt(query.size ?? '20', 10)));
        const qb = this.itemRepo
            .createQueryBuilder('item')
            .leftJoinAndSelect('item.blogger', 'blogger')
            .leftJoinAndSelect('blogger.user', 'user')
            .where('item.mediaUrl IS NOT NULL')
            .andWhere('user.active = true')
            .andWhere(`blogger."socialAccounts" IS NOT NULL AND jsonb_array_length(blogger."socialAccounts") > 0`)
            .orderBy(`CASE WHEN UPPER(item.contentType) = 'VIDEO' THEN 0 ELSE 1 END`, 'ASC')
            .addOrderBy('blogger.completedTasksCount', 'DESC')
            .addOrderBy('blogger.rating', 'DESC')
            .addOrderBy('item.createdAt', 'DESC');
        if (query.contentType) {
            qb.andWhere('UPPER(item.contentType) = :ct', {
                ct: query.contentType.toUpperCase(),
            });
        }
        if (query.category) {
            qb.andWhere(':cat = ANY(string_to_array(blogger.categories, \',\'))', {
                cat: query.category,
            });
        }
        if (query.platform) {
            qb.andWhere(`EXISTS (SELECT 1 FROM jsonb_array_elements(blogger."socialAccounts") AS sa WHERE sa->>'platform' = :platform)`, { platform: query.platform.toUpperCase() });
        }
        if (query.followersMin || query.followersMax) {
            const min = parseInt(query.followersMin ?? '0', 10);
            const max = parseInt(query.followersMax ?? '999999999', 10);
            qb.andWhere(`EXISTS (SELECT 1 FROM jsonb_array_elements(blogger."socialAccounts") AS sa WHERE (sa->>'followersCount')::bigint BETWEEN :min AND :max)`, { min, max });
        }
        const allItems = await qb.getMany();
        const bloggerCount = {};
        const filteredItems = allItems.filter((item) => {
            const bloggerId = item.blogger?.id;
            if (!bloggerId)
                return false;
            bloggerCount[bloggerId] = (bloggerCount[bloggerId] ?? 0) + 1;
            return bloggerCount[bloggerId] <= 3;
        });
        const bloggersWithPortfolio = new Set(Object.keys(bloggerCount));
        const newbieQb = this.bloggerRepo
            .createQueryBuilder('blogger')
            .leftJoinAndSelect('blogger.user', 'user')
            .where('user.active = true')
            .andWhere(`blogger."socialAccounts" IS NOT NULL AND jsonb_array_length(blogger."socialAccounts") > 0`)
            .andWhere(`NOT EXISTS (SELECT 1 FROM portfolio_items pi WHERE pi."bloggerId" = blogger.id)`)
            .orderBy('blogger.createdAt', 'DESC');
        if (query.category) {
            newbieQb.andWhere(':cat = ANY(string_to_array(blogger.categories, \',\'))', {
                cat: query.category,
            });
        }
        if (query.platform) {
            newbieQb.andWhere(`EXISTS (SELECT 1 FROM jsonb_array_elements(blogger."socialAccounts") AS sa WHERE sa->>'platform' = :platform)`, { platform: query.platform.toUpperCase() });
        }
        const newbies = query.contentType
            ? []
            : (await newbieQb.getMany()).filter((b) => !bloggersWithPortfolio.has(b.id));
        const merged = [];
        let newbieIdx = 0;
        for (let i = 0; i < filteredItems.length; i++) {
            if (i > 0 && i % 5 === 0 && newbieIdx < newbies.length) {
                merged.push({ type: 'BLOGGER_CARD', data: newbies[newbieIdx++] });
            }
            merged.push({ type: 'PORTFOLIO_ITEM', data: filteredItems[i] });
        }
        while (newbieIdx < newbies.length) {
            merged.push({ type: 'BLOGGER_CARD', data: newbies[newbieIdx++] });
        }
        const total = merged.length;
        const content = merged.slice(page * size, (page + 1) * size);
        return {
            content: content.map((entry) => entry.type === 'PORTFOLIO_ITEM'
                ? this.formatFeed(entry.data)
                : this.formatBloggerCard(entry.data)),
            page,
            size,
            totalElements: total,
            totalPages: Math.ceil(total / size),
            first: page === 0,
            last: (page + 1) * size >= total,
        };
    }
    formatFeed(i) {
        return {
            type: 'PORTFOLIO_ITEM',
            id: i.id,
            mediaUrl: i.mediaUrl,
            thumbnailUrl: i.thumbnailUrl,
            contentType: i.contentType,
            title: i.title,
            createdAt: i.createdAt,
            blogger: {
                id: i.blogger?.user?.id,
                fullName: i.blogger?.user?.fullName,
                avatarUrl: i.blogger?.user?.avatarUrl,
                categories: i.blogger?.categories,
                socialAccounts: i.blogger?.socialAccounts || [],
                rating: Number(i.blogger?.rating ?? 0),
                completedTasksCount: i.blogger?.completedTasksCount ?? 0,
            },
        };
    }
    formatBloggerCard(b) {
        return {
            type: 'BLOGGER_CARD',
            id: b.id,
            blogger: {
                id: b.user?.id,
                fullName: b.user?.fullName,
                avatarUrl: b.user?.avatarUrl,
                bio: b.bio,
                categories: b.categories,
                socialAccounts: b.socialAccounts || [],
                rating: Number(b.rating ?? 0),
                completedTasksCount: b.completedTasksCount ?? 0,
            },
        };
    }
    format(i) {
        return {
            id: i.id,
            mediaUrl: i.mediaUrl,
            title: i.title,
            contentType: i.contentType,
            thumbnailUrl: i.thumbnailUrl,
            sortOrder: i.sortOrder,
        };
    }
};
exports.PortfolioService = PortfolioService;
exports.PortfolioService = PortfolioService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(portfolio_item_entity_1.PortfolioItem)),
    __param(1, (0, typeorm_1.InjectRepository)(blogger_profile_entity_1.BloggerProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PortfolioService);
//# sourceMappingURL=portfolio.service.js.map