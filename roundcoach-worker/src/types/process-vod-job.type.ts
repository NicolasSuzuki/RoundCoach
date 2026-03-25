export interface ProcessVodJob {
  vodId: string;
  matchId: string;
  userId: string;
  map: string;
  agent: string;
  result: 'WIN' | 'LOSS';
  score: string;
}
