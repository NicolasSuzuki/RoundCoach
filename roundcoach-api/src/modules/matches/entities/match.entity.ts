import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchResult } from '@prisma/client';

export class MatchScoreboardPlayerEntity {
  @ApiProperty()
  id!: string;

  @ApiPropertyOptional()
  puuid?: string | null;

  @ApiProperty()
  isCurrentUser!: boolean;

  @ApiProperty()
  gameName!: string;

  @ApiPropertyOptional()
  tagLine?: string | null;

  @ApiProperty()
  teamId!: string;

  @ApiProperty()
  agent!: string;

  @ApiPropertyOptional()
  competitiveTier?: number | null;

  @ApiProperty()
  kills!: number;

  @ApiProperty()
  deaths!: number;

  @ApiProperty()
  assists!: number;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  acs!: number;

  @ApiPropertyOptional()
  adr?: number | null;

  @ApiPropertyOptional()
  headshotPercentage?: number | null;

  @ApiPropertyOptional()
  kastPercentage?: number | null;

  @ApiProperty()
  firstKills!: number;

  @ApiProperty()
  firstDeaths!: number;

  @ApiProperty()
  multiKills!: number;

  constructor(data: MatchScoreboardPlayerEntity) {
    Object.assign(this, data);
  }
}

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

  @ApiPropertyOptional()
  externalSource?: string | null;

  @ApiPropertyOptional()
  externalId?: string | null;

  @ApiPropertyOptional({ type: [MatchScoreboardPlayerEntity] })
  scoreboardPlayers?: MatchScoreboardPlayerEntity[];

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
    externalSource?: string | null;
    externalId?: string | null;
    scoreboardPlayers?: MatchScoreboardPlayerEntity[];
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
    this.externalSource = data.externalSource;
    this.externalId = data.externalId;
    this.scoreboardPlayers = data.scoreboardPlayers?.map(
      (player) => new MatchScoreboardPlayerEntity(player),
    );
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
