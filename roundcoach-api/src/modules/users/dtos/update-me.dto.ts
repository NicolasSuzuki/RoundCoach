import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, IsString, Length } from 'class-validator';

export class UpdateMeDto {
  @ApiProperty({ example: 'Player One' })
  @IsString()
  @Length(2, 80)
  name!: string;

  @ApiPropertyOptional({ example: 'Ascendant 1' })
  @IsOptional()
  @IsString()
  @Length(2, 40)
  currentRank?: string;

  @ApiPropertyOptional({ example: 'Chegar no Immortal com consistencia em ranked' })
  @IsOptional()
  @IsString()
  @Length(4, 180)
  currentGoal?: string;

  @ApiPropertyOptional({ example: ['Jett', 'Sova'], type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5)
  @IsString({ each: true })
  @Transform(({ value }) =>
    Array.isArray(value)
      ? value
          .map((item) => String(item).trim())
          .filter(Boolean)
      : [],
  )
  mainAgents?: string[];

  @ApiPropertyOptional({ example: 'Duelist' })
  @IsOptional()
  @IsString()
  @Length(2, 40)
  mainRole?: string;

  @ApiPropertyOptional({ example: 'Evitar first death e melhorar reposicionamento' })
  @IsOptional()
  @IsString()
  @Length(4, 180)
  currentFocus?: string;
}
