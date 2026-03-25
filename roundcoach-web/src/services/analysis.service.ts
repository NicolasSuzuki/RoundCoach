import type { Analysis } from '../types/analysis';
import type { ApiEnvelope } from '../types/common';
import { api } from './api';

export const analysisService = {
  async getByMatchId(matchId: string) {
    const response = await api.get<ApiEnvelope<Analysis>>(
      `/matches/${matchId}/analysis`,
    );
    return response.data.data;
  },
};
