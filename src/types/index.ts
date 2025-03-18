
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
