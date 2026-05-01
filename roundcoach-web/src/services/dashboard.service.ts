import type {
  DashboardEvolutionPoint,
  DashboardSummary,
  DashboardTrainingPlan,
} from '../types/dashboard';
import type { ApiEnvelope } from '../types/common';
import { api } from './api';
export const dashboardService = {
  async getSummary() {
    const response = await api.get<ApiEnvelope<DashboardSummary>>(
      '/dashboard/summary',
    );
    return response.data.data;
  },
  async getEvolution() {
    const response = await api.get<ApiEnvelope<DashboardEvolutionPoint[]>>(
      '/dashboard/evolution',
    );
    return response.data.data;
  },
  async getTrainingPlan() {
    const response = await api.get<ApiEnvelope<DashboardTrainingPlan>>(
      '/dashboard/training-plan',
    );
    return response.data.data;
  },
};
