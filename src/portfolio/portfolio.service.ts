import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortfolioItem } from '../database/entities/portfolio-item.entity';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioItem) private itemRepo: Repository<PortfolioItem>,
    @InjectRepository(BloggerProfile) private bloggerRepo: Repository<BloggerProfile>,
  ) {}

  async getPortfolio(userId: string) {
    const items = await this.itemRepo.find({
      where: { blogger: { user: { id: userId } } },
      order: { sortOrder: 'ASC' },
    });
    return items.map(i => this.format(i));
  }

  async add(userId: string, dto: any) {
    const blogger = await this.bloggerRepo.findOne({ where: { user: { id: userId } } });
    if (!blogger) throw new NotFoundException('Blogger profile not found');

    const count = await this.itemRepo.count({ where: { blogger: { id: blogger.id } } });
    if (count >= 20) throw new BadRequestException('Portfolio limit reached (max 20)');

    const item = this.itemRepo.create({ ...dto, blogger });
    await this.itemRepo.save(item);
    return this.format(item as unknown as PortfolioItem);
  }

  async delete(userId: string, itemId: string) {
    const item = await this.itemRepo.findOne({
      where: { id: itemId, blogger: { user: { id: userId } } },
    });
    if (!item) throw new NotFoundException('Portfolio item not found');
    await this.itemRepo.remove(item);
  }

  async reorder(userId: string, orderedIds: string[]) {
    const blogger = await this.bloggerRepo.findOne({ where: { user: { id: userId } } });
    if (!blogger) throw new NotFoundException('Blogger profile not found');

    for (let i = 0; i < orderedIds.length; i++) {
      await this.itemRepo.update(
        { id: orderedIds[i], blogger: { id: blogger.id } },
        { sortOrder: i },
      );
    }

    const items = await this.itemRepo.find({
      where: { blogger: { id: blogger.id } },
      order: { sortOrder: 'ASC' },
    });
    return items.map(i => this.format(i));
  }

  async getFeed(query: {
    contentType?: string;
    category?: string;
    platform?: string;
    followersMin?: string;
    followersMax?: string;
    page?: string;
    size?: string;
  }) {
    const page = Math.max(0, parseInt(query.page ?? '0', 10));
    const size = Math.min(50, Math.max(1, parseInt(query.size ?? '20', 10)));

    const qb = this.itemRepo
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.blogger', 'blogger')
      .leftJoinAndSelect('blogger.user', 'user')
      .where('item.mediaUrl IS NOT NULL')
      .andWhere('user.active = true')
      .orderBy('item.createdAt', 'DESC')
      .skip(page * size)
      .take(size);

    if (query.contentType) {
      qb.andWhere('UPPER(item.contentType) = :ct', {
        ct: query.contentType.toUpperCase(),
      });
    }

    if (query.category) {
      qb.andWhere(':cat = ANY(string_to_array(blogger.categories, \',\'))', {
        cat: query.category,
      });
    }

    if (query.platform) {
      qb.andWhere(
        `EXISTS (SELECT 1 FROM jsonb_array_elements(blogger."socialAccounts") AS sa WHERE sa->>'platform' = :platform)`,
        { platform: query.platform.toUpperCase() },
      );
    }

    if (query.followersMin || query.followersMax) {
      const min = parseInt(query.followersMin ?? '0', 10);
      const max = parseInt(query.followersMax ?? '999999999', 10);
      qb.andWhere(
        `EXISTS (SELECT 1 FROM jsonb_array_elements(blogger."socialAccounts") AS sa WHERE (sa->>'followersCount')::bigint BETWEEN :min AND :max)`,
        { min, max },
      );
    }

    const [items, total] = await qb.getManyAndCount();

    return {
      content: items.map((i) => this.formatFeed(i)),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
    };
  }

  formatFeed(i: any) {
    return {
      id: i.id,
      mediaUrl: i.mediaUrl,
      thumbnailUrl: i.thumbnailUrl,
      contentType: i.contentType,
      title: i.title,
      createdAt: i.createdAt,
      blogger: {
        id: i.blogger?.user?.id,
        fullName: i.blogger?.user?.fullName,
        avatarUrl: i.blogger?.user?.avatarUrl,
        categories: i.blogger?.categories,
        socialAccounts: i.blogger?.socialAccounts || [],
        rating: Number(i.blogger?.rating ?? 0),
        completedTasksCount: i.blogger?.completedTasksCount ?? 0,
      },
    };
  }

  format(i: PortfolioItem) {
    return {
      id: i.id,
      mediaUrl: i.mediaUrl,
      title: i.title,
      contentType: i.contentType,
      thumbnailUrl: i.thumbnailUrl,
      sortOrder: i.sortOrder,
    };
  }
}
