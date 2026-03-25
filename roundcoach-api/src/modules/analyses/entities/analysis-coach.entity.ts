import { ApiProperty } from '@nestjs/swagger';
import {
  AnalysisInsights,
  AnalysisMetricKey,
} from '../../../domain/insight-engine/insight-engine';

export class AnalysisCoachEntity {
  @ApiProperty()
  overallScore!: number;

  @ApiProperty()
  scenario!: string;

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

  constructor(data: AnalysisInsights) {
    this.overallScore = data.overallScore;
    this.scenario = data.scenario;
    this.strengthKey = data.strengthKey;
    this.strengthLabel = data.strengthLabel;
    this.strengthText = data.strengthText;
    this.weaknessKey = data.weaknessKey;
    this.weaknessLabel = data.weaknessLabel;
    this.weaknessText = data.weaknessText;
    this.focusSuggestion = data.focusSuggestion;
    this.microGoal = data.microGoal;
    this.recommendedTraining = data.recommendedTraining;
  }
}
