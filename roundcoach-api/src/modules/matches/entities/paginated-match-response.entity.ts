import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaEntity } from '../../../common/entities/pagination-meta.entity';
import { MatchEntity } from './match.entity';

export class PaginatedMatchResponseEntity {
  @ApiProperty({ type: MatchEntity, isArray: true })
  data!: MatchEntity[];

  @ApiProperty({ type: PaginationMetaEntity })
  meta!: PaginationMetaEntity;

  constructor(data: {
    data: ConstructorParameters<typeof MatchEntity>[0][];
    meta: ConstructorParameters<typeof PaginationMetaEntity>[0];
  }) {
    this.data = data.data.map((item) => new MatchEntity(item));
    this.meta = new PaginationMetaEntity(data.meta);
  }
}
