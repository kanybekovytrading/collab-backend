import {
  BadRequestException,
  Injectable,
  OnApplicationBootstrap,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as admin from 'firebase-admin';
import { User } from '../database/entities/user.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { RegisterDto, LoginDto, OAuthDto, InstagramLoginDto, Role } from './auth.dto';

@Injectable()
export class AuthService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(BloggerProfile) private bloggerRepo: Repository<BloggerProfile>,
    @InjectRepository(BrandProfile) private brandRepo: Repository<BrandProfile>,
    private jwtService: JwtService,
    private cfg: ConfigService,
  ) {}

  private async generateTokens(user: User) {
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

  private formatUser(user: User) {
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

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already taken');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({
      fullName: dto.fullName,
      email: dto.email,
      password: hashed,
      phone: dto.phone,
      roles: [dto.role as any],
      currentRole: dto.role,
    });
    await this.userRepo.save(user);

    await this.createProfile(user, dto.role);

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.formatUser(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      select: ['id', 'fullName', 'email', 'phone', 'password', 'roles', 'currentRole', 'active', 'verified', 'avatarUrl'],
    });
    if (!user) throw new BadRequestException('Invalid email or password');
    if (!user.active) throw new UnauthorizedException('Account is banned');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new BadRequestException('Invalid email or password');

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.formatUser(user) };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.cfg.get('JWT_REFRESH_SECRET', 'refresh-secret'),
      });
      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new Error();
      const tokens = await this.generateTokens(user);
      return { ...tokens, user: this.formatUser(user) };
    } catch {
      throw new BadRequestException('Invalid or expired refresh token');
    }
  }

  async oauthLogin(dto: OAuthDto) {
    let firebaseUser: admin.auth.DecodedIdToken;
    try {
      firebaseUser = await admin.auth().verifyIdToken(dto.firebaseToken);
    } catch {
      throw new BadRequestException('Invalid Firebase token');
    }

    const email = firebaseUser.email;
    if (!email) throw new BadRequestException('Email not provided by OAuth provider');

    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      user = this.userRepo.create({
        fullName: firebaseUser.name || email.split('@')[0],
        email,
        avatarUrl: firebaseUser.picture,
        roles: [dto.role as any],
        currentRole: dto.role,
      });
      await this.userRepo.save(user);
      await this.createProfile(user, dto.role);
    }

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.formatUser(user) };
  }

  async instagramLogin(dto: InstagramLoginDto) {
    // Exchange code for token via Instagram Graph API
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
    const data = await response.json() as any;
    if (!data.access_token) throw new BadRequestException('Invalid Instagram code');

    // Get user info
    const userInfoRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${data.access_token}`,
    );
    const igUser = await userInfoRes.json() as any;

    const email = `ig_${igUser.id}@collab.app`;
    let user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      user = this.userRepo.create({
        fullName: igUser.username || email,
        email,
        roles: [dto.role as any],
        currentRole: dto.role,
      });
      await this.userRepo.save(user);
      await this.createProfile(user, dto.role);
    }

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.formatUser(user) };
  }

  async onApplicationBootstrap() {
    const adminEmail = 'admin@gmail.com';
    const existing = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (existing) return;

    const hashed = await bcrypt.hash('randomchik', 10);
    const admin = this.userRepo.create({
      fullName: 'Admin',
      email: adminEmail,
      password: hashed,
      roles: ['ADMIN' as any],
      currentRole: 'ADMIN',
    });
    await this.userRepo.save(admin);
    console.log('[AuthService] Admin account created');
  }

  async adminLogin(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'fullName', 'email', 'phone', 'password', 'roles', 'currentRole', 'active', 'verified', 'avatarUrl'],
    });
    if (!user) throw new BadRequestException('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new BadRequestException('Invalid email or password');

    if (!user.roles.includes('ADMIN' as any)) {
      throw new UnauthorizedException('Not an admin');
    }

    user.currentRole = 'ADMIN';
    await this.userRepo.save(user);

    const tokens = await this.generateTokens(user);
    return { ...tokens, user: this.formatUser(user) };
  }

  private async createProfile(user: User, role: string) {
    if (role === Role.BLOGGER || role === Role.AI_CREATOR) {
      const existing = await this.bloggerRepo.findOne({ where: { user: { id: user.id } } });
      if (!existing) {
        const profile = this.bloggerRepo.create({ user });
        await this.bloggerRepo.save(profile);
      }
    } else if (role === Role.BRAND) {
      const existing = await this.brandRepo.findOne({ where: { user: { id: user.id } } });
      if (!existing) {
        const profile = this.brandRepo.create({ user });
        await this.brandRepo.save(profile);
      }
    }
  }
}
