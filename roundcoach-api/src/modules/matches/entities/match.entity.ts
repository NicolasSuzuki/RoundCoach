import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchResult } from '@prisma/client';

export class MatchEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  map!: string;

  @ApiProperty()
  agent!: string;

  @ApiProperty({ enum: MatchResult })
  result!: MatchResult;

  @ApiProperty()
  score!: string;

  @ApiProperty()
  matchDate!: Date;

  @ApiPropertyOptional()
  notes?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(data: {
    id: string;
    userId: string;
    map: string;
    agent: string;
    result: MatchResult;
    score: string;
    matchDate: Date;
    notes?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.map = data.map;
    this.agent = data.agent;
    this.result = data.result;
    this.score = data.score;
    this.matchDate = data.matchDate;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
