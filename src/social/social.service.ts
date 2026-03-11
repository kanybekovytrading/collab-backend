import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const OAUTH_URLS: Record<string, (cfg: ConfigService) => string> = {
  INSTAGRAM: (cfg) =>
    `https://api.instagram.com/oauth/authorize?client_id=${cfg.get('INSTAGRAM_CLIENT_ID')}&redirect_uri=${encodeURIComponent(cfg.get('INSTAGRAM_REDIRECT_URI', ''))}&scope=user_profile,user_media&response_type=code`,
  TIKTOK: () => 'https://www.tiktok.com/auth/authorize/?client_key=YOUR_KEY&scope=user.info.basic&response_type=code',
};

@Injectable()
export class SocialService {
  constructor(private cfg: ConfigService) {}

  async validate(platform: string, username?: string) {
    const requiresOAuth = ['INSTAGRAM', 'TIKTOK', 'THREADS'].includes(platform);

    if (requiresOAuth) {
      return { platform, username, exists: null, followersCount: null, requiresOAuth: true };
    }

    // For YouTube, VK, Telegram — try to fetch public data
    let followersCount: number | null = null;
    let exists = false;

    try {
      if (platform === 'TELEGRAM' && username) {
        const res = await fetch(`https://t.me/${username}`);
        exists = res.ok;
      } else if (platform === 'YOUTUBE' && username) {
        exists = true; // Would use YouTube Data API in production
        followersCount = 0;
      } else if (platform === 'VKONTAKTE' && username) {
        exists = true;
        followersCount = 0;
      }
    } catch {
      exists = false;
    }

    return { platform, username, exists, followersCount, requiresOAuth: false };
  }

  getOAuthUrl(platform: string) {
    const urlFn = OAUTH_URLS[platform];
    const authUrl = urlFn ? urlFn(this.cfg) : `https://oauth.example.com/${platform}`;
    return { authUrl, platform };
  }

  async handleCallback(platform: string, code: string, state: string) {
    // Handled in auth flows — this is the redirect endpoint
    return { platform, code, state };
  }
}
