import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  const createPrismaMock = () => ({
    user: {
      findUnique: jest.fn(),
    },
    match: {
      count: jest.fn(),
    },
    analysis: {
      findMany: jest.fn(),
    },
    dashboardSummarySnapshot: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    trainingPlanCoachSnapshot: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
  });

  const profile = {
    currentRank: 'Gold 3',
    currentGoal: 'Subir para Platinum',
    mainAgents: ['Sova'],
    mainRole: 'initiator',
    currentFocus: 'Abrir melhor os rounds',
    updatedAt: new Date('2026-05-01T12:00:00.000Z'),
  };

  const completedAnalysis = {
    id: 'analysis-1',
    updatedAt: new Date('2026-05-01T12:10:00.000Z'),
    deathsFirst: 2,
    entryKills: 3,
    avgCrosshairScore: 76,
    utilityUsageScore: 70,
    positioningScore: 68,
    match: {
      id: 'match-1',
      updatedAt: new Date('2026-05-01T12:10:00.000Z'),
      matchDate: new Date('2026-05-01T11:50:00.000Z'),
      importedSnapshot: {
        queueId: 'competitive',
        updatedAt: new Date('2026-05-01T12:10:00.000Z'),
      },
      scoreboardPlayers: [
        {
          id: 'player-1',
          updatedAt: new Date('2026-05-01T12:10:00.000Z'),
          kills: 18,
          deaths: 14,
          assists: 7,
          acs: 235,
          adr: 151,
          firstKills: 2,
          firstDeaths: 1,
        },
      ],
    },
  };

  const trainingPlan = {
    id: 'plan-1',
    userId: 'user-1',
    status: 'ACTIVE',
    version: 2,
    mainWeakness: 'entry',
    mainStrength: 'crosshair',
    focusArea: 'entry',
    priority: 'stabilize',
    trend: 'stable',
    intensity: 'medium',
    dailyTrainingPlan: {
      warmup: ['base warmup 1', 'base warmup 2'],
      inGame: ['base in game 1', 'base in game 2', 'base in game 3'],
      review: ['base review 1', 'base review 2'],
    },
    weeklyFocusPlan: {
      title: 'Base semanal',
      goals: ['base goal 1', 'base goal 2', 'base goal 3'],
    },
    microGoal: 'Base micro goal',
    justification: 'Base justification',
    generatedFromRange: 'last_5',
    sampleSize: 5,
    isOnboarding: false,
    createdAt: new Date('2026-05-01T12:00:00.000Z'),
    updatedAt: new Date('2026-05-01T12:30:00.000Z'),
  };

  it('returns cached summary when the signature matches', async () => {
    const prisma = createPrismaMock();
    const cachedPayload = {
      totalAnalysedMatches: 1,
      averageScore: 74,
      lastScore: 74,
      bestScore: 74,
      lastFiveAverageScore: 74,
      trend: 'stable' as const,
      processedMatchRate: 100,
      mainWeakness: 'entry',
      mainStrength: 'crosshair',
      focusSuggestion: 'convert_opening_duels',
      weeklyWeakness: 'entry',
      recurringStrength: 'crosshair',
      profileCurrentRank: 'Gold 3',
      profileCurrentGoal: 'Subir para Platinum',
      profileMainAgents: ['Sova'],
      profileMainRole: 'initiator',
      profileCurrentFocus: 'Abrir melhor os rounds',
      coachWritingSource: 'ai' as const,
      observation: 'Texto salvo anteriormente.',
      recommendedTraining: ['item 1', 'item 2', 'item 3'],
    };

    prisma.user.findUnique.mockResolvedValue(profile);
    prisma.match.count.mockResolvedValue(1);
    prisma.analysis.findMany.mockResolvedValue([completedAnalysis]);

    const coachWriterService = {
      write: jest.fn(),
    };
    const playerDiagnosisEngineService = {
      diagnose: jest.fn().mockReturnValue({
        sampleSize: 1,
        averageScore: 74,
        lastScore: 74,
        bestScore: 74,
        lastFiveAverageScore: 74,
        trend: 'stable',
        mainWeakness: 'entry',
        mainStrength: 'crosshair',
        focusSuggestion: 'convert_opening_duels',
        weeklyWeakness: 'entry',
        recurringStrength: 'crosshair',
        observation: 'obs',
        recommendedTraining: ['base 1', 'base 2', 'base 3'],
      }),
    };
    const trainingEngineService = {
      getCurrentPlan: jest.fn(),
    };

    const service = new DashboardService(
      prisma as never,
      coachWriterService as never,
      playerDiagnosisEngineService as never,
      trainingEngineService as never,
    );

    const signature = (service as any).buildSummarySignature({
      analyses: [completedAnalysis],
      profile,
      totalMatches: 1,
    });

    prisma.dashboardSummarySnapshot.findUnique.mockResolvedValue({
      userId: 'user-1',
      signature,
      payload: cachedPayload,
    });

    const result = await service.getSummary('user-1');

    expect(result).toEqual(cachedPayload);
    expect(coachWriterService.write).not.toHaveBeenCalled();
    expect(prisma.dashboardSummarySnapshot.upsert).not.toHaveBeenCalled();
  });

  it('generates and persists a new snapshot when there is no valid cache', async () => {
    const prisma = createPrismaMock();

    prisma.user.findUnique.mockResolvedValue(profile);
    prisma.match.count.mockResolvedValue(1);
    prisma.analysis.findMany.mockResolvedValue([completedAnalysis]);
    prisma.dashboardSummarySnapshot.findUnique.mockResolvedValue(null);

    const coachWriterService = {
      write: jest.fn().mockResolvedValue({
        observation: 'Texto novo do coach.',
        recommendedTraining: ['A', 'B', 'C'],
        source: 'ai',
      }),
    };
    const playerDiagnosisEngineService = {
      diagnose: jest.fn().mockReturnValue({
        sampleSize: 1,
        averageScore: 74,
        lastScore: 74,
        bestScore: 74,
        lastFiveAverageScore: 74,
        trend: 'stable',
        mainWeakness: 'entry',
        mainStrength: 'crosshair',
        focusSuggestion: 'convert_opening_duels',
        weeklyWeakness: 'entry',
        recurringStrength: 'crosshair',
        observation: 'obs',
        recommendedTraining: ['base 1', 'base 2', 'base 3'],
      }),
    };
    const trainingEngineService = {
      getCurrentPlan: jest.fn(),
    };

    const service = new DashboardService(
      prisma as never,
      coachWriterService as never,
      playerDiagnosisEngineService as never,
      trainingEngineService as never,
    );

    const result = await service.getSummary('user-1');

    expect(result.observation).toBe('Texto novo do coach.');
    expect(result.coachWritingSource).toBe('ai');
    expect(coachWriterService.write).toHaveBeenCalledTimes(1);
    expect(prisma.dashboardSummarySnapshot.upsert).toHaveBeenCalledTimes(1);
  });

  it('returns cached training plan writing when the signature matches', async () => {
    const prisma = createPrismaMock();
    const cachedPayload = {
      focusArea: 'entry',
      dailyTrainingPlan: {
        warmup: ['cache warmup 1', 'cache warmup 2'],
        inGame: ['cache in game 1', 'cache in game 2', 'cache in game 3'],
        review: ['cache review 1', 'cache review 2'],
      },
      weeklyFocusPlan: {
        title: 'Semana cacheada',
        goals: ['cache goal 1', 'cache goal 2', 'cache goal 3'],
      },
      microGoal: 'cache micro goal',
      justification: 'cache justification',
      trend: 'stable',
      mainWeakness: 'entry',
      mainStrength: 'crosshair',
      intensity: 'medium',
      isOnboarding: false,
      coachWritingSource: 'ai' as const,
    };
    const coachWriterService = {
      write: jest.fn(),
      writeTrainingPlan: jest.fn(),
    };
    const playerDiagnosisEngineService = {
      diagnose: jest.fn(),
    };
    const trainingEngineService = {
      getCurrentPlan: jest.fn().mockResolvedValue(trainingPlan),
    };

    prisma.user.findUnique.mockResolvedValue(profile);

    const service = new DashboardService(
      prisma as never,
      coachWriterService as never,
      playerDiagnosisEngineService as never,
      trainingEngineService as never,
    );

    const signature = (service as any).buildTrainingPlanSignature({
      plan: trainingPlan,
      profile,
    });

    prisma.trainingPlanCoachSnapshot.findUnique.mockResolvedValue({
      trainingPlanId: 'plan-1',
      signature,
      payload: cachedPayload,
    });

    const result = await service.getTrainingPlan('user-1');

    expect(result).toEqual(cachedPayload);
    expect(coachWriterService.writeTrainingPlan).not.toHaveBeenCalled();
    expect(prisma.trainingPlanCoachSnapshot.upsert).not.toHaveBeenCalled();
  });

  it('generates and persists training plan writing when cache is stale', async () => {
    const prisma = createPrismaMock();
    const coachWriterService = {
      write: jest.fn(),
      writeTrainingPlan: jest.fn().mockResolvedValue({
        weeklyFocusTitle: 'Semana de execucao limpa',
        weeklyGoals: ['goal 1', 'goal 2', 'goal 3'],
        justification: 'texto de IA',
        warmup: ['warmup 1', 'warmup 2'],
        inGame: ['ingame 1', 'ingame 2', 'ingame 3'],
        review: ['review 1', 'review 2'],
        microGoal: 'micro goal ia',
        source: 'ai',
      }),
    };
    const playerDiagnosisEngineService = {
      diagnose: jest.fn(),
    };
    const trainingEngineService = {
      getCurrentPlan: jest.fn().mockResolvedValue(trainingPlan),
    };

    prisma.user.findUnique.mockResolvedValue(profile);
    prisma.trainingPlanCoachSnapshot.findUnique.mockResolvedValue(null);

    const service = new DashboardService(
      prisma as never,
      coachWriterService as never,
      playerDiagnosisEngineService as never,
      trainingEngineService as never,
    );

    const result = await service.getTrainingPlan('user-1');

    expect(result.weeklyFocusPlan.title).toBe('Semana de execucao limpa');
    expect(result.coachWritingSource).toBe('ai');
    expect(coachWriterService.writeTrainingPlan).toHaveBeenCalledTimes(1);
    expect(prisma.trainingPlanCoachSnapshot.upsert).toHaveBeenCalledTimes(1);
  });
});
