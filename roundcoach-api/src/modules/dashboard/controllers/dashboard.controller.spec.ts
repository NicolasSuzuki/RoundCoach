import { DashboardController } from './dashboard.controller';
import { DashboardService } from '../services/dashboard.service';

describe('DashboardController', () => {
  it('should return the training plan payload wrapped in data', async () => {
    const service = {
      getTrainingPlan: jest.fn().mockResolvedValue({
        focusArea: 'positioning',
        dailyTrainingPlan: {
          warmup: ['pre-aim'],
          inGame: ['reposicionar'],
          review: ['revisar rounds expostos'],
        },
        weeklyFocusPlan: {
          title: 'Semana de posicionamento',
          goals: ['goal 1'],
        },
        microGoal: 'Nao repetir peek sem vantagem.',
        justification: 'Base recente indica exposicao alta.',
        trend: 'stable',
        mainWeakness: 'positioning',
        mainStrength: 'crosshair',
        intensity: 'medium',
        isOnboarding: false,
      }),
    } as unknown as DashboardService;
    const controller = new DashboardController(service);

    const response = await controller.getTrainingPlan({
      id: 'user-1',
      email: 'player@example.com',
    });

    expect(response.data.focusArea).toBe('positioning');
    expect(response.data.dailyTrainingPlan.warmup).toContain('pre-aim');
    expect(response.data.mainWeakness).toBe('positioning');
  });
});
