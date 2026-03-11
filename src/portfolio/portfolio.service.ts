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
