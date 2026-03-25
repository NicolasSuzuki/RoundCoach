import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Match } from '@prisma/client';
import { PaginatedResult } from '../../../common/types/paginated-result.type';
import { CreateMatchDto } from '../dtos/create-match.dto';
import { ListMatchesQueryDto } from '../dtos/list-matches-query.dto';
import { UpdateMatchDto } from '../dtos/update-match.dto';
import { MatchesRepository } from '../repositories/matches.repository';

@Injectable()
export class MatchesService {
  constructor(private readonly matchesRepository: MatchesRepository) {}

  async create(userId: string, dto: CreateMatchDto): Promise<Match> {
    return this.matchesRepository.create({
      ...dto,
      userId,
    });
  }

  async findAllByUser(
    userId: string,
    query: ListMatchesQueryDto,
  ): Promise<PaginatedResult<Match>> {
    return this.matchesRepository.findAllByUserId(userId, query);
  }

  async findByIdForUser(id: string, userId: string): Promise<Match> {
    const match = await this.matchesRepository.findById(id);

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    if (match.userId !== userId) {
      throw new ForbiddenException('You do not have access to this match');
    }

    return match;
  }

  async update(id: string, userId: string, dto: UpdateMatchDto): Promise<Match> {
    await this.findByIdForUser(id, userId);
    return this.matchesRepository.update(id, dto);
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findByIdForUser(id, userId);
    await this.matchesRepository.delete(id);
  }
}
