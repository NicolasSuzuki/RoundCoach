import { ApiProperty } from '@nestjs/swagger';

class DashboardDailyTrainingPlanEntity {
  @ApiProperty({ type: String, isArray: true })
  warmup!: string[];

  @ApiProperty({ type: String, isArray: true })
  inGame!: string[];

  @ApiProperty({ type: String, isArray: true })
  review!: string[];
}

class DashboardWeeklyFocusPlanEntity {
  @ApiProperty()
  title!: string;

  @ApiProperty({ type: String, isArray: true })
  goals!: string[];
}

export class DashboardTrainingPlanEntity {
  @ApiProperty()
  focusArea!: string;

  @ApiProperty({ type: DashboardDailyTrainingPlanEntity })
  dailyTrainingPlan!: DashboardDailyTrainingPlanEntity;

  @ApiProperty({ type: DashboardWeeklyFocusPlanEntity })
  weeklyFocusPlan!: DashboardWeeklyFocusPlanEntity;

  @ApiProperty()
  microGoal!: string;

  @ApiProperty()
  justification!: string;

  @ApiProperty()
  trend!: string;

  @ApiProperty()
  mainWeakness!: string;

  @ApiProperty()
  mainStrength!: string;

  @ApiProperty()
  intensity!: string;

  @ApiProperty()
  isOnboarding!: boolean;

  @ApiProperty({ enum: ['ai', 'deterministic'] })
  coachWritingSource!: 'ai' | 'deterministic';

  constructor(data: DashboardTrainingPlanEntity) {
    Object.assign(this, data);
  }
}
