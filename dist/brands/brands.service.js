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
exports.BrandsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const brand_profile_entity_1 = require("../database/entities/brand-profile.entity");
let BrandsService = class BrandsService {
    brandRepo;
    constructor(brandRepo) {
        this.brandRepo = brandRepo;
    }
    async findAll(page = 0, size = 20) {
        const [items, total] = await this.brandRepo.findAndCount({
            relations: ['user'],
            order: { rating: 'DESC' },
            skip: page * size,
            take: size,
        });
        return {
            content: items.map((b) => this.format(b)),
            page, size, totalElements: total,
            totalPages: Math.ceil(total / size),
            first: page === 0,
            last: (page + 1) * size >= total,
        };
    }
    async findOne(userId) {
        const b = await this.brandRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!b)
            throw new common_1.NotFoundException('Brand not found');
        return this.format(b);
    }
    async update(userId, dto) {
        const b = await this.brandRepo.findOne({
            where: { user: { id: userId } },
            relations: ['user'],
        });
        if (!b)
            throw new common_1.NotFoundException('Brand profile not found');
        const { avatarUrl, fullName, city, country, ...brandFields } = dto;
        if (avatarUrl !== undefined)
            b.user.avatarUrl = avatarUrl;
        if (fullName !== undefined)
            b.user.fullName = fullName;
        if (city !== undefined)
            b.user.city = city;
        if (country !== undefined)
            b.user.country = country;
        if (avatarUrl !== undefined || fullName !== undefined || city !== undefined || country !== undefined) {
            await this.brandRepo.manager.save(b.user);
        }
        Object.assign(b, brandFields);
        await this.brandRepo.save(b);
        return this.format(b);
    }
    format(b) {
        return {
            id: b.user?.id,
            fullName: b.user?.fullName,
            companyName: b.companyName,
            avatarUrl: b.user?.avatarUrl,
            city: b.user?.city,
            country: b.user?.country,
            verified: b.user?.verified,
            description: b.description,
            websiteUrl: b.websiteUrl,
            category: b.category,
            rating: b.rating,
            tasksCount: b.tasksCount,
            reviewsCount: b.reviewsCount,
            socialAccounts: b.socialAccounts || [],
        };
    }
};
exports.BrandsService = BrandsService;
exports.BrandsService = BrandsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(brand_profile_entity_1.BrandProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BrandsService);
//# sourceMappingURL=brands.service.js.map