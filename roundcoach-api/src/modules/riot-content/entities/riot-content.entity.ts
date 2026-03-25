import { ApiProperty } from '@nestjs/swagger';

export class RiotContentItemEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  constructor(data: { id: string; name: string }) {
    this.id = data.id;
    this.name = data.name;
  }
}

export class RiotContentEntity {
  @ApiProperty()
  source!: 'riot' | 'fallback';

  @ApiProperty()
  locale!: string;

  @ApiProperty({ type: RiotContentItemEntity, isArray: true })
  maps!: RiotContentItemEntity[];

  @ApiProperty({ type: RiotContentItemEntity, isArray: true })
  agents!: RiotContentItemEntity[];

  @ApiProperty()
  updatedAt!: string;

  constructor(data: {
    source: 'riot' | 'fallback';
    locale: string;
    maps: Array<{ id: string; name: string }>;
    agents: Array<{ id: string; name: string }>;
    updatedAt: string;
  }) {
    this.source = data.source;
    this.locale = data.locale;
    this.maps = data.maps.map((item) => new RiotContentItemEntity(item));
    this.agents = data.agents.map((item) => new RiotContentItemEntity(item));
    this.updatedAt = data.updatedAt;
  }
}
