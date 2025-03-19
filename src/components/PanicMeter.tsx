
import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingDown, DollarSign, Flame } from 'lucide-react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { fetchAssets } from '../lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

type VoteType = 'sell' | 'buy' | null;

interface AssetAlert {
  id: string;
  name: string;
  symbol: string;
  drop: number;
  timestamp: number;
}

const PanicMeter = () => {
  const [alerts, setAlerts] = useState<AssetAlert[]>([]);
  const [userVote, setUserVote] = useState<VoteType>(null);
  const [communityVotes, setCommunityVotes] = useState({ sell: 45, buy: 55 });
  const { isDark } = useTheme();
  
  // Fetch real-time data to detect significant drops
  const { data: assetsData } = useRealTimeData(
    ['assets-for-panic-meter'],
    fetchAssets,
    { 
      pollingInterval: 60000, // 1 minute
    }
  );
  
  // Check for significant price drops (simulated for now)
  useEffect(() => {
    if (assetsData?.data) {
      // For demo purposes, randomly simulate a crash sometimes
      if (Math.random() < 0.3 && alerts.length === 0) { // 30% chance, only if no active alerts
        const randomIndex = Math.floor(Math.random() * Math.min(10, assetsData.data.length));
        const asset = assetsData.data[randomIndex];
        
        // Simulate a bigger drop than actual
        const simulatedDrop = parseFloat(asset.changePercent24Hr) < 0 
          ? parseFloat(asset.changePercent24Hr)
          : -(Math.random() * 15 + 10); // Random drop between 10-25%
        
        const newAlert: AssetAlert = {
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          drop: simulatedDrop,
          timestamp: Date.now()
        };
        
        setAlerts(prev => [...prev, newAlert]);
        
        // Trigger notification
        toast.error(`${asset.name} just dropped ${Math.abs(simulatedDrop).toFixed(2)}%!`, {
          description: "The community is reacting. What's your move?",
          duration: 8000,
        });
      }
    }
  }, [assetsData, alerts.length]);
  
  // Remove alerts after 10 minutes
  useEffect(() => {
    const now = Date.now();
    setAlerts(prev => prev.filter(alert => (now - alert.timestamp) < 10 * 60 * 1000));
  }, []);
  
  // Handle user vote
  const handleVote = (vote: VoteType) => {
    if (userVote === vote) {
      // Cancel vote
      setUserVote(null);
      setCommunityVotes(prev => {
        const newVotes = { ...prev };
        newVotes[vote]--;
        return newVotes;
      });
    } else {
      // If switching vote
      if (userVote) {
        setCommunityVotes(prev => {
          const newVotes = { ...prev };
          newVotes[userVote]--;
          newVotes[vote as 'buy' | 'sell']++;
          return newVotes;
        });
      } else {
        // First vote
        setCommunityVotes(prev => {
          const newVotes = { ...prev };
          newVotes[vote as 'buy' | 'sell']++;
          return newVotes;
        });
      }
      setUserVote(vote);
    }
    
    // Save to localStorage
    localStorage.setItem('panicMeterVote', vote || '');
  };
  
  // Calculate percentages
  const total = communityVotes.sell + communityVotes.buy;
  const sellPercentage = Math.round((communityVotes.sell / total) * 100);
  const buyPercentage = Math.round((communityVotes.buy / total) * 100);
  
  if (alerts.length === 0) {
    return null; // Don't show if no active alerts
  }
  
  const latestAlert = alerts[alerts.length - 1];
  
  return (
    <div className={`neo-brutalist p-4 rounded-xl ${isDark ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'}`}>
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle size={22} className="text-red-500" />
        <h3 className="text-lg font-bold text-red-500">PANIC METER ALERT</h3>
        <Badge variant="destructive" className="ml-auto animate-pulse">LIVE</Badge>
      </div>
      
      <div className="p-3 border-l-4 border-red-500 bg-red-50 dark:bg-red-950 dark:bg-opacity-50 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingDown size={18} className="text-red-500" />
          <span className="font-bold">{latestAlert.name} ({latestAlert.symbol})</span>
        </div>
        <p className="text-sm mb-2">
          Price dropped <span className="text-red-600 font-bold">{Math.abs(latestAlert.drop).toFixed(2)}%</span> in the last 10 minutes!
        </p>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {new Date(latestAlert.timestamp).toLocaleTimeString()}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2">What's your move? Community is voting:</h4>
        
        <div className="flex gap-3 mb-3">
          <button
            onClick={() => handleVote('sell')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors ${
              userVote === 'sell' 
                ? 'bg-red-500 text-white' 
                : isDark 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <DollarSign size={16} />
            <span>Sell Now 😨</span>
          </button>
          
          <button
            onClick={() => handleVote('buy')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors ${
              userVote === 'buy' 
                ? 'bg-green-500 text-white' 
                : isDark 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Flame size={16} />
            <span>Buy the Dip 🤑</span>
          </button>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span>Sell: {sellPercentage}%</span>
          <span>Buy: {buyPercentage}%</span>
        </div>
        
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500"
            style={{ 
              width: `${sellPercentage}%`,
              transition: 'width 0.5s ease-in-out'
            }}
          ></div>
        </div>
        
        <p className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
          {total} community votes
        </p>
      </div>
    </div>
  );
};

export default PanicMeter;
