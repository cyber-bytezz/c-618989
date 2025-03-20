import React, { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { fetchAssets } from '../lib/api';
import { AssetData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface MarketShift {
  assetId: string;
  name: string;
  symbol: string;
  change: number;
  timeframe: string;
  timestamp: number;
}

const MarketShiftDetector: React.FC = () => {
  const { isDark } = useTheme();
  const [shifts, setShifts] = useState<MarketShift[]>([]);
  const [trendingCoins, setTrendingCoins] = useState<{id: string, name: string, symbol: string, change: number}[]>([]);
  
  // Fetch market data
  const { data: marketData } = useRealTimeData(
    ['market-shift-detector'],
    () => fetchAssets(12),
    { pollingInterval: 30000 }
  );
  
  // Simulate market shifts
  useEffect(() => {
    if (marketData?.data) {
      // Simulate a shift detection every 20-60 seconds
      const interval = setInterval(() => {
        if (Math.random() > 0.5) { // 50% chance of detecting a shift
          const randomAsset = marketData.data[Math.floor(Math.random() * marketData.data.length)];
          const changeValue = (Math.random() * 12) - 3; // Random between -3% and +9%
          
          if (Math.abs(changeValue) >= 5) { // Only show significant shifts (>=5%)
            const newShift: MarketShift = {
              assetId: randomAsset.id,
              name: randomAsset.name,
              symbol: randomAsset.symbol,
              change: changeValue,
              timeframe: `${Math.floor(Math.random() * 15) + 5} min`,
              timestamp: Date.now()
            };
            
            setShifts(prev => {
              // Keep max 5 most recent shifts
              const updated = [newShift, ...prev];
              if (updated.length > 5) updated.pop();
              return updated;
            });
          }
        }
      }, Math.floor(Math.random() * 40000) + 20000); // Random interval between 20-60s
      
      // Update trending coins every 2 minutes
      const trendingInterval = setInterval(() => {
        const topCoins = [...marketData.data]
          .sort((a, b) => Math.abs(parseFloat(b.changePercent24Hr)) - Math.abs(parseFloat(a.changePercent24Hr)))
          .slice(0, 3)
          .map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            change: parseFloat(coin.changePercent24Hr)
          }));
          
        setTrendingCoins(topCoins);
      }, 120000);
      
      // Initial trending coins
      const initialTopCoins = [...marketData.data]
        .sort((a, b) => Math.abs(parseFloat(b.changePercent24Hr)) - Math.abs(parseFloat(a.changePercent24Hr)))
        .slice(0, 3)
        .map(coin => ({
          id: coin.id,
          name: coin.name,
          symbol: coin.symbol,
          change: parseFloat(coin.changePercent24Hr)
        }));
        
      setTrendingCoins(initialTopCoins);
      
      // Initial simulated shifts
      const initialShifts: MarketShift[] = [
        {
          assetId: 'bitcoin',
          name: 'Bitcoin',
          symbol: 'BTC',
          change: 5.8,
          timeframe: '10 min',
          timestamp: Date.now() - 300000 // 5 min ago
        },
        {
          assetId: 'ethereum',
          name: 'Ethereum',
          symbol: 'ETH',
          change: -6.2,
          timeframe: '15 min',
          timestamp: Date.now() - 600000 // 10 min ago
        }
      ];
      
      setShifts(initialShifts);
      
      return () => {
        clearInterval(interval);
        clearInterval(trendingInterval);
      };
    }
  }, [marketData]);
  
  return (
    <div className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800' : 'bg-white'} p-4 rounded-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertTriangle size={18} className="text-yellow-500 mr-2" />
          <h3 className="text-lg font-bold">Market Shift Detector</h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Zap size={14} className="mr-1" />
          Real-time momentum
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Sudden market shifts */}
        <div>
          <h4 className="text-sm font-medium mb-2">Sudden Market Shifts</h4>
          
          <AnimatePresence initial={false}>
            {shifts.length > 0 ? (
              <div className="space-y-2">
                {shifts.map((shift, index) => (
                  <motion.div 
                    key={`${shift.assetId}-${shift.timestamp}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`p-2 rounded-lg flex items-center justify-between ${
                      shift.change > 0 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/30' 
                        : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30'
                    } ${index === 0 ? 'animate-pulse-slow' : ''}`}
                  >
                    <div className="flex items-center">
                      {shift.change > 0 ? (
                        <TrendingUp size={16} className="text-green-500 mr-2" />
                      ) : (
                        <TrendingDown size={16} className="text-red-500 mr-2" />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {shift.symbol} <span className={shift.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                            {shift.change > 0 ? '+' : ''}{shift.change.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          in {shift.timeframe}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-right">
                      <div className="font-medium">{shift.name}</div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {new Date(shift.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                No significant market shifts detected
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Top trending coins */}
        <div>
          <h4 className="text-sm font-medium mb-2">Top Trending Coins</h4>
          
          <div className="grid grid-cols-3 gap-2">
            {trendingCoins.map((coin, index) => (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-2 rounded-lg border ${
                  coin.change > 0 
                    ? 'border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800/30' 
                    : 'border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">{coin.symbol}</div>
                  <div className={`text-xs font-medium ${
                    coin.change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {coin.change > 0 ? '+' : ''}{coin.change.toFixed(1)}%
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {coin.name}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketShiftDetector;
