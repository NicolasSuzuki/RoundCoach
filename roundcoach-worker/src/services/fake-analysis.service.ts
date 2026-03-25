import { ProcessVodJob } from '../types/process-vod-job.type';
import { buildSummaryFromMetrics } from './analysis-insights';
import { simulateFakeAnalysis } from './fake-analysis-simulator';

export interface FakeAnalysisResult {
  vodId: string;
  matchId: string;
  processingStatus: 'COMPLETED';
  deathsFirst: number;
  entryKills: number;
  crosshairScore: number;
  utilityUsageScore: number;
  positioningScore: number;
  summary: string;
}

export class FakeAnalysisService {
  build(job: ProcessVodJob): FakeAnalysisResult {
    const simulated = simulateFakeAnalysis(job);
    const deathsFirst = simulated.deathsFirst;
    const entryKills = simulated.entryKills;
    const crosshairScore = simulated.crosshairScore;
    const utilityUsageScore = simulated.utilityUsageScore;
    const positioningScore = simulated.positioningScore;

    return {
      vodId: job.vodId,
      matchId: job.matchId,
      processingStatus: 'COMPLETED',
      deathsFirst,
      entryKills,
      crosshairScore,
      utilityUsageScore,
      positioningScore,
      summary: buildSummaryFromMetrics({
        deathsFirst,
        entryKills,
        crosshairScore,
        utilityUsageScore,
        positioningScore,
      }),
    };
  }
}
