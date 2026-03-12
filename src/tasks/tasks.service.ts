import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from '../database/entities/task.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { User, Role } from '../database/entities/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(BrandProfile) private brandRepo: Repository<BrandProfile>,
  ) {}

  async create(user: User, dto: any) {
    if (user.currentRole !== Role.BRAND) throw new ForbiddenException('Only brands can create tasks');
    const task = this.taskRepo.create({ ...dto, brand: user });
    await this.taskRepo.save(task);
    return this.format(task as unknown as Task);
  }

  async findAll(filters: any) {
    const { taskType, city, acceptsUgc, acceptsAi, page = 0, size = 20 } = filters;
    const qb = this.taskRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.brand', 'u')
      .where('t.status != :status', { status: TaskStatus.DELETED });

    if (taskType) qb.andWhere('t.taskType = :taskType', { taskType });
    if (city) qb.andWhere('t.city ILIKE :city', { city: `%${city}%` });
    if (acceptsUgc !== undefined) qb.andWhere('t.acceptsUgc = :ugc', { ugc: acceptsUgc === 'true' });
    if (acceptsAi !== undefined) qb.andWhere('t.acceptsAi = :ai', { ai: acceptsAi === 'true' });

    qb.orderBy('t.createdAt', 'DESC').skip(page * size).take(size);
    const [items, total] = await qb.getManyAndCount();
    return this.paginate(items.map(t => this.format(t)), total, +page, +size);
  }

  async findOne(id: string) {
    const t = await this.taskRepo.findOne({ where: { id }, relations: ['brand'] });
    if (!t) throw new NotFoundException('Task not found');
    return this.format(t);
  }

  async findMyTasks(userId: string, page = 0, size = 20) {
    const [items, total] = await this.taskRepo.findAndCount({
      where: { brand: { id: userId } },
      relations: ['brand'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
    return this.paginate(items.map(t => this.format(t)), total, page, size);
  }

  async delete(id: string, user: User) {
    const task = await this.taskRepo.findOne({ where: { id }, relations: ['brand'] });
    if (!task) throw new NotFoundException('Task not found');
    if (task.brand.id !== user.id && user.currentRole !== Role.ADMIN)
      throw new ForbiddenException('No permission');
    task.status = TaskStatus.DELETED;
    await this.taskRepo.save(task);
  }

  format(t: Task) {
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      taskType: t.taskType,
      coverImageUrl: t.coverImageUrl,
      city: t.city,
      online: t.online,
      deadlineDays: t.deadlineDays,
      price: t.price,
      priceDescription: t.priceDescription,
      status: t.status,
      reactionsCount: t.reactionsCount,
      acceptsUgc: t.acceptsUgc,
      acceptsAi: t.acceptsAi,
      genderFilter: t.genderFilter,
      categories: t.categories,
      createdAt: t.createdAt,
      brand: t.brand
        ? {
            id: t.brand.id,
            fullName: t.brand.fullName,
            companyName: null,
            avatarUrl: t.brand.avatarUrl,
            verified: t.brand.verified,
            rating: null,
          }
        : null,
    };
  }

  private paginate(content: any[], total: number, page: number, size: number) {
    return {
      content, page, size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
    };
  }
}
