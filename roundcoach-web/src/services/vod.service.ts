import type { VodProcessResponse } from '../types/analysis';
import type { ApiEnvelope } from '../types/common';
import type { CreateVodPayload, Vod, VodsResponse } from '../types/vod';
import { api } from './api';

export const vodService = {
  async listByMatch(matchId: string) {
    const response = await api.get<VodsResponse>(
      `/vods?page=1&limit=20&matchId=${matchId}`,
    );
    return response.data;
  },
  async create(payload: CreateVodPayload) {
    const response = await api.post<ApiEnvelope<Vod>>('/vods', payload);
    return response.data.data;
  },
  async update(vodId: string, payload: Partial<CreateVodPayload>) {
    const response = await api.patch<ApiEnvelope<Vod>>(`/vods/${vodId}`, payload);
    return response.data.data;
  },
  async process(vodId: string) {
    const response = await api.post<ApiEnvelope<VodProcessResponse>>(
      `/vods/${vodId}/process`,
    );
    return response.data.data;
  },
};
