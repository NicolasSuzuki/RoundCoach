import { ApiPropertyOptional } from '@nestjs/swagger';
import { MatchResult } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString, Length } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dtos/pagination-query.dto';

export class ListMatchesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'Ascent' })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  map?: string;

  @ApiPropertyOptional({ example: 'Jett' })
  @IsOptional()
  @IsString()
  @Length(2, 60)
  agent?: string;

  @ApiPropertyOptional({ enum: MatchResult, example: MatchResult.WIN })
  @IsOptional()
  @IsEnum(MatchResult)
  result?: MatchResult;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00.000Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fromDate?: Date;

  @ApiPropertyOptional({ example: '2026-03-31T23:59:59.999Z' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  toDate?: Date;
}
