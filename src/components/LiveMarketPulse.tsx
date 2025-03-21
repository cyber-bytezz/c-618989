
import React, { useState, useEffect } from 'react';
import { fetchAssets } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Activity, TrendingUp, TrendingDown, Volume2, DollarSign, Zap } from 'lucide-react';
import { AssetData, MarketSentiment } from '@/types';
import { toast } from 'sonner';

const LiveMarketPulse: React.FC = () => {
  const { isDark } = useTheme();
  const [pulseData, setPulseData] = useState<{
    topGainers: AssetData[];
    topLosers: AssetData[];
    marketVolume: number;
    marketSentiment: MarketSentiment;
    dominance: { symbol: string; value: number }[];
    lastUpdate: Date;
  }>({
    topGainers: [],
    topLosers: [],
    marketVolume: 0,
    marketSentiment: 'neutral',
    dominance: [],
    lastUpdate: new Date()
  });
  
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animate pulse data
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAssets(100);
        
        if (response.data && response.data.length > 0) {
          // Sort by percent change for gainers and losers
          const sortedByChange = [...response.data].sort((a, b) => 
            parseFloat(b.changePercent24Hr) - parseFloat(a.changePercent24Hr)
          );
          
          const topGainers = sortedByChange.slice(0, 5);
          const topLosers = sortedByChange.slice(-5).reverse();
          
          // Calculate total market volume
          const marketVolume = response.data.reduce(
            (sum, asset) => sum + parseFloat(asset.volumeUsd24Hr), 
            0
          );
          
          // Calculate market dominance
          const totalMarketCap = response.data.reduce(
            (sum, asset) => sum + parseFloat(asset.marketCapUsd), 
            0
          );
          
          const dominance = response.data
            .slice(0, 3)
            .map(asset => ({
              symbol: asset.symbol,
              value: (parseFloat(asset.marketCapUsd) / totalMarketCap) * 100
            }));
          
          // Determine market sentiment based on gainers/losers ratio
          const gainersCount = response.data.filter(
            asset => parseFloat(asset.changePercent24Hr) > 0
          ).length;
          
          const ratio = gainersCount / response.data.length;
          let sentiment: MarketSentiment = 'neutral';
          
          if (ratio > 0.8) sentiment = 'extreme_greed';
          else if (ratio > 0.65) sentiment = 'greed';
          else if (ratio > 0.55) sentiment = 'positive';
          else if (ratio > 0.45) sentiment = 'neutral';
          else if (ratio > 0.3) sentiment = 'fear';
          else sentiment = 'extreme_fear';
          
          setPulseData({
            topGainers,
            topLosers,
            marketVolume,
            marketSentiment: sentiment,
            dominance,
            lastUpdate: new Date()
          });
          
          // Notify on significant market movements
          const biggestGainer = topGainers[0];
          const biggestLoser = topLosers[0];
          
          if (parseFloat(biggestGainer.changePercent24Hr) > 10) {
            toast(`🚀 ${biggestGainer.symbol} surged ${parseFloat(biggestGainer.changePercent24Hr).toFixed(2)}% in 24h!`, {
              description: "Major bullish movement detected"
            });
          }
          
          if (parseFloat(biggestLoser.changePercent24Hr) < -10) {
            toast(`📉 ${biggestLoser.symbol} dropped ${parseFloat(biggestLoser.changePercent24Hr).toFixed(2)}% in 24h!`, {
              description: "Major bearish movement detected"
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch market pulse data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMarketData();
    
    const interval = setInterval(fetchMarketData, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Pulse animation effect
  useEffect(() => {
    const pulseInterval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => setIsVisible(true), 300);
    }, 30000); // Flash/pulse effect every 30 seconds
    
    return () => clearInterval(pulseInterval);
  }, []);
  
  const formatVolume = (volume: number): string => {
    if (volume >= 1e12) return `$${(volume / 1e12).toFixed(2)}T`;
    if (volume >= 1e9) return `$${(volume / 1e9).toFixed(2)}B`;
    if (volume >= 1e6) return `$${(volume / 1e6).toFixed(2)}M`;
    if (volume >= 1e3) return `$${(volume / 1e3).toFixed(2)}K`;
    return `$${volume.toFixed(2)}`;
  };
  
  return (
    <div 
      className={`neo-brutalist-sm overflow-hidden transition-all duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-80'
      } ${
        isExpanded ? 'max-h-[500px]' : 'max-h-24'
      }`}
    >
      <div 
        className={`p-4 bg-gradient-to-r ${
          isDark 
            ? 'from-blue-900/30 to-purple-900/30' 
            : 'from-blue-50 to-purple-50'
        } cursor-pointer`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-indigo-500 mr-2 animate-pulse" />
            <h3 className="font-bold text-lg">Live Market Pulse</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">
              Last updated: {pulseData.lastUpdate.toLocaleTimeString()}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              pulseData.marketSentiment.includes('greed') 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                : pulseData.marketSentiment.includes('fear')
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
            }`}>
              {pulseData.marketSentiment.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
        
        {!isExpanded && (
          <div className="mt-2 flex items-center justify-between text-sm">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">
                {pulseData.topGainers[0]?.symbol || '---'}: 
                {pulseData.topGainers[0] 
                  ? `+${parseFloat(pulseData.topGainers[0].changePercent24Hr).toFixed(2)}%` 
                  : '---'
                }
              </span>
            </div>
            
            <div className="flex items-center">
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              <span className="text-red-600 dark:text-red-400">
                {pulseData.topLosers[0]?.symbol || '---'}: 
                {pulseData.topLosers[0] 
                  ? `${parseFloat(pulseData.topLosers[0].changePercent24Hr).toFixed(2)}%` 
                  : '---'
                }
              </span>
            </div>
            
            <div className="flex items-center">
              <Volume2 className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-blue-600 dark:text-blue-400">
                Vol: {formatVolume(pulseData.marketVolume)}
              </span>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-purple-500 mr-1" />
              <span className="text-purple-600 dark:text-purple-400">
                {pulseData.dominance[0]?.symbol || 'BTC'}: 
                {pulseData.dominance[0] 
                  ? `${pulseData.dominance[0].value.toFixed(2)}%` 
                  : '---'
                }
              </span>
            </div>
          </div>
        )}
      </div>
      
      {isExpanded && (
        <div className="p-4 bg-white/50 dark:bg-gray-900/50">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold flex items-center mb-2">
                    <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                    Top Gainers (24h)
                  </h4>
                  <div className="space-y-2">
                    {pulseData.topGainers.map(asset => (
                      <div key={asset.id} className="flex justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                        <span className="font-medium">{asset.symbol}</span>
                        <span className="text-green-600 dark:text-green-400">
                          +{parseFloat(asset.changePercent24Hr).toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold flex items-center mb-2">
                    <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                    Top Losers (24h)
                  </h4>
                  <div className="space-y-2">
                    {pulseData.topLosers.map(asset => (
                      <div key={asset.id} className="flex justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded">
                        <span className="font-medium">{asset.symbol}</span>
                        <span className="text-red-600 dark:text-red-400">
                          {parseFloat(asset.changePercent24Hr).toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold flex items-center mb-2">
                  <DollarSign className="w-4 h-4 text-purple-500 mr-2" />
                  Market Dominance
                </h4>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                  {pulseData.dominance.map((item, index) => (
                    <div 
                      key={item.symbol}
                      className={`h-4 rounded-l-full ${
                        index === 0 
                          ? 'bg-blue-500' 
                          : index === 1 
                            ? 'bg-indigo-500' 
                            : 'bg-purple-500'
                      }`}
                      style={{
                        width: `${item.value}%`,
                        marginLeft: index > 0 ? `${pulseData.dominance.slice(0, index).reduce((sum, i) => sum + i.value, 0)}%` : '0',
                        position: index > 0 ? 'absolute' : 'relative'
                      }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-sm">
                  {pulseData.dominance.map((item) => (
                    <div key={item.symbol} className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-1 ${
                        item.symbol === pulseData.dominance[0].symbol 
                          ? 'bg-blue-500' 
                          : item.symbol === pulseData.dominance[1]?.symbol 
                            ? 'bg-indigo-500' 
                            : 'bg-purple-500'
                      }`}></div>
                      <span>{item.symbol}: {item.value.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold flex items-center mb-2">
                  <Zap className="w-4 h-4 text-yellow-500 mr-2" />
                  Market Insights
                </h4>
                <div className="p-3 rounded bg-yellow-50 dark:bg-yellow-900/20 text-sm">
                  {pulseData.marketSentiment === 'extreme_greed' && (
                    <p>Market is showing signs of excessive optimism. Consider taking profits or being cautious with new positions.</p>
                  )}
                  {pulseData.marketSentiment === 'greed' && (
                    <p>Bullish sentiment is prevalent. The market is trending upward but watch for potential corrections.</p>
                  )}
                  {pulseData.marketSentiment === 'positive' && (
                    <p>Moderate optimism in the market. This could be a good time for strategic entries while maintaining caution.</p>
                  )}
                  {pulseData.marketSentiment === 'neutral' && (
                    <p>Market sentiment is balanced. No strong bias in either direction, suggesting a consolidation phase.</p>
                  )}
                  {pulseData.marketSentiment === 'fear' && (
                    <p>Bearish sentiment is prevalent. Consider defensive positions, but watch for potential buying opportunities.</p>
                  )}
                  {pulseData.marketSentiment === 'extreme_fear' && (
                    <p>Market is in panic. While risky, this might present buying opportunities for long-term investors.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveMarketPulse;
