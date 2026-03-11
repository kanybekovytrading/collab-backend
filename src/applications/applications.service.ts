import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from '../database/entities/application.entity';
import { Task, TaskStatus } from '../database/entities/task.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(BloggerProfile) private bloggerRepo: Repository<BloggerProfile>,
    @InjectRepository(BrandProfile) private brandRepo: Repository<BrandProfile>,
    @InjectRepository(CompletionRecord) private completionRepo: Repository<CompletionRecord>,
  ) {}

  async apply(user: User, dto: { taskId: string; coverLetter?: string; proposedPrice?: number }) {
    const task = await this.taskRepo.findOne({ where: { id: dto.taskId } });
    if (!task) throw new NotFoundException('Task not found');
    if (task.status !== TaskStatus.ACTIVE) throw new BadRequestException('Task is not active');

    const existing = await this.appRepo.findOne({
      where: { blogger: { id: user.id }, task: { id: dto.taskId } },
    });
    if (existing) throw new ConflictException('Already applied to this task');

    const app = this.appRepo.create({
      blogger: user,
      task,
      coverLetter: dto.coverLetter,
      proposedPrice: dto.proposedPrice,
    });
    await this.appRepo.save(app);
    return this.format(app);
  }

  async invite(brandUser: User, dto: { taskId: string; bloggerId: string }) {
    const task = await this.taskRepo.findOne({ where: { id: dto.taskId, brand: { id: brandUser.id } } });
    if (!task) throw new NotFoundException('Task not found or not yours');

    const blogger = await this.bloggerRepo.findOne({ where: { user: { id: dto.bloggerId } } });
    if (!blogger) throw new NotFoundException('Blogger not found');

    const app = this.appRepo.create({
      blogger: blogger.user,
      task,
      invited: true,
    });
    await this.appRepo.save(app);
  }

  async getByTask(brandUser: User, taskId: string, page = 0, size = 20) {
    const task = await this.taskRepo.findOne({ where: { id: taskId, brand: { id: brandUser.id } } });
    if (!task) throw new ForbiddenException('Not your task');

    const [items, total] = await this.appRepo.findAndCount({
      where: { task: { id: taskId } },
      relations: ['blogger', 'task'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
    return this.paginate(items.map(a => this.format(a)), total, page, size);
  }

  async getMy(userId: string, page = 0, size = 20) {
    const [items, total] = await this.appRepo.findAndCount({
      where: { blogger: { id: userId } },
      relations: ['task', 'blogger'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
    return this.paginate(items.map(a => this.format(a)), total, page, size);
  }

  async accept(brandUser: User, id: string) {
    const app = await this.getApp(id);
    if (app.task.brand.id !== brandUser.id) throw new ForbiddenException('Not your task');
    if (app.status !== ApplicationStatus.PENDING) throw new BadRequestException('Application is not PENDING');
    app.status = ApplicationStatus.IN_WORK;
    await this.appRepo.save(app);
  }

  async reject(brandUser: User, id: string) {
    const app = await this.getApp(id);
    if (app.task.brand.id !== brandUser.id) throw new ForbiddenException('Not your task');
    app.status = ApplicationStatus.REJECTED;
    await this.appRepo.save(app);
  }

  async cancel(user: User, id: string) {
    const app = await this.getApp(id);
    if (app.blogger.id !== user.id && app.task.brand.id !== user.id)
      throw new ForbiddenException('Not your application');
    if (app.status === ApplicationStatus.COMPLETED)
      throw new BadRequestException('Cannot cancel completed application');
    app.status = ApplicationStatus.CANCELLED;
    await this.appRepo.save(app);
  }

  async submit(userId: string, id: string, dto: { workUrl?: string; comment?: string }) {
    const app = await this.getApp(id);
    if (app.blogger.id !== userId) throw new ForbiddenException('Not your application');
    if (![ApplicationStatus.IN_WORK, ApplicationStatus.REVISION_REQUESTED].includes(app.status))
      throw new BadRequestException('Invalid status for submission');
    app.status = ApplicationStatus.SUBMITTED;
    app.workUrl = dto.workUrl;
    await this.appRepo.save(app);
  }

  async requestRevision(brandUser: User, id: string, dto: { comment?: string }) {
    const app = await this.getApp(id);
    if (app.task.brand.id !== brandUser.id) throw new ForbiddenException('Not your task');
    app.status = ApplicationStatus.REVISION_REQUESTED;
    app.revisionComment = dto.comment;
    app.revisionCount++;
    await this.appRepo.save(app);
  }

  async approve(brandUser: User, id: string) {
    const app = await this.getApp(id);
    if (app.task.brand.id !== brandUser.id) throw new ForbiddenException('Not your task');
    if (app.status !== ApplicationStatus.SUBMITTED)
      throw new BadRequestException('Work not submitted yet');

    app.status = ApplicationStatus.COMPLETED;
    await this.appRepo.save(app);

    // Create completion record
    const rec = this.completionRepo.create({ application: app });
    await this.completionRepo.save(rec);

    // Update counters
    await this.bloggerRepo
      .createQueryBuilder()
      .update(BloggerProfile)
      .set({ completedTasksCount: () => '"completedTasksCount" + 1' })
      .where('"userId" = :uid', { uid: app.blogger.id })
      .execute();

    await this.brandRepo
      .createQueryBuilder()
      .update(BrandProfile)
      .set({ tasksCount: () => '"tasksCount" + 1' })
      .where('"userId" = :uid', { uid: app.task.brand.id })
      .execute();
  }

  private async getApp(id: string) {
    const app = await this.appRepo.findOne({
      where: { id },
      relations: ['blogger', 'task', 'task.brand'],
    });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  format(a: Application) {
    return {
      id: a.id,
      status: a.status,
      coverLetter: a.coverLetter,
      proposedPrice: a.proposedPrice,
      invited: a.invited,
      workUrl: a.workUrl,
      revisionComment: a.revisionComment,
      revisionCount: a.revisionCount,
      createdAt: a.createdAt,
      blogger: a.blogger ? { id: a.blogger.id, fullName: a.blogger.fullName, avatarUrl: a.blogger.avatarUrl } : null,
      task: a.task ? { id: a.task.id, title: a.task.title } : null,
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
