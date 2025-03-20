
import React, { useState, useEffect } from 'react';
import { WhaleTrade } from '../types';
import { Anchor, TrendingUp, TrendingDown, ExternalLink, Clock, Activity, Snowflake } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { formatDistance } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for whale trades
const mockWhaleTrades: WhaleTrade[] = [
  {
    assetId: 'bitcoin',
    amount: 156.23,
    direction: 'buy',
    value: 9245678,
    timestamp: Date.now() - (15 * 60 * 1000), // 15 minutes ago
    txHash: '0x8a9c4567e9b3ff87e6789abcdef123456'
  },
  {
    assetId: 'ethereum',
    amount: 1253.67,
    direction: 'sell',
    value: 3245678,
    timestamp: Date.now() - (45 * 60 * 1000), // 45 minutes ago
    txHash: '0x7b8c4567e9b3ff87e6789abcdef654321'
  },
  {
    assetId: 'solana',
    amount: 50245.34,
    direction: 'buy',
    value: 2145678,
    timestamp: Date.now() - (120 * 60 * 1000), // 2 hours ago
    txHash: '0x6c9d4567e9b3ff87e6789abcdef987654'
  },
  {
    assetId: 'cardano',
    amount: 1250000,
    direction: 'sell',
    value: 1045678,
    timestamp: Date.now() - (180 * 60 * 1000), // 3 hours ago
    txHash: '0x5d8e4567e9b3ff87e6789abcdef876543'
  }
];

const WhaleWatch: React.FC = () => {
  const { isDark } = useTheme();
  const [trades, setTrades] = useState<WhaleTrade[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activityLevel, setActivityLevel] = useState<'high' | 'medium' | 'low'>('medium');
  
  // Simulate loading whale trades and periodic updates
  useEffect(() => {
    setTrades(mockWhaleTrades);
    
    // Simulate new whale trades coming in
    const interval = setInterval(() => {
      if (Math.random() > 0.7) { // 30% chance of new whale trade
        const newTrade: WhaleTrade = {
          assetId: ['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple'][Math.floor(Math.random() * 5)],
          amount: Math.floor(Math.random() * 10000) + 100,
          direction: Math.random() > 0.5 ? 'buy' : 'sell',
          value: Math.floor(Math.random() * 10000000) + 500000,
          timestamp: Date.now(),
          txHash: `0x${Math.random().toString(16).substring(2, 30)}`
        };
        
        setTrades(prev => {
          const newTrades = [newTrade, ...prev.slice(0, 3)];
          
          // Update activity level based on frequency and size
          const recentTrades = newTrades.filter(t => Date.now() - t.timestamp < 30 * 60 * 1000); // last 30 min
          const totalValue = recentTrades.reduce((sum, t) => sum + t.value, 0);
          
          if (recentTrades.length >= 3 || totalValue > 15000000) {
            setActivityLevel('high');
          } else if (recentTrades.length >= 1 || totalValue > 5000000) {
            setActivityLevel('medium');
          } else {
            setActivityLevel('low');
          }
          
          return newTrades;
        });
        
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 2000);
      }
    }, 20000); // Check every 20 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const formatTradeValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };
  
  return (
    <motion.div 
      className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800' : 'bg-white'} p-4 rounded-xl overflow-hidden relative ${isAnimating ? 'whale-alert' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Anchor size={18} className="text-blue-500 mr-2" />
          <h3 className="text-lg font-bold">Whale Watch</h3>
        </div>
        <div className="flex items-center text-xs gap-2">
          <div className="text-gray-500 dark:text-gray-400 hidden sm:block">
            Activity:
          </div>
          <div className="flex items-center">
            {activityLevel === 'high' ? (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, repeatType: "loop", duration: 2 }}
                className="flex items-center text-red-500 dark:text-red-400"
              >
                <Activity size={14} className="mr-1" />
                <span className="font-medium">High</span>
              </motion.div>
            ) : activityLevel === 'medium' ? (
              <div className="flex items-center text-yellow-500 dark:text-yellow-400">
                <Activity size={14} className="mr-1" />
                <span className="font-medium">Medium</span>
              </div>
            ) : (
              <div className="flex items-center text-blue-500 dark:text-blue-400">
                <Snowflake size={14} className="mr-1" />
                <span className="font-medium">Low</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-none">
        <AnimatePresence initial={false}>
          {trades.map((trade, index) => (
            <motion.div 
              key={trade.txHash} 
              className={`p-3 rounded-lg border ${
                trade.direction === 'buy' 
                  ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800/30' 
                  : 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/30'
              } ${index === 0 && isAnimating ? 'animate-pulse' : ''}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
              transition={{ duration: 0.3 }}
              layout
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    trade.direction === 'buy'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {trade.direction === 'buy' ? (
                      <span className="flex items-center"><TrendingUp size={12} className="mr-1" /> BUY</span>
                    ) : (
                      <span className="flex items-center"><TrendingDown size={12} className="mr-1" /> SELL</span>
                    )}
                  </span>
                  <span className="ml-2 text-sm font-medium capitalize">{trade.assetId}</span>
                </div>
                <span className="text-sm font-bold">{formatTradeValue(trade.value)}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                  <Clock size={12} className="mr-1" />
                  {formatDistance(trade.timestamp, new Date(), { addSuffix: true })}
                </div>
                <a 
                  href={`https://etherscan.io/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-blue-500 transition-colors"
                >
                  <ExternalLink size={12} className="mr-1" />
                  View
                </a>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
        Monitoring large transactions (${'>'}1M) across major exchanges
      </div>
    </motion.div>
  );
};

export default WhaleWatch;
