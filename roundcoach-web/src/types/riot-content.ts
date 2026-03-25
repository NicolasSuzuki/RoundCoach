export interface RiotContentItem {
  id: string;
  name: string;
}

export interface RiotContent {
  source: 'riot' | 'fallback';
  locale: string;
  maps: RiotContentItem[];
  agents: RiotContentItem[];
  updatedAt: string;
}
