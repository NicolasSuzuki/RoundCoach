import { ApiProperty } from '@nestjs/swagger';

export class DashboardSummaryEntity {
  @ApiProperty()
  totalAnalysedMatches!: number;

  @ApiProperty()
  averageScore!: number;

  @ApiProperty()
  lastScore!: number;

  @ApiProperty()
  bestScore!: number;

  @ApiProperty()
  lastFiveAverageScore!: number;

  @ApiProperty()
  trend!: 'up' | 'down' | 'stable';

  @ApiProperty()
  processedMatchRate!: number;

  @ApiProperty()
  mainWeakness!: string;

  @ApiProperty()
  mainStrength!: string;

  @ApiProperty()
  focusSuggestion!: string;

  @ApiProperty()
  weeklyWeakness!: string;

  @ApiProperty()
  recurringStrength!: string;

  @ApiProperty({ required: false, nullable: true })
  profileCurrentRank?: string | null;

  @ApiProperty({ required: false, nullable: true })
  profileCurrentGoal?: string | null;

  @ApiProperty({ type: String, isArray: true })
  profileMainAgents!: string[];

  @ApiProperty({ required: false, nullable: true })
  profileMainRole?: string | null;

  @ApiProperty({ required: false, nullable: true })
  profileCurrentFocus?: string | null;

  @ApiProperty()
  observation!: string;

  @ApiProperty({ type: String, isArray: true })
  recommendedTraining!: string[];

  constructor(data: DashboardSummaryEntity) {
    Object.assign(this, data);
  }
}
