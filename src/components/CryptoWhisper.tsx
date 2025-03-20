
import { useState, useEffect } from 'react';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, Star } from 'lucide-react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { fetchAssets } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import CryptoWhisperReactions from './CryptoWhisperReactions';
import { ReactionType, UserReactions, InsightReactions } from '../types';

// Hardcoded market insights based on price movements
const marketInsights = [
  {
    id: 1,
    message: "Bitcoin is showing signs of recovery after recent market turbulence.",
    icon: <TrendingUp className="text-green-500" />,
    type: "positive"
  },
  {
    id: 2,
    message: "Ethereum gas fees dropped 15% in the last 24 hours, making transactions more affordable.",
    icon: <TrendingDown className="text-green-500" />,
    type: "positive"
  },
  {
    id: 3,
    message: "Market analysts predict a potential alt-coin season approaching as Bitcoin dominance wanes.",
    icon: <Star className="text-yellow-500" />,
    type: "neutral"
  },
  {
    id: 4,
    message: "Solana network experiencing increased adoption with 20% more daily active addresses.",
    icon: <TrendingUp className="text-green-500" />,
    type: "positive"
  },
  {
    id: 5,
    message: "XRP facing regulatory uncertainty as legal battle continues to unfold.",
    icon: <AlertTriangle className="text-yellow-500" />,
    type: "warning"
  },
  {
    id: 6,
    message: "DeFi Total Value Locked (TVL) dropped 8% amid broader market concerns.",
    icon: <TrendingDown className="text-red-500" />,
    type: "negative"
  },
  {
    id: 7,
    message: "NFT trading volume surged 25% this week, signaling renewed interest in digital collectibles.",
    icon: <Zap className="text-purple-500" />,
    type: "positive"
  },
];

// Dynamic insights based on price changes
const generateDynamicInsights = (assets: any[]) => {
  if (!assets || assets.length === 0) return [];
  
  const insights = [];
  
  // Find biggest gainer
  const biggestGainer = assets.reduce((prev, current) => 
    (parseFloat(prev.changePercent24Hr) > parseFloat(current.changePercent24Hr)) ? prev : current
  );
  
  if (parseFloat(biggestGainer.changePercent24Hr) > 5) {
    insights.push({
      id: 'dynamic-1',
      message: `🚀 ${biggestGainer.name} skyrocketed ${parseFloat(biggestGainer.changePercent24Hr).toFixed(2)}%! New all-time high?`,
      icon: <TrendingUp className="text-green-500" />,
      type: "positive"
    });
  } else if (parseFloat(biggestGainer.changePercent24Hr) > 2) {
    insights.push({
      id: 'dynamic-2',
      message: `🔹 ${biggestGainer.name} is up ${parseFloat(biggestGainer.changePercent24Hr).toFixed(2)}%, slow but steady.`,
      icon: <TrendingUp className="text-green-500" />,
      type: "positive"
    });
  }
  
  // Find biggest loser
  const biggestLoser = assets.reduce((prev, current) => 
    (parseFloat(prev.changePercent24Hr) < parseFloat(current.changePercent24Hr)) ? prev : current
  );
  
  if (parseFloat(biggestLoser.changePercent24Hr) < -5) {
    insights.push({
      id: 'dynamic-3',
      message: `📉 ${biggestLoser.name} lost ${Math.abs(parseFloat(biggestLoser.changePercent24Hr)).toFixed(2)}%. Market cooling down?`,
      icon: <TrendingDown className="text-red-500" />,
      type: "negative"
    });
  }
  
  return insights;
};

const CryptoWhisper = () => {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [allInsights, setAllInsights] = useState(marketInsights);
  const { isDark } = useTheme();
  const [reactions, setReactions] = useState<InsightReactions>({});
  const [userReacted, setUserReacted] = useState<UserReactions>({});
  
  // Fetch real-time data for dynamic insights
  const { data: assetsData } = useRealTimeData(
    ['assets-for-whisper'],
    fetchAssets,
    { 
      pollingInterval: 60000, // 1 minute
    }
  );
  
  // Update all insights when we get new data
  useEffect(() => {
    if (assetsData?.data) {
      const dynamicInsights = generateDynamicInsights(assetsData.data);
      setAllInsights([...marketInsights, ...dynamicInsights]);
    }
  }, [assetsData]);
  
  // Rotate insights every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentInsight(prev => (prev + 1) % allInsights.length);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [allInsights.length]);

  // Initialize reactions for each insight
  useEffect(() => {
    const initialReactions: InsightReactions = {};
    allInsights.forEach(insight => {
      const insightId = insight.id.toString();
      if (!reactions[insightId]) {
        initialReactions[insightId] = {
          fire: 0,
          rocket: 0,
          diamond: 0,
          nervous: 0
        };
      }
    });
    
    setReactions(prev => ({...prev, ...initialReactions}));
  }, [allInsights]);
  
  const handleReaction = (reaction: ReactionType) => {
    const insightId = allInsights[currentInsight].id.toString();
    
    // Update user reactions
    setUserReacted(prev => ({
      ...prev,
      [insightId]: {
        ...prev[insightId],
        [reaction]: true
      }
    }));
    
    // Update reaction counts
    setReactions(prev => ({
      ...prev,
      [insightId]: {
        ...prev[insightId],
        [reaction]: (prev[insightId]?.[reaction] || 0) + 1
      }
    }));
  };
  
  const insight = allInsights[currentInsight];
  
  if (!insight) return null;
  
  const insightId = insight.id.toString();
  
  return (
    <div className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800/80 dark:text-white' : 'bg-white/90'} p-4 rounded-xl overflow-hidden backdrop-blur-sm`}>
      <div className="flex items-center mb-2">
        <Zap size={20} className="text-neo-accent mr-2" />
        <h3 className="text-lg font-bold">Crypto Whisper</h3>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="border-l-4 pl-4 py-2 mb-3 animate-slide-in" 
             style={{ borderColor: insight.type === 'positive' ? '#34c759' : 
                                     insight.type === 'negative' ? '#ff3b30' : '#ff9500' }}>
          <div className="flex items-start">
            <div className="mr-3 mt-1">
              {insight.icon}
            </div>
            <p className="text-sm md:text-base">{insight.message}</p>
          </div>
        </div>
        
        <div className="w-full overflow-hidden h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
          <div 
            className="h-1 bg-neo-accent" 
            style={{ 
              width: '100%',
              animation: 'countdown 30s linear forwards'
            }}
          />
        </div>
        
        <style>
          {`
          @keyframes countdown {
            from { width: 100%; }
            to { width: 0%; }
          }
          
          @keyframes slide-in {
            from { transform: translateX(-10px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          `}
        </style>
      </div>
      
      <CryptoWhisperReactions 
        onReaction={handleReaction}
        userReacted={userReacted[insightId]}
        reactionCounts={reactions[insightId]}
      />
    </div>
  );
};

export default CryptoWhisper;
