import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUrl, Length, Min } from 'class-validator';

export class CreateVodDto {
  @ApiPropertyOptional({ example: 'cm9eptg7d0000fs3gt4u12345' })
  @IsOptional()
  @IsString()
  matchId?: string;

  @ApiProperty({ example: 'ranked-ascent-01.mp4' })
  @IsString()
  @Length(3, 255)
  fileName!: string;

  @ApiProperty({ example: 'https://storage.example.com/vods/ranked-ascent-01.mp4' })
  @IsUrl({
    require_tld: false,
    require_protocol: true,
  })
  fileUrl!: string;

  @ApiPropertyOptional({ example: 2380 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationSeconds?: number;
}
