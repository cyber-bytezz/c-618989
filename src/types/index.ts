
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

// API response types
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

// Add ReactionType for CryptoWhisper components
export type ReactionType = 'fire' | 'rocket' | 'diamond' | 'nervous';

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

// New types for enhanced features
export type UITheme = 'neo-brutalist' | 'cyberpunk' | 'minimalist' | 'custom';

export interface ThemeCustomization {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
  borderRadius: string;
  highContrast: boolean;
}

export interface PredictionVote {
  assetId: string;
  direction: 'bullish' | 'bearish';
  userId: string;
  timestamp: number;
  expiresAt: number;
}

export interface WhaleTrade {
  assetId: string;
  amount: number;
  direction: 'buy' | 'sell';
  value: number;
  timestamp: number;
  txHash: string;
}

export interface AlertSettings {
  enabled: boolean;
  voiceEnabled: boolean;
  priceChangeThreshold: number;
  assets: string[];
  customAlerts: {
    assetId: string;
    condition: 'above' | 'below';
    price: number;
  }[];
}

// New types for Market Shift Detector
export interface MarketShift {
  assetId: string;
  name: string;
  symbol: string;
  change: number;
  timestamp: number;
  timeframe: string;
}

// Types for Crypto Time Machine
export interface HistoricalMarketEvent {
  date: Date;
  event: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface MarketScenario {
  id: string;
  name: string;
  description: string;
  volatility: number;
  startDate?: Date;
  endDate?: Date;
}

// Types for HODL vs. Sell Sentiment
export interface AssetSentiment {
  assetId: string;
  hodlPercentage: number;
  sellPercentage: number;
  totalVotes: number;
}

export type SentimentVote = 'hodl' | 'sell';

export interface UserSentimentVotes {
  [assetId: string]: SentimentVote;
}
