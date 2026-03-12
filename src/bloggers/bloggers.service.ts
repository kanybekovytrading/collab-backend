import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloggerProfile } from '../database/entities/blogger-profile.entity';

@Injectable()
export class BloggersService {
  constructor(
    @InjectRepository(BloggerProfile) private bloggerRepo: Repository<BloggerProfile>,
  ) {}

  async findAll(filters: any) {
    const {
      country, city, minAge, maxAge, minRating, worksWithBarter,
      maxPrice, category, role, search, verifiedOnly, sortBy = 'rating',
      page = 0, size = 20,
    } = filters;

    const qb = this.bloggerRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .where('u.active = true');

    if (country) qb.andWhere('u.country = :country', { country });
    if (city) qb.andWhere('u.city ILIKE :city', { city: `%${city}%` });
    if (minAge) qb.andWhere('b.age >= :minAge', { minAge });
    if (maxAge) qb.andWhere('b.age <= :maxAge', { maxAge });
    if (minRating) qb.andWhere('b.rating >= :minRating', { minRating });
    if (worksWithBarter !== undefined) qb.andWhere('b.worksWithBarter = :w', { w: worksWithBarter });
    if (maxPrice) qb.andWhere('b.minPrice <= :maxPrice', { maxPrice });
    if (category) qb.andWhere(':cat = ANY(string_to_array(b.categories, \',\'))', { cat: category });
    if (role) qb.andWhere('u.currentRole = :role', { role });
    if (search) qb.andWhere('(u.fullName ILIKE :s OR b.bio ILIKE :s)', { s: `%${search}%` });
    if (verifiedOnly) qb.andWhere('u.verified = true');

    const sortMap: Record<string, { col: string; dir: 'ASC' | 'DESC' }> = {
      rating: { col: 'b.rating', dir: 'DESC' },
      price_asc: { col: 'b.minPrice', dir: 'ASC' },
      price_desc: { col: 'b.minPrice', dir: 'DESC' },
      tasks: { col: 'b.completedTasksCount', dir: 'DESC' },
      reviews: { col: 'b.reviewsCount', dir: 'DESC' },
    };
    const sort = sortMap[sortBy] || { col: 'b.rating', dir: 'DESC' };
    qb.orderBy(sort.col, sort.dir);
    qb.skip(page * size).take(size);

    const [items, total] = await qb.getManyAndCount();
    return {
      content: items.map((b, i) => this.format(b, page * size + i + 1)),
      page,
      size,
      totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
    };
  }

  async findOne(userId: string) {
    const b = await this.bloggerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user', 'portfolioItems'],
    });
    if (!b) throw new NotFoundException('Blogger not found');
    return this.format(b);
  }

  async update(userId: string, dto: any) {
    const b = await this.bloggerRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!b) throw new NotFoundException('Blogger profile not found');
    Object.assign(b, dto);
    await this.bloggerRepo.save(b);
    return this.format(b);
  }

  format(b: BloggerProfile, rank?: number) {
    return {
      id: b.user?.id,
      fullName: b.user?.fullName,
      avatarUrl: b.user?.avatarUrl,
      city: b.user?.city,
      country: b.user?.country,
      age: b.age,
      verified: b.user?.verified,
      bio: b.bio,
      categories: b.categories,
      minPrice: b.minPrice != null ? Number(b.minPrice) : null,
      worksWithBarter: b.worksWithBarter,
      rating: Number(b.rating),
      completedTasksCount: b.completedTasksCount,
      reviewsCount: b.reviewsCount,
      socialAccounts: b.socialAccounts || [],
      portfolioItems: (b.portfolioItems || []).map((pi) => ({
        id: pi.id,
        mediaUrl: pi.mediaUrl,
        title: pi.title,
        contentType: pi.contentType,
        thumbnailUrl: pi.thumbnailUrl,
        sortOrder: pi.sortOrder,
      })),
      rank: rank ?? null,
    };
  }
}
