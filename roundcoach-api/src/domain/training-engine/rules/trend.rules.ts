import { TrainingTrend } from '../types/training-diagnosis.type';

export function calculateTrainingTrend(scores: number[]): TrainingTrend {
  if (scores.length < 3) {
    return 'stable';
  }

  const recentWindow = scores.slice(-Math.min(3, scores.length));
  const baselineWindow =
    scores.length >= 6
      ? scores.slice(-6, -3)
      : scores.slice(0, Math.max(1, scores.length - recentWindow.length));

  const recentAverage =
    recentWindow.reduce((total, value) => total + value, 0) / recentWindow.length;
  const baselineAverage =
    baselineWindow.reduce((total, value) => total + value, 0) / baselineWindow.length;
  const delta = recentAverage - baselineAverage;

  if (delta >= 4) {
    return 'improving';
  }

  if (delta <= -4) {
    return 'declining';
  }

  return 'stable';
}
