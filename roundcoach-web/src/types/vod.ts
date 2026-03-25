import { PaginatedResponse } from './common';

export type VodStatus = 'UPLOADED' | 'PROCESSING' | 'PROCESSED' | 'FAILED';

export interface Vod {
  id: string;
  userId: string;
  matchId?: string | null;
  fileName: string;
  fileUrl: string;
  durationSeconds?: number | null;
  status: VodStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVodPayload {
  matchId: string;
  fileName: string;
  fileUrl: string;
  durationSeconds?: number;
}

export type VodsResponse = PaginatedResponse<Vod>;
