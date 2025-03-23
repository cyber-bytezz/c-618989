
import { AssetData, Portfolio, PortfolioAction, RiskProfile } from '@/types';

/**
 * Updates portfolio with current asset prices
 */
export function calculatePortfolioBalance(portfolio: Portfolio, assets: AssetData[]): Portfolio {
  // Create a map of asset prices for quick lookup
  const assetPrices: Record<string, number> = {};
  assets.forEach(asset => {
    assetPrices[asset.id] = parseFloat(asset.priceUsd);
  });

  // Calculate current value of each portfolio asset
  const updatedAssets = portfolio.assets.map(asset => {
    const currentPrice = assetPrices[asset.assetId] || 0;
    const valueUsd = asset.amount * currentPrice;
    
    return {
      ...asset,
      valueUsd
    };
  });

  // Calculate total portfolio value
  const totalValueUsd = updatedAssets.reduce((sum, asset) => sum + asset.valueUsd, 0);
  
  // Update allocations based on current values
  const assetsWithUpdatedAllocations = updatedAssets.map(asset => ({
    ...asset,
    allocation: totalValueUsd > 0 ? (asset.valueUsd / totalValueUsd) * 100 : asset.allocation
  }));

  return {
    ...portfolio,
    assets: assetsWithUpdatedAllocations,
    totalValueUsd
  };
}

/**
 * Generates portfolio performance metrics
 */
export function calculatePortfolioPerformance(
  currentPortfolio: Portfolio, 
  previousPortfolio: Portfolio
): { daily: number; weekly: number; monthly: number } {
  // In a real app, we would compare historical data
  // Here we'll just return the mock data for simplicity
  return currentPortfolio.performance;
}

/**
 * Calculates portfolio risk score (0-100)
 */
export function calculateRiskScore(portfolio: Portfolio, assets: AssetData[]): number {
  // In a real app, this would use volatility, correlation, and other metrics
  // For this example, we'll use a simplified calculation
  
  // Get volatility estimates from change percentages as a proxy
  const assetVolatility: Record<string, number> = {};
  assets.forEach(asset => {
    // Convert 24h change to absolute value as a simple volatility estimate
    assetVolatility[asset.id] = Math.abs(parseFloat(asset.changePercent24Hr));
  });
  
  // Calculate weighted volatility based on allocations
  let weightedVolatility = 0;
  portfolio.assets.forEach(asset => {
    const vol = assetVolatility[asset.assetId] || 5; // Default to 5% if not found
    weightedVolatility += (vol * (asset.allocation / 100));
  });
  
  // Convert to a 0-100 scale
  // Higher volatility = higher risk score
  const riskScore = Math.min(100, Math.max(0, weightedVolatility * 5));
  
  return Math.round(riskScore);
}

/**
 * Generates AI-suggested portfolio actions based on risk profile
 */
export function generatePortfolioActions(
  portfolio: Portfolio, 
  assets: AssetData[], 
  riskProfile: RiskProfile
): PortfolioAction[] {
  const actions: PortfolioAction[] = [];
  
  // Target allocations based on risk profile
  const targetAllocations = getTargetAllocations(riskProfile);
  
  // Create a map for easier asset lookup
  const assetMap: Record<string, AssetData> = {};
  assets.forEach(asset => {
    assetMap[asset.id] = asset;
  });
  
  // Compare current allocations with target allocations
  portfolio.assets.forEach(asset => {
    const targetAllocation = targetAllocations[asset.assetId];
    
    // If we have a target allocation for this asset
    if (targetAllocation !== undefined) {
      const currentAllocation = asset.allocation;
      const difference = targetAllocation - currentAllocation;
      
      // Only suggest changes for significant differences (>2%)
      if (Math.abs(difference) > 2) {
        const action: PortfolioAction = {
          assetId: asset.assetId,
          symbol: asset.symbol,
          action: difference > 0 ? 'buy' : 'sell',
          allocationChange: Math.abs(difference),
          amount: calculateAmountToTrade(
            Math.abs(difference), 
            portfolio.totalValueUsd, 
            parseFloat(assetMap[asset.assetId]?.priceUsd || '0')
          ),
          reasoning: generateReasoning(
            asset.assetId, 
            difference, 
            assetMap[asset.assetId], 
            riskProfile
          )
        };
        
        actions.push(action);
      }
    }
  });
  
  return actions;
}

