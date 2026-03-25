import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';
import type { ApiEnvelope } from '../types/common';
import { api } from './api';

export const authService = {
  async login(payload: LoginPayload) {
    const response = await api.post<ApiEnvelope<AuthResponse>>('/auth/login', payload);
    return response.data.data;
  },
  async register(payload: RegisterPayload) {
    const response = await api.post<ApiEnvelope<AuthResponse>>(
      '/auth/register',
      payload,
    );
    return response.data.data;
  },
  async me() {
    const response = await api.get<ApiEnvelope<User>>('/auth/me');
    return response.data.data;
  },
};
