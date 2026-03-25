import { Job } from 'bullmq';
import { env } from '../config/env';
import { ProcessVodJob } from '../types/process-vod-job.type';
import { ApiClientService } from '../services/api-client.service';
import { FakeAnalysisService } from '../services/fake-analysis.service';

const apiClientService = new ApiClientService();
const fakeAnalysisService = new FakeAnalysisService();

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function processVodJob(job: Job<ProcessVodJob>): Promise<void> {
  await wait(env.processingDelayMs);

  const result = fakeAnalysisService.build(job.data);
  await apiClientService.sendAnalysisResult(result);
}
