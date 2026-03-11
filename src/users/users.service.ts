import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../database/entities/user.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(BloggerProfile) private bloggerRepo: Repository<BloggerProfile>,
    @InjectRepository(BrandProfile) private brandRepo: Repository<BrandProfile>,
  ) {}

  async addRole(userId: string, role: Role) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    const allowed: Record<string, Role[]> = {
      [Role.BLOGGER]: [Role.AI_CREATOR],
      [Role.AI_CREATOR]: [Role.BLOGGER],
    };
    const allowedRoles = allowed[user.currentRole] || [];
    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException(`Cannot add role ${role} from current role ${user.currentRole}`);
    }
    if (user.roles.includes(role)) throw new BadRequestException('Role already added');

    user.roles = [...user.roles, role];
    await this.userRepo.save(user);

    // Create blogger profile if not exists
    const existing = await this.bloggerRepo.findOne({ where: { user: { id: userId } } });
    if (!existing) {
      await this.bloggerRepo.save(this.bloggerRepo.create({ user }));
    }

    return { currentRole: user.currentRole, allRoles: user.roles };
  }

  async switchRole(userId: string, role: Role) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user.roles.includes(role)) throw new BadRequestException('Role not added to your account');
    user.currentRole = role;
    await this.userRepo.save(user);
    return { currentRole: user.currentRole, allRoles: user.roles };
  }
}
