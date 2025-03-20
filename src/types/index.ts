
export interface AssetData {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
  explorer: string;
}

export type AssetCategory = 'all' | 'gainers' | 'losers' | 'trending';

export interface SortOption {
  id: string;
  label: string;
  sortFn: (a: AssetData, b: AssetData) => number;
}

export interface TimeFrameOption {
  value: TimeFrame;
  label: string;
}

export type TimeFrame = 'h1' | 'h12' | 'd1' | 'w1' | 'm1';

export interface AssetHistoryData {
  priceUsd: string;
  time: number;
  date: string;
}

// Add missing types needed by API.ts
export interface AssetsResponse {
  data: AssetData[];
  timestamp: number;
}

export interface AssetResponse {
  data: AssetData;
  timestamp: number;
}

export interface AssetHistoryResponse {
  data: AssetHistoryData[];
  timestamp: number;
}

// Define MarketSentiment type
export type MarketSentiment = 'extreme_fear' | 'fear' | 'neutral' | 'positive' | 'greed' | 'extreme_greed';

// Define InsightReactions interface
export interface InsightReactions {
  [insightId: string]: {
    fire: number;
    rocket: number;
    diamond: number;
    nervous: number;
  };
}

// Define UserReactions interface
export interface UserReactions {
  [insightId: string]: {
    fire?: boolean;
    rocket?: boolean;
    diamond?: boolean;
    nervous?: boolean;
  };
}
