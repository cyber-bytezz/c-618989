
import { AssetsResponse, AssetHistoryResponse, AssetResponse } from "../types";

const BASE_URL = "https://api.coincap.io/v2";

export async function fetchAssets(): Promise<AssetsResponse> {
  const response = await fetch(`${BASE_URL}/assets?limit=20`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch assets: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchAsset(id: string): Promise<AssetResponse> {
  const response = await fetch(`${BASE_URL}/assets/${id}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch asset: ${response.status}`);
  }
  
  return response.json();
}

export async function fetchAssetHistory(
  id: string, 
  interval: string = "d1"
): Promise<AssetHistoryResponse> {
  const response = await fetch(`${BASE_URL}/assets/${id}/history?interval=${interval}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch asset history: ${response.status}`);
  }
  
  return response.json();
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
