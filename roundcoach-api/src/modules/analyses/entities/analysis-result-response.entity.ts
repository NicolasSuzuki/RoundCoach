import { ApiProperty } from '@nestjs/swagger';
import { AnalysisEntity } from './analysis.entity';
import { VodEntity } from '../../vods/entities/vod.entity';

export class AnalysisResultResponseEntity {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: AnalysisEntity })
  analysis!: AnalysisEntity;

  @ApiProperty({ type: VodEntity })
  vod!: VodEntity;

  constructor(data: {
    message: string;
    analysis: ConstructorParameters<typeof AnalysisEntity>[0];
    vod: ConstructorParameters<typeof VodEntity>[0];
  }) {
    this.message = data.message;
    this.analysis = new AnalysisEntity(data.analysis);
    this.vod = new VodEntity(data.vod);
  }
}
