import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaEntity } from '../../../common/entities/pagination-meta.entity';
import { VodEntity } from './vod.entity';

export class PaginatedVodResponseEntity {
  @ApiProperty({ type: VodEntity, isArray: true })
  data!: VodEntity[];

  @ApiProperty({ type: PaginationMetaEntity })
  meta!: PaginationMetaEntity;

  constructor(data: {
    data: ConstructorParameters<typeof VodEntity>[0][];
    meta: ConstructorParameters<typeof PaginationMetaEntity>[0];
  }) {
    this.data = data.data.map((item) => new VodEntity(item));
    this.meta = new PaginationMetaEntity(data.meta);
  }
}
