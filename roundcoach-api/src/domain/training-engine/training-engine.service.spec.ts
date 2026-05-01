import { AnalysisProcessingStatus, TrainingPlanStatus } from '@prisma/client';
import { TrainingDiagnosisService } from './training-diagnosis.service';
import { TrainingEngineService } from './training-engine.service';
import { TrainingRecommendationService } from './training-recommendation.service';

describe('TrainingEngineService', () => {
  let service: TrainingEngineService;

  const transaction = {
    trainingPlan: {
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      create: jest.fn(),
    },
  };

  const prisma = {
    user: {
      findUnique: jest.fn(),
    },
    analysis: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    trainingPlan: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TrainingEngineService(
      prisma,
      new TrainingDiagnosisService(),
      new TrainingRecommendationService(),
    );
    prisma.$transaction = jest.fn(async (callback: any) => callback(transaction));
  });

  it('should supersede the previous active plan when generating a new one', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue(buildUser());
    prisma.analysis.findMany = jest.fn().mockResolvedValue(buildAnalyses());
    transaction.trainingPlan.findFirst
      .mockResolvedValueOnce({ id: 'plan-active', version: 2 })
      .mockResolvedValueOnce({ id: 'plan-active', version: 2 });
    transaction.trainingPlan.updateMany.mockResolvedValue({ count: 1 });
    transaction.trainingPlan.create.mockResolvedValue(
      buildTrainingPlanRecord({
        id: 'plan-3',
        version: 3,
      }),
    );

    const plan = await service.generatePlan('user-1');

    expect(transaction.trainingPlan.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: TrainingPlanStatus.ACTIVE },
      data: { status: TrainingPlanStatus.SUPERSEDED },
    });
    expect(plan.status).toBe(TrainingPlanStatus.ACTIVE);
    expect(plan.version).toBe(3);
  });

  it('should return the active plan from current', async () => {
    prisma.trainingPlan.findFirst = jest.fn().mockResolvedValue(
      buildTrainingPlanRecord({
        id: 'plan-current',
      }),
    );
    prisma.analysis.count = jest.fn().mockResolvedValue(4);

    const plan = await service.getCurrentPlan('user-1');

    expect(plan.id).toBe('plan-current');
    expect(plan.status).toBe(TrainingPlanStatus.ACTIVE);
  });
});

function buildUser() {
  return {
    id: 'user-1',
    currentRank: 'Diamond 1',
    targetRank: 'Ascendant 1',
    currentGoal: 'Subir com consistencia',
    mainAgents: ['Jett'],
    mainRole: 'Duelist',
    currentFocus: null,
  };
}

function buildAnalyses() {
  return [
    buildAnalysis('2026-03-20T20:00:00.000Z', 58, 63, 65, 3, 4),
    buildAnalysis('2026-03-21T20:00:00.000Z', 55, 61, 67, 4, 3),
    buildAnalysis('2026-03-22T20:00:00.000Z', 60, 66, 70, 2, 5),
  ];
}

function buildAnalysis(
  matchDate: string,
  positioningScore: number,
  utilityUsageScore: number,
  avgCrosshairScore: number,
  deathsFirst: number,
  entryKills: number,
) {
  return {
    id: `analysis-${matchDate}`,
    matchId: `match-${matchDate}`,
    processingStatus: AnalysisProcessingStatus.COMPLETED,
    deathsFirst,
    entryKills,
    avgCrosshairScore,
    utilityUsageScore,
    positioningScore,
    match: {
      id: `match-${matchDate}`,
      matchDate: new Date(matchDate),
    },
  };
}

function buildTrainingPlanRecord(
  overrides?: Partial<{
    id: string;
    version: number;
  }>,
) {
  return {
    id: overrides?.id ?? 'plan-1',
    userId: 'user-1',
    status: TrainingPlanStatus.ACTIVE,
    generatedFromRange: 'last_5_completed_matches',
    mainWeakness: 'positioning',
    mainStrength: 'crosshair',
    focusArea: 'positioning',
    priority: 'improve_positioning',
    trend: 'stable',
    intensity: 'medium',
    dailyPlanJson: {
      warmup: ['item 1'],
      inGame: ['item 2'],
      review: ['item 3'],
    },
    weeklyPlanJson: {
      title: 'Semana de posicionamento',
      goals: ['goal 1'],
    },
    microGoal: 'Troque de angulo depois do contato.',
    justification: 'Justificativa',
    version: overrides?.version ?? 1,
    createdAt: new Date('2026-03-25T00:00:00.000Z'),
    updatedAt: new Date('2026-03-25T00:00:00.000Z'),
  };
}
