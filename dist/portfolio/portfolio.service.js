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