/**
 * Calculates how much of an asset to buy/sell based on allocation change
 */
function calculateAmountToTrade(
  allocationChangePercent: number, 
  totalPortfolioValue: number, 
  assetPrice: number
): number {
  if (assetPrice <= 0) return 0;
  
  const valueToTrade = (allocationChangePercent / 100) * totalPortfolioValue;
  const amount = valueToTrade / assetPrice;
  
  // Round to appropriate decimal places based on price
  if (assetPrice < 0.01) return parseFloat(amount.toFixed(6));
  if (assetPrice < 1) return parseFloat(amount.toFixed(4));
  if (assetPrice < 1000) return parseFloat(amount.toFixed(2));
  return parseFloat(amount.toFixed(2));
}

/**
 * Generates reasoning for suggested action
 */
function generateReasoning(
  assetId: string,
  allocationDifference: number,
  assetData?: AssetData,
  riskProfile?: RiskProfile
): string {
  // If we don't have asset data, provide a generic reason
  if (!assetData) {
    return allocationDifference > 0
      ? "Increase allocation to diversify portfolio"
      : "Reduce exposure to balance portfolio";
  }
  
  const changePercent = parseFloat(assetData.changePercent24Hr);
  const isPositiveChange = changePercent > 0;
  
  // Generate reasoning based on asset performance and risk profile
  if (allocationDifference > 0) {
    // Buying more
    if (isPositiveChange) {
      return riskProfile === 'aggressive' || riskProfile === 'very_aggressive'
        ? `Capitalize on strong momentum (${changePercent.toFixed(2)}% 24h change)`
        : `Gradually increase position in asset with positive trend (${changePercent.toFixed(2)}%)`;
    } else {
      return `Buy the dip while price is down ${Math.abs(changePercent).toFixed(2)}% to optimize position`;
    }
  } else {
    // Selling
    if (isPositiveChange) {
      return `Take profit after ${changePercent.toFixed(2)}% gain to rebalance portfolio`;
    } else {
      return riskProfile === 'conservative' || riskProfile === 'moderate'
        ? `Reduce exposure to minimize further loss (${changePercent.toFixed(2)}%)`
        : `Reallocate to better performing assets from this underperformer`;
    }
  }
}

/**
 * Provides target allocations based on risk profile
 */
function getTargetAllocations(riskProfile: RiskProfile): Record<string, number> {
  // These would typically come from an AI model or predefined strategies
  // For demo purposes, we're using predetermined allocations
  
  switch (riskProfile) {
    case 'conservative':
      return {
        'bitcoin': 35,
        'ethereum': 20,
        'cardano': 10,
        'solana': 5,
        'polkadot': 5,
        'tether': 20,
        'usd-coin': 5,
      };
      
    case 'moderate':
      return {
        'bitcoin': 40,
        'ethereum': 25,
        'cardano': 12,
        'solana': 8,
        'polkadot': 7,
        'tether': 8,
      };
      
    case 'aggressive':
      return {
        'bitcoin': 45,
        'ethereum': 30,
        'cardano': 8,
        'solana': 12,
        'polkadot': 5,
      };
      
    case 'very_aggressive':
      return {
        'bitcoin': 35,
        'ethereum': 35,
        'solana': 20,
        'polkadot': 10,
      };
      
    default:
      return {
        'bitcoin': 40,
        'ethereum': 25,
        'cardano': 12,
        'solana': 8,
        'polkadot': 7,
        'tether': 8,
      };
  }
}
