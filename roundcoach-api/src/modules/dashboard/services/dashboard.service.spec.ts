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
});
