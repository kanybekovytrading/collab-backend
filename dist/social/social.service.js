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
exports.SocialService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const OAUTH_URLS = {
    INSTAGRAM: (cfg) => `https://api.instagram.com/oauth/authorize?client_id=${cfg.get('INSTAGRAM_CLIENT_ID')}&redirect_uri=${encodeURIComponent(cfg.get('INSTAGRAM_REDIRECT_URI', ''))}&scope=user_profile,user_media&response_type=code`,
    TIKTOK: () => 'https://www.tiktok.com/auth/authorize/?client_key=YOUR_KEY&scope=user.info.basic&response_type=code',
};
let SocialService = class SocialService {
    cfg;
    constructor(cfg) {
        this.cfg = cfg;
    }
    async validate(platform, username) {
        const requiresOAuth = ['INSTAGRAM', 'TIKTOK', 'THREADS'].includes(platform);
        if (requiresOAuth) {
            return { platform, username, exists: null, followersCount: null, requiresOAuth: true };
        }
        let followersCount = null;
        let exists = false;
        try {
            if (platform === 'TELEGRAM' && username) {
                const res = await fetch(`https://t.me/${username}`);
                exists = res.ok;
            }
            else if (platform === 'YOUTUBE' && username) {
                exists = true;
                followersCount = 0;
            }
            else if (platform === 'VKONTAKTE' && username) {
                exists = true;
                followersCount = 0;
            }
        }
        catch {
            exists = false;
        }
        return { platform, username, exists, followersCount, requiresOAuth: false };
    }
    getOAuthUrl(platform) {
        const urlFn = OAUTH_URLS[platform];
        const authUrl = urlFn ? urlFn(this.cfg) : `https://oauth.example.com/${platform}`;
        return { authUrl, platform };
    }
    async handleCallback(platform, code, state) {
        return { platform, code, state };
    }
};
exports.SocialService = SocialService;
exports.SocialService = SocialService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], SocialService);
//# sourceMappingURL=social.service.js.map