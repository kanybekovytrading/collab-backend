import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BrandProfile } from '../database/entities/brand-profile.entity';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(BrandProfile) private brandRepo: Repository<BrandProfile>,
  ) {}

  async findAll(page = 0, size = 20) {
    const [items, total] = await this.brandRepo.findAndCount({
      relations: ['user'],
      order: { rating: 'DESC' },
      skip: page * size,
      take: size,
    });
    return {
      content: items.map((b) => this.format(b)),
      page, size, totalElements: total,
      totalPages: Math.ceil(total / size),
      first: page === 0,
      last: (page + 1) * size >= total,
    };
  }

  async findOne(userId: string) {
    const b = await this.brandRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!b) throw new NotFoundException('Brand not found');
    return this.format(b);
  }

  async update(userId: string, dto: any) {
    const b = await this.brandRepo.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!b) throw new NotFoundException('Brand profile not found');

    const { avatarUrl, fullName, city, country, ...brandFields } = dto;

    if (avatarUrl !== undefined) b.user.avatarUrl = avatarUrl;
    if (fullName !== undefined) b.user.fullName = fullName;
    if (city !== undefined) b.user.city = city;
    if (country !== undefined) b.user.country = country;

    if (avatarUrl !== undefined || fullName !== undefined || city !== undefined || country !== undefined) {
      await this.brandRepo.manager.save(b.user);
    }

    Object.assign(b, brandFields);
    await this.brandRepo.save(b);
    return this.format(b);
  }

  format(b: BrandProfile) {
    return {
      id: b.user?.id,
      fullName: b.user?.fullName,
      companyName: b.companyName,
      avatarUrl: b.user?.avatarUrl,
      city: b.user?.city,
      country: b.user?.country,
      verified: b.user?.verified,
      description: b.description,
      websiteUrl: b.websiteUrl,
      category: b.category,
      rating: b.rating,
      tasksCount: b.tasksCount,
      reviewsCount: b.reviewsCount,
      socialAccounts: b.socialAccounts || [],
    };
  }
}
