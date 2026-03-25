import { ApiProperty } from '@nestjs/swagger';
import { AnalysisEntity } from '../../analyses/entities/analysis.entity';
import { VodEntity } from './vod.entity';

export class VodProcessResponseEntity {
  @ApiProperty()
  message!: string;

  @ApiProperty({ type: VodEntity })
  vod!: VodEntity;

  @ApiProperty({ type: AnalysisEntity })
  analysis!: AnalysisEntity;

  constructor(data: {
    message: string;
    vod: ConstructorParameters<typeof VodEntity>[0];
    analysis: ConstructorParameters<typeof AnalysisEntity>[0];
  }) {
    this.message = data.message;
    this.vod = new VodEntity(data.vod);
    this.analysis = new AnalysisEntity(data.analysis);
  }
}
