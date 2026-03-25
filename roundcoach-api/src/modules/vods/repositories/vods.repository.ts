import { Injectable } from '@nestjs/common';
import { Prisma, Vod } from '@prisma/client';
import { PaginatedResult } from '../../../common/types/paginated-result.type';
import { buildPaginationMeta } from '../../../common/utils/pagination.util';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ListVodsQueryDto } from '../dtos/list-vods-query.dto';

@Injectable()
export class VodsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.VodUncheckedCreateInput): Promise<Vod> {
    return this.prisma.vod.create({ data });
  }

  async findAllByUserId(
    userId: string,
    query: ListVodsQueryDto,
  ): Promise<PaginatedResult<Vod>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.VodWhereInput = {
      userId,
      ...(query.status ? { status: query.status } : {}),
      ...(query.matchId ? { matchId: query.matchId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.vod.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.vod.count({ where }),
    ]);

    return {
      items,
      meta: buildPaginationMeta({
        page,
        limit,
        total,
      }),
    };
  }

  async findById(id: string): Promise<Vod | null> {
    return this.prisma.vod.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.VodUpdateInput): Promise<Vod> {
    return this.prisma.vod.update({
      where: { id },
      data,
    });
  }
}
