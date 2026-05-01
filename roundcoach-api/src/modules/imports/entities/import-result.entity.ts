import { ApiProperty } from '@nestjs/swagger';

export class ImportResultEntity {
  @ApiProperty()
  created!: number;

  @ApiProperty()
  updated!: number;

  @ApiProperty()
  skipped!: number;

  @ApiProperty({ type: [String] })
  matchIds!: string[];

  constructor(data: ImportResultEntity) {
    this.created = data.created;
    this.updated = data.updated;
    this.skipped = data.skipped;
    this.matchIds = data.matchIds;
  }
}
