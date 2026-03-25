import type { ApiEnvelope } from '../types/common';
import type { RiotContent } from '../types/riot-content';
import { api } from './api';

export const riotContentService = {
  async getContent(locale = 'pt-BR') {
    const response = await api.get<ApiEnvelope<RiotContent>>(
      `/riot-content?locale=${encodeURIComponent(locale)}`,
    );
    return response.data.data;
  },
};
