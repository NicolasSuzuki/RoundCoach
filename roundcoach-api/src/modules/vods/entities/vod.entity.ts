import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VodStatus } from '@prisma/client';

export class VodEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiPropertyOptional()
  matchId?: string | null;

  @ApiProperty()
  fileName!: string;

  @ApiProperty()
  fileUrl!: string;

  @ApiPropertyOptional()
  durationSeconds?: number | null;

  @ApiProperty({ enum: VodStatus })
  status!: VodStatus;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(data: {
    id: string;
    userId: string;
    matchId?: string | null;
    fileName: string;
    fileUrl: string;
    durationSeconds?: number | null;
    status: VodStatus;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.matchId = data.matchId;
    this.fileName = data.fileName;
    this.fileUrl = data.fileUrl;
    this.durationSeconds = data.durationSeconds;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
