import { AssetsResponse, AssetHistoryResponse, AssetResponse, TimeFrame, MarketSentiment } from "../types";

const BASE_URL = "https://api.coincap.io/v2";

// Cache map to store recent responses and timestamps
const cache: Map<string, { data: any, timestamp: number }> = new Map();
const CACHE_TTL = 15000; // 15 seconds cache

/**
 * Fetches data with built-in caching to reduce API calls
 */
async function fetchWithCache<T>(url: string, cacheTTL: number = CACHE_TTL): Promise<T> {
  const now = Date.now();
  const cachedResponse = cache.get(url);
  
  // Return cached response if valid
  if (cachedResponse && now - cachedResponse.timestamp < cacheTTL) {
    return cachedResponse.data as T;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  // Cache the response
  cache.set(url, { data, timestamp: now });
  
  return data as T;
}

export async function fetchAssets(): Promise<AssetsResponse> {
  return fetchWithCache<AssetsResponse>(`${BASE_URL}/assets?limit=20`);
}

export async function fetchTopGainers(): Promise<AssetsResponse> {
  // Fetch all assets and sort by positive change
  const response = await fetchWithCache<AssetsResponse>(`${BASE_URL}/assets?limit=100`);
  
  const sorted = {
    ...response,
    data: [...response.data]
      .filter(asset => parseFloat(asset.changePercent24Hr) > 0)
      .sort((a, b) => parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr))
      .slice(0, 20)
  };
  
  return sorted;
}

export async function fetchTopLosers(): Promise<AssetsResponse> {
  // Fetch all assets and sort by negative change
  const response = await fetchWithCache<AssetsResponse>(`${BASE_URL}/assets?limit=100`);
  
  const sorted = {
    ...response,
    data: [...response.data]
      .filter(asset => parseFloat(asset.changePercent24Hr) < 0)
      .sort((a, b) => parseFloat(a.changePercent24Hr) - parseFloat(b.changePercent24Hr))
      .slice(0, 20)
  };
  
  return sorted;
}

export async function fetchTrendingAssets(): Promise<AssetsResponse> {
  // Fetch all assets and sort by volume
  const response = await fetchWithCache<AssetsResponse>(`${BASE_URL}/assets?limit=100`);
  
  const sorted = {
    ...response,
    data: [...response.data]
      .sort((a, b) => parseFloat(b.volumeUsd24Hr) - parseFloat(a.volumeUsd24Hr))
      .slice(0, 20)
  };
  
  return sorted;
}

export async function fetchAsset(id: string): Promise<AssetResponse> {
  return fetchWithCache<AssetResponse>(`${BASE_URL}/assets/${id}`);
}

export async function fetchAssetHistory(
  id: string, 
  interval: TimeFrame = "d1"
): Promise<AssetHistoryResponse> {
  // Adjust the interval for API compatibility
  let apiInterval = interval;
  let historyPeriod = "";
  
  // For weekly and monthly views, we need to adjust the parameters
  if (interval === 'w1') {
    apiInterval = 'd1';
    historyPeriod = "&start=" + (Date.now() - 7 * 24 * 60 * 60 * 1000);
  } else if (interval === 'm1') {
    apiInterval = 'd1';
    historyPeriod = "&start=" + (Date.now() - 30 * 24 * 60 * 60 * 1000);
  }
  
  return fetchWithCache<AssetHistoryResponse>(
    `${BASE_URL}/assets/${id}/history?interval=${apiInterval}${historyPeriod}`
  );
}

export function calculateMarketSentiment(assets: AssetsResponse): MarketSentiment {
  if (!assets.data.length) return "neutral";
  
  // Count positive and negative changes
  const changes = assets.data.map(asset => parseFloat(asset.changePercent24Hr));
  const positiveCount = changes.filter(change => change > 0).length;
  const negativeCount = changes.filter(change => change < 0).length;
  
  // Calculate average change
  const averageChange = changes.reduce((sum, change) => sum + change, 0) / changes.length;
  
  // Determine market sentiment
  if (averageChange > 5) return "extreme_greed";
  if (averageChange > 2) return "greed";
  if (averageChange > 0.5) return "positive";
  if (averageChange > -0.5) return "neutral";
  if (averageChange > -2) return "fear";
  if (averageChange > -5) return "extreme_fear";
  return "extreme_fear";
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (numPrice < 0.01) {
    return `$${numPrice.toFixed(6)}`;
  } else if (numPrice < 1) {
    return `$${numPrice.toFixed(4)}`;
  } else if (numPrice < 1000) {
    return `$${numPrice.toFixed(2)}`;
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numPrice);
  }
}

export function formatPercent(percent: string | number): string {
  const numPercent = typeof percent === 'string' ? parseFloat(percent) : percent;
  return `${numPercent > 0 ? '+' : ''}${numPercent.toFixed(2)}%`;
}

export function formatMarketCap(marketCap: string | number): string {
  const numMarketCap = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap;
  
  if (numMarketCap >= 1_000_000_000_000) {
    return `$${(numMarketCap / 1_000_000_000_000).toFixed(2)}T`;
  } else if (numMarketCap >= 1_000_000_000) {
    return `$${(numMarketCap / 1_000_000_000).toFixed(2)}B`;
  } else if (numMarketCap >= 1_000_000) {
    return `$${(numMarketCap / 1_000_000).toFixed(2)}M`;
  } else {
    return `$${numMarketCap.toFixed(2)}`;
  }
}
