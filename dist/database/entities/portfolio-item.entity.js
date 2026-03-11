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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortfolioItem = void 0;
const typeorm_1 = require("typeorm");
const blogger_profile_entity_1 = require("./blogger-profile.entity");
let PortfolioItem = class PortfolioItem {
    id;
    blogger;
    mediaUrl;
    title;
    contentType;
    thumbnailUrl;
    sortOrder;
    createdAt;
};
exports.PortfolioItem = PortfolioItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PortfolioItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => blogger_profile_entity_1.BloggerProfile, (b) => b.portfolioItems),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", blogger_profile_entity_1.BloggerProfile)
], PortfolioItem.prototype, "blogger", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PortfolioItem.prototype, "mediaUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PortfolioItem.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PortfolioItem.prototype, "contentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PortfolioItem.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], PortfolioItem.prototype, "sortOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PortfolioItem.prototype, "createdAt", void 0);
exports.PortfolioItem = PortfolioItem = __decorate([
    (0, typeorm_1.Entity)('portfolio_items')
], PortfolioItem);
//# sourceMappingURL=portfolio-item.entity.js.map