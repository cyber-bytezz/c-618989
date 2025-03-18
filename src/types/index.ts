
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

export interface AssetsResponse {
  data: AssetData[];
  timestamp: number;
}

export interface AssetHistoryData {
  priceUsd: string;
  time: number;
  date: string;
}

export interface AssetHistoryResponse {
  data: AssetHistoryData[];
  timestamp: number;
}

export interface AssetResponse {
  data: AssetData;
  timestamp: number;
}

export type TimeFrame = 'h1' | 'h12' | 'd1' | 'w1' | 'm1';

export interface TimeFrameOption {
  value: TimeFrame;
  label: string;
}

export type MarketSentiment = 
  | 'extreme_fear' 
  | 'fear' 
  | 'neutral' 
  | 'positive' 
  | 'greed' 
  | 'extreme_greed';

export interface SortOption {
  id: string;
  label: string;
  sortFn: (a: AssetData, b: AssetData) => number;
}

export type AssetCategory = 'all' | 'gainers' | 'losers' | 'trending';
