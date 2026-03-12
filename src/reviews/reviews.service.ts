import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../database/entities/review.entity';
import {
  Application,
  ApplicationStatus,
} from '../database/entities/application.entity';
import { CompletionRecord } from '../database/entities/completion-record.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';
import { BrandProfile } from '../database/entities/brand-profile.entity';
import { User } from '../database/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(Application) private appRepo: Repository<Application>,
    @InjectRepository(CompletionRecord)
    private completionRepo: Repository<CompletionRecord>,
    @InjectRepository(BloggerProfile)
    private bloggerRepo: Repository<BloggerProfile>,
    @InjectRepository(BrandProfile) private brandRepo: Repository<BrandProfile>,
  ) {}

  async canReview(user: User, applicationId: string) {
    const app = await this.appRepo.findOne({
      where: { id: applicationId },
      relations: ['blogger', 'task', 'task.brand'],
    });
    if (!app) return { canReview: false, reason: 'Application not found' };

    const isParticipant =
      app.blogger.id === user.id || app.task.brand.id === user.id;
    if (!isParticipant)
      return { canReview: false, reason: 'Not a participant' };
    if (app.status !== ApplicationStatus.COMPLETED)
      return { canReview: false, reason: 'Collaboration not completed' };

    const existing = await this.reviewRepo.findOne({
      where: { author: { id: user.id }, application: { id: applicationId } },
    });
    if (existing) return { canReview: false, reason: 'Already reviewed' };

    return { canReview: true, reason: null };
  }

  async create(
    author: User,
    dto: { applicationId: string; rating: number; comment?: string },
  ) {
    const app = await this.appRepo.findOne({
      where: { id: dto.applicationId },
      relations: ['blogger', 'task', 'task.brand'],
    });
    if (!app) throw new NotFoundException('Application not found');
    if (app.status !== ApplicationStatus.COMPLETED)
      throw new BadRequestException('Collaboration not completed');

    const completion = await this.completionRepo.findOne({
      where: { application: { id: app.id } },
    });
    if (!completion) throw new BadRequestException('No completion record');

    const isParticipant =
      app.blogger.id === author.id || app.task.brand.id === author.id;
    if (!isParticipant) throw new ForbiddenException('Not a participant');

    const existing = await this.reviewRepo.findOne({
      where: {
        author: { id: author.id },
        application: { id: dto.applicationId },
      },
    });
    if (existing) throw new ConflictException('Already reviewed');

    // Brand reviews blogger, blogger reviews brand
    const targetId =
      author.id === app.blogger.id ? app.task.brand.id : app.blogger.id;
    const target = { id: targetId } as User;

    const review = this.reviewRepo.create({
      author,
      target,
      application: app,
      rating: dto.rating,
      comment: dto.comment,
    });
    await this.reviewRepo.save(review);

    // Recalculate rating
    await this.recalculateRating(targetId);

    return this.format(review);
  }

  async getByUser(userId: string, page = 0, size = 20) {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { target: { id: userId } },
      relations: ['author', 'target'],
      order: { createdAt: 'DESC' },
      skip: page * size,
      take: size,
    });
    return {
      content: items.map((r) => this.format(r)),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
    };
  }

  private async recalculateRating(userId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('"targetId" = :userId', { userId })
      .getRawOne();

    const avg = parseFloat(result?.avg || '0');
    const count = parseInt(result?.count || '0');

    // Update blogger or brand
    await this.bloggerRepo
      .createQueryBuilder()
      .update(BloggerProfile)
      .set({ rating: avg, reviewsCount: count })
      .where('"userId" = :userId', { userId })
      .execute();

    await this.brandRepo
      .createQueryBuilder()
      .update(BrandProfile)
      .set({ rating: avg, reviewsCount: count })
      .where('"userId" = :userId', { userId })
      .execute();
  }

  format(r: Review) {
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      author: r.author
        ? {
            id: r.author.id,
            fullName: r.author.fullName,
            avatarUrl: r.author.avatarUrl,
          }
        : null,
      createdAt: r.createdAt,
    };
  }
}
