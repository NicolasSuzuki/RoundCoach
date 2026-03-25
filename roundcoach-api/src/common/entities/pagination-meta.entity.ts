import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaEntity {
  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  totalPages!: number;

  constructor(data: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }) {
    this.page = data.page;
    this.limit = data.limit;
    this.total = data.total;
    this.totalPages = data.totalPages;
  }
}
