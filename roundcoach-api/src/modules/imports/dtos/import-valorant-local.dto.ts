import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchResult } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class ImportValorantLocalScoreboardPlayerDto {
  @ApiPropertyOptional({ example: '4cb9fb91-e150-55c4-a11f-6317844cd156' })
  @IsOptional()
  @IsString()
  @Length(6, 120)
  puuid?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isCurrentUser?: boolean;

  @ApiProperty({ example: 'SuJhin' })
  @IsString()
  @Length(1, 80)
  gameName!: string;

  @ApiPropertyOptional({ example: '1704' })
  @IsOptional()
  @IsString()
  @Length(1, 20)
  tagLine?: string;

  @ApiProperty({ example: 'Blue' })
  @IsString()
  @Length(1, 40)
  teamId!: string;

  @ApiProperty({ example: 'Jett' })
  @IsString()
  @Length(2, 60)
  agent!: string;

  @ApiPropertyOptional({ example: 21 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(40)
  competitiveTier?: number;

  @ApiProperty({ example: 19 })
  @IsInt()
  @Min(0)
  @Max(80)
  kills!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  @Max(80)
  deaths!: number;

  @ApiProperty({ example: 9 })
  @IsInt()
  @Min(0)
  @Max(80)
  assists!: number;

  @ApiProperty({ example: 5660 })
  @IsInt()
  @Min(0)
  @Max(50000)
  score!: number;

  @ApiProperty({ example: 298 })
  @IsNumber()
  @Min(0)
  @Max(1000)
  acs!: number;

  @ApiPropertyOptional({ example: 211.4 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  adr?: number;

  @ApiPropertyOptional({ example: 26 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  headshotPercentage?: number;

  @ApiPropertyOptional({ example: 95 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  kastPercentage?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  @Max(30)
  firstKills!: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  @Max(30)
  firstDeaths!: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  @Max(30)
  multiKills!: number;
}

export class ImportValorantLocalMatchDto {
  @ApiProperty({ example: '9f1b7f87-valorant-match-id' })
  @IsString()
  @Length(6, 120)
  externalId!: string;

  @ApiProperty({ example: 'Ascent' })
  @IsString()
  @Length(2, 60)
  map!: string;

  @ApiProperty({ example: 'Jett' })
  @IsString()
  @Length(2, 60)
  agent!: string;

  @ApiProperty({ enum: MatchResult, example: MatchResult.WIN })
  @IsEnum(MatchResult)
  result!: MatchResult;

  @ApiProperty({ example: '13-9' })
  @IsString()
  @Length(2, 20)
  score!: string;

  @ApiProperty({ example: '2026-05-01T02:30:00.000Z' })
  @Type(() => Date)
  @IsDate()
  matchDate!: Date;

  @ApiPropertyOptional({ example: 18 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  kills?: number;

  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  deaths?: number;

  @ApiPropertyOptional({ example: 6 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(80)
  assists?: number;

  @ApiPropertyOptional({ example: 240 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(700)
  combatScore?: number;

  @ApiPropertyOptional({ example: 'competitive' })
  @IsOptional()
  @IsString()
  @Length(1, 60)
  queueId?: string;

  @ApiPropertyOptional({ example: 2020 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10000)
  durationSeconds?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  snapshot?: Record<string, unknown>;

  @ApiPropertyOptional({ type: () => [ImportValorantLocalScoreboardPlayerDto] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ImportValorantLocalScoreboardPlayerDto)
  scoreboardPlayers?: ImportValorantLocalScoreboardPlayerDto[];
}

export class ImportValorantLocalDto {
  @ApiProperty({ type: [ImportValorantLocalMatchDto] })
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => ImportValorantLocalMatchDto)
  matches!: ImportValorantLocalMatchDto[];
}
