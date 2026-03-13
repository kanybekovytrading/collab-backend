import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Task, TaskStatus } from '../database/entities/task.entity';
import { Application } from '../database/entities/application.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(BloggerProfile)
    private bloggerRepo: Repository<BloggerProfile>,
    @InjectRepository(BrandProfile) private brandRepo: Repository<BrandProfile>,
    @InjectRepository(CompletionRecord)
    private completionRepo: Repository<CompletionRecord>,
  ) {}

  async getUsers(search?: string, page = 0, size = 20) {
    const where: any = search
      ? [{ fullName: Like(`%${search}%`) }, { email: Like(`%${search}%`) }]
      : {};

    const [items, total] = await this.userRepo.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });

    return {
      content: items.map((u) => this.formatUser(u)),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
    };
  }

  async banUser(id: string, active: boolean) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.active = active;
    await this.userRepo.save(user);
    return this.formatUser(user);
  }

  async verifyUser(id: string, verified: boolean) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    user.verified = verified;
    await this.userRepo.save(user);
    return this.formatUser(user);
  }

  async getTasks(status?: string, search?: string, page = 0, size = 20) {
    const qb = this.taskRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.brand', 'u');
    if (status) qb.where('t.status = :status', { status });
    if (search) qb.andWhere('t.title ILIKE :s', { s: `%${search}%` });
    qb.orderBy('t.createdAt', 'DESC')
      .skip(page * size)
      .take(size);
    const [items, total] = await qb.getManyAndCount();
    return {
      content: items.map((t) => this.formatTask(t)),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
    };
  }

  async verifyTask(id: string, status: TaskStatus) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['brand'],
    });
    if (!task) throw new NotFoundException('Task not found');
    task.status = status;
    await this.taskRepo.save(task);
    return this.formatTask(task);
  }

  async restoreTask(id: string) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['brand'],
    });
    if (!task) throw new NotFoundException('Task not found');
    task.status = TaskStatus.ACTIVE;
    await this.taskRepo.save(task);
    return this.formatTask(task);
  }

  async deleteTask(id: string, reason?: string) {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    task.status = TaskStatus.DELETED;
    await this.taskRepo.save(task);
  }

  async getStats() {
    const [
      totalUsers,
      totalBloggers,
      totalBrands,
      totalTasks,
      activeTasks,
      completedCollaborations,
      totalApplications,
    ] = await Promise.all([
      this.userRepo.count(),
      this.bloggerRepo.count(),
      this.brandRepo.count(),
      this.taskRepo.count(),
      this.taskRepo.count({ where: { status: TaskStatus.ACTIVE } }),
      this.completionRepo.count(),
      this.appRepo.count(),
    ]);

    return {
      totalUsers,
      totalBloggers,
      totalBrands,
      totalTasks,
      activeTasks,
      completedCollaborations,
      totalApplications,
      generatedAt: new Date(),
    };
  }

  formatUser(u: User) {
    return {
      id: u.id,
      fullName: u.fullName,
      email: u.email,
      phone: u.phone,
      roles: u.roles,
      currentRole: u.currentRole,
      verified: u.verified,
      active: u.active,
      city: u.city,
      country: u.country,
      createdAt: u.createdAt,
    };
  }

  formatTask(t: Task) {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      taskType: t.taskType,
      status: t.status,
      brandName: t.brand?.fullName,
      brandEmail: t.brand?.email,
      createdAt: t.createdAt,
    };
  }
}
