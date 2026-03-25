import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MatchResult } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateMatchDto {
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

  @ApiProperty({ example: '2026-03-20T20:30:00.000Z' })
  @Type(() => Date)
  @IsDate()
  matchDate!: Date;

  @ApiPropertyOptional({ example: 'Errei timings de rotação em rounds decisivos.' })
  @IsOptional()
  @IsString()
  @Length(1, 1000)
  notes?: string;
}
