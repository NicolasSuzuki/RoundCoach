import { ApiProperty } from '@nestjs/swagger';
import { AnalysisMetricKey, AnalysisInsights } from '../../../domain/insight-engine/insight-engine';

export class AnalysisCoachSnapshotEntity {
  @ApiProperty()
  overallScore!: number;

  @ApiProperty()
  scenario!: AnalysisInsights['scenario'];

  @ApiProperty()
  strengthKey!: AnalysisMetricKey;

  @ApiProperty()
  strengthLabel!: string;

  @ApiProperty()
  strengthText!: string;

  @ApiProperty()
  weaknessKey!: AnalysisMetricKey;

  @ApiProperty()
  weaknessLabel!: string;

  @ApiProperty()
  weaknessText!: string;

  @ApiProperty()
  focusSuggestion!: string;

  @ApiProperty()
  microGoal!: string;

  @ApiProperty({ type: String, isArray: true })
  recommendedTraining!: string[];

  @ApiProperty()
  summary!: string;

  constructor(data: AnalysisCoachSnapshotEntity) {
    Object.assign(this, data);
  }
}
