"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const admin = __importStar(require("firebase-admin"));
const user_entity_1 = require("../database/entities/user.entity");
const blogger_profile_entity_1 = require("../database/entities/blogger-profile.entity");
const brand_profile_entity_1 = require("../database/entities/brand-profile.entity");
const auth_dto_1 = require("./auth.dto");
let AuthService = class AuthService {
    userRepo;
    bloggerRepo;
    brandRepo;
    jwtService;
    cfg;
    constructor(userRepo, bloggerRepo, brandRepo, jwtService, cfg) {
        this.userRepo = userRepo;
        this.bloggerRepo = bloggerRepo;
        this.brandRepo = brandRepo;
        this.jwtService = jwtService;
        this.cfg = cfg;
    }
    async generateTokens(user) {
        const payload = { sub: user.id, email: user.email, role: user.currentRole };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.cfg.get('JWT_SECRET', 'secret'),
            expiresIn: '24h',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.cfg.get('JWT_REFRESH_SECRET', 'refresh-secret'),
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
    formatUser(user) {
        return {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone,
            currentRole: user.currentRole,
            avatarUrl: user.avatarUrl,
            verified: user.verified,
        };
    }
    async register(dto) {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already taken');
        const hashed = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            fullName: dto.fullName,
            email: dto.email,
            password: hashed,
            phone: dto.phone,
            roles: [dto.role],
            currentRole: dto.role,
        });
        await this.userRepo.save(user);
        await this.createProfile(user, dto.role);
        const tokens = await this.generateTokens(user);
        return { ...tokens, user: this.formatUser(user) };
    }
    async login(dto) {
        const user = await this.userRepo.findOne({
            where: { email: dto.email },
            select: ['id', 'fullName', 'email', 'phone', 'password', 'roles', 'currentRole', 'active', 'verified', 'avatarUrl'],
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid email or password');
        if (!user.active)
            throw new common_1.UnauthorizedException('Account is banned');
        const valid = await bcrypt.compare(dto.password, user.password);
        if (!valid)
            throw new common_1.BadRequestException('Invalid email or password');
        const tokens = await this.generateTokens(user);
        return { ...tokens, user: this.formatUser(user) };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.cfg.get('JWT_REFRESH_SECRET', 'refresh-secret'),
            });
            const user = await this.userRepo.findOne({ where: { id: payload.sub } });
            if (!user)
                throw new Error();
            const tokens = await this.generateTokens(user);
            return { ...tokens, user: this.formatUser(user) };
        }
        catch {
            throw new common_1.BadRequestException('Invalid or expired refresh token');
        }
    }
    async oauthLogin(dto) {
        let firebaseUser;
        try {
            firebaseUser = await admin.auth().verifyIdToken(dto.firebaseToken);
        }
        catch {
            throw new common_1.BadRequestException('Invalid Firebase token');
        }
        const email = firebaseUser.email;
        if (!email)
            throw new common_1.BadRequestException('Email not provided by OAuth provider');
        let user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            user = this.userRepo.create({
                fullName: firebaseUser.name || email.split('@')[0],
                email,
                avatarUrl: firebaseUser.picture,
                roles: [dto.role],
                currentRole: dto.role,
            });
            await this.userRepo.save(user);
            await this.createProfile(user, dto.role);
        }
        const tokens = await this.generateTokens(user);
        return { ...tokens, user: this.formatUser(user) };
    }
    async instagramLogin(dto) {
        const tokenUrl = `https://api.instagram.com/oauth/access_token`;
        const params = new URLSearchParams({
            client_id: this.cfg.get('INSTAGRAM_CLIENT_ID', ''),
            client_secret: this.cfg.get('INSTAGRAM_CLIENT_SECRET', ''),
            grant_type: 'authorization_code',
            redirect_uri: dto.redirectUri,
            code: dto.code,
        });
        const response = await fetch(tokenUrl, {
            method: 'POST',
            body: params,
        });
        const data = await response.json();
        if (!data.access_token)
            throw new common_1.BadRequestException('Invalid Instagram code');
        const userInfoRes = await fetch(`https://graph.instagram.com/me?fields=id,username&access_token=${data.access_token}`);
        const igUser = await userInfoRes.json();
        const email = `ig_${igUser.id}@collab.app`;
        let user = await this.userRepo.findOne({ where: { email } });
        if (!user) {
            user = this.userRepo.create({
                fullName: igUser.username || email,
                email,
                roles: [dto.role],
                currentRole: dto.role,
            });
            await this.userRepo.save(user);
            await this.createProfile(user, dto.role);
        }
        const tokens = await this.generateTokens(user);
        return { ...tokens, user: this.formatUser(user) };
    }
    async createProfile(user, role) {
        if (role === auth_dto_1.Role.BLOGGER || role === auth_dto_1.Role.AI_CREATOR) {
            const existing = await this.bloggerRepo.findOne({ where: { user: { id: user.id } } });
            if (!existing) {
                const profile = this.bloggerRepo.create({ user });
                await this.bloggerRepo.save(profile);
            }
        }
        else if (role === auth_dto_1.Role.BRAND) {
            const existing = await this.brandRepo.findOne({ where: { user: { id: user.id } } });
            if (!existing) {
                const profile = this.brandRepo.create({ user });
                await this.brandRepo.save(profile);
            }
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(blogger_profile_entity_1.BloggerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(brand_profile_entity_1.BrandProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map