import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Min } from 'class-validator';

export class UploadVodDto {
  @ApiPropertyOptional({ example: 'cm9eptg7d0000fs3gt4u12345' })
  @IsOptional()
  @IsString()
  matchId?: string;

  @ApiPropertyOptional({ example: 'ranked-ascent-01.mp4' })
  @IsOptional()
  @IsString()
  @Length(3, 255)
  fileName?: string;

  @ApiPropertyOptional({ example: 2380 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationSeconds?: number;
}
