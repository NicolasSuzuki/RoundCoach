import type { ApiEnvelope } from '../types/common';
import type { User } from '../types/auth';
import { api } from './api';

export interface UpdateProfilePayload {
  name: string;
  currentRank?: string;
  currentGoal?: string;
  mainAgents?: string[];
  mainRole?: string;
  currentFocus?: string;
}

export const usersService = {
  async updateMe(payload: UpdateProfilePayload) {
    const response = await api.patch<ApiEnvelope<User>>('/users/me', payload);
    return response.data.data;
  },
};
