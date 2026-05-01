import { ApiProperty } from '@nestjs/swagger';
import { TrainingPlanStatus } from '@prisma/client';

class DailyTrainingPlanEntity {
  @ApiProperty({ type: String, isArray: true })
  warmup!: string[];

  @ApiProperty({ type: String, isArray: true })
  inGame!: string[];

  @ApiProperty({ type: String, isArray: true })
  review!: string[];
}

class WeeklyFocusPlanEntity {
  @ApiProperty()
  title!: string;

  @ApiProperty({ type: String, isArray: true })
  goals!: string[];
}

export class TrainingPlanEntity {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ enum: TrainingPlanStatus })
  status!: TrainingPlanStatus;

  @ApiProperty({ required: false, nullable: true })
  generatedFromRange!: string | null;

  @ApiProperty()
  mainWeakness!: string;

  @ApiProperty()
  mainStrength!: string;

  @ApiProperty()
  focusArea!: string;

  @ApiProperty()
  priority!: string;

  @ApiProperty()
  trend!: string;

  @ApiProperty()
  intensity!: string;

  @ApiProperty({ type: DailyTrainingPlanEntity })
  dailyTrainingPlan!: DailyTrainingPlanEntity;

  @ApiProperty({ type: WeeklyFocusPlanEntity })
  weeklyFocusPlan!: WeeklyFocusPlanEntity;

  @ApiProperty()
  microGoal!: string;

  @ApiProperty()
  justification!: string;

  @ApiProperty()
  version!: number;

  @ApiProperty()
  sampleSize!: number;

  @ApiProperty()
  isOnboarding!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(data: TrainingPlanEntity) {
    Object.assign(this, data);
  }
}
