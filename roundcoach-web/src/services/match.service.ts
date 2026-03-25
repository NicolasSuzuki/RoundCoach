import type { ApiEnvelope } from '../types/common';
import type { CreateMatchPayload, Match, MatchesResponse } from '../types/match';
import { api } from './api';

export const matchService = {
  async list() {
    const response = await api.get<MatchesResponse>('/matches?page=1&limit=50');
    return response.data;
  },
  async getById(matchId: string) {
    const response = await api.get<ApiEnvelope<Match>>(`/matches/${matchId}`);
    return response.data.data;
  },
  async create(payload: CreateMatchPayload) {
    const response = await api.post<ApiEnvelope<Match>>('/matches', payload);
    return response.data.data;
  },
};
