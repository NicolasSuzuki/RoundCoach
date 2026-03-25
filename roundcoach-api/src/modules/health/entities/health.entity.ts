import { ApiProperty } from '@nestjs/swagger';

export class HealthEntity {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ example: '2026-03-20T18:00:00.000Z' })
  timestamp!: string;
}
