import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AnalysisProcessingStatus } from '@prisma/client';
import { buildAnalysisInsights } from '../../../domain/insight-engine/insight-engine';
import { AnalysisCoachEntity } from './analysis-coach.entity';
import { AnalysisCoachSnapshotEntity } from './analysis-coach-snapshot.entity';

export class AnalysisEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  matchId!: string;

  @ApiPropertyOptional()
  vodId?: string | null;

  @ApiProperty({ enum: AnalysisProcessingStatus })
  processingStatus!: AnalysisProcessingStatus;

  @ApiPropertyOptional()
  deathsFirst?: number | null;

  @ApiPropertyOptional()
  entryKills?: number | null;

  @ApiPropertyOptional()
  avgCrosshairScore?: number | null;

  @ApiPropertyOptional()
  utilityUsageScore?: number | null;

  @ApiPropertyOptional()
  positioningScore?: number | null;

  @ApiPropertyOptional()
  summary?: string | null;

  @ApiPropertyOptional()
  overallScore?: number | null;

  @ApiPropertyOptional({ type: AnalysisCoachEntity })
  coach?: AnalysisCoachEntity | null;

  @ApiPropertyOptional({ type: AnalysisCoachSnapshotEntity })
  coachSnapshot?: AnalysisCoachSnapshotEntity | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(data: {
    id: string;
    matchId: string;
    vodId?: string | null;
    processingStatus: AnalysisProcessingStatus;
    deathsFirst?: number | null;
    entryKills?: number | null;
    avgCrosshairScore?: number | null;
    utilityUsageScore?: number | null;
    positioningScore?: number | null;
    summary?: string | null;
    overallScore?: number | null;
    coachSnapshot?: AnalysisCoachSnapshotEntity | null;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = data.id;
    this.matchId = data.matchId;
    this.vodId = data.vodId;
    this.processingStatus = data.processingStatus;
    this.deathsFirst = data.deathsFirst;
    this.entryKills = data.entryKills;
    this.avgCrosshairScore = data.avgCrosshairScore;
    this.utilityUsageScore = data.utilityUsageScore;
    this.positioningScore = data.positioningScore;
    this.summary = data.summary;
    this.coachSnapshot = data.coachSnapshot
      ? new AnalysisCoachSnapshotEntity(data.coachSnapshot)
      : null;
    const canBuildCoach =
      data.processingStatus === AnalysisProcessingStatus.COMPLETED &&
      data.deathsFirst != null &&
      data.entryKills != null &&
      data.avgCrosshairScore != null &&
      data.utilityUsageScore != null &&
      data.positioningScore != null;

    if (canBuildCoach) {
      if (this.coachSnapshot) {
        this.overallScore = this.coachSnapshot.overallScore;
        this.coach = new AnalysisCoachEntity(this.coachSnapshot);
      } else {
        const insights = buildAnalysisInsights(data);
        this.overallScore = insights.overallScore;
        this.coach = new AnalysisCoachEntity(insights);
      }
    } else {
      this.overallScore = data.overallScore ?? null;
      this.coach = null;
    }
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
