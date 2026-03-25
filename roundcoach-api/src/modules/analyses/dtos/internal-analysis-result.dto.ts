import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnalysisProcessingStatus } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class InternalAnalysisResultDto {
  @ApiProperty({ example: 'cm9vod123456' })
  @IsString()
  vodId!: string;

  @ApiProperty({ example: 'cm9match123456' })
  @IsString()
  matchId!: string;

  @ApiProperty({
    enum: [AnalysisProcessingStatus.COMPLETED, AnalysisProcessingStatus.FAILED],
    example: AnalysisProcessingStatus.COMPLETED,
  })
  @IsIn([
    AnalysisProcessingStatus.COMPLETED,
    AnalysisProcessingStatus.FAILED,
  ])
  processingStatus!: 'COMPLETED' | 'FAILED';

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  deathsFirst?: number;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  entryKills?: number;

  @ApiPropertyOptional({ example: 72.4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  crosshairScore?: number;

  @ApiPropertyOptional({ example: 68.9 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  utilityUsageScore?: number;

  @ApiPropertyOptional({ example: 74.2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  positioningScore?: number;

  @ApiPropertyOptional({ example: 'Boa disciplina de mira, mas exposicao excessiva em entradas.' })
  @IsOptional()
  @IsString()
  summary?: string;
}
