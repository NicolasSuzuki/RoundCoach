import { ApiPropertyOptional } from '@nestjs/swagger';
import { VodStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dtos/pagination-query.dto';

export class ListVodsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: VodStatus, example: VodStatus.UPLOADED })
  @IsOptional()
  @IsEnum(VodStatus)
  status?: VodStatus;

  @ApiPropertyOptional({ example: 'cm9eptg7d0000fs3gt4u12345' })
  @IsOptional()
  @IsString()
  matchId?: string;
}
