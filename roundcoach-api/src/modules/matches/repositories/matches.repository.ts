import { Injectable } from '@nestjs/common';
import { Match, Prisma } from '@prisma/client';
import { PaginatedResult } from '../../../common/types/paginated-result.type';
import { buildPaginationMeta } from '../../../common/utils/pagination.util';
import { PrismaService } from '../../../database/prisma/prisma.service';
import { ListMatchesQueryDto } from '../dtos/list-matches-query.dto';

@Injectable()
export class MatchesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MatchUncheckedCreateInput): Promise<Match> {
    return this.prisma.match.create({ data });
  }

  async findAllByUserId(
    userId: string,
    query: ListMatchesQueryDto,
  ): Promise<PaginatedResult<Match>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.MatchWhereInput = {
      userId,
      ...(query.map
        ? {
            map: {
              contains: query.map,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.agent
        ? {
            agent: {
              contains: query.agent,
              mode: 'insensitive',
            },
          }
        : {}),
      ...(query.result ? { result: query.result } : {}),
      ...(query.fromDate || query.toDate
        ? {
            matchDate: {
              ...(query.fromDate ? { gte: query.fromDate } : {}),
              ...(query.toDate ? { lte: query.toDate } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.match.findMany({
        where,
        orderBy: { matchDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.match.count({ where }),
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

  async findById(id: string): Promise<Match | null> {
    return this.prisma.match.findUnique({
      where: { id },
    });
  }

  async update(id: string, data: Prisma.MatchUpdateInput): Promise<Match> {
    return this.prisma.match.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.match.delete({
      where: { id },
    });
  }
}
