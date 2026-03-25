import axios, { AxiosInstance } from 'axios';
import { env } from '../config/env';
import { FakeAnalysisResult } from './fake-analysis.service';

export class ApiClientService {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.apiBaseUrl,
      timeout: 10000,
      headers: {
        'x-internal-token': env.internalApiToken,
      },
    });
  }

  async sendAnalysisResult(payload: FakeAnalysisResult): Promise<void> {
    await this.client.post('/internal/analysis-result', payload);
  }
}
