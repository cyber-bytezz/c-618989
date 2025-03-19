import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HeartHandshake, Heart, Compass } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type SentimentVote = 'hodl' | 'sell';

interface SentimentDataPoint {
  timestamp: number;
  hodlPercentage: number;
  sellPercentage: number;
}

const HODLSentiment = () => {
  const [userVote, setUserVote] = useState<SentimentVote | null>(null);
  const [votes, setVotes] = useState({ hodl: 65, sell: 35 });
  const [historicalData, setHistoricalData] = useState<SentimentDataPoint[]>([]);
  const { isDark } = useTheme();
  
  // Load data from localStorage on mount
  useEffect(() => {
    const savedVote = localStorage.getItem('hodlSentimentVote');
    if (savedVote === 'hodl' || savedVote === 'sell') {
      setUserVote(savedVote);
    }
    
    const savedData = localStorage.getItem('hodlSentimentHistory');
    if (savedData) {
      setHistoricalData(JSON.parse(savedData));
    } else {
      // Generate some fake historical data for demo
      const fakeData: SentimentDataPoint[] = [];
      const now = Date.now();
      for (let i = 12; i >= 0; i--) {
        const timestamp = now - (i * 3600 * 1000); // hourly data
        const hodlPercentage = 50 + Math.sin(i / 3) * 20 + Math.random() * 10;
        fakeData.push({
          timestamp,
          hodlPercentage,
          sellPercentage: 100 - hodlPercentage
        });
      }
      setHistoricalData(fakeData);
      localStorage.setItem('hodlSentimentHistory', JSON.stringify(fakeData));
    }
  }, []);
  
  // Record new data point every hour
  useEffect(() => {
    const interval = setInterval(() => {
      const newDataPoint: SentimentDataPoint = {
        timestamp: Date.now(),
        hodlPercentage: votes.hodl,
        sellPercentage: votes.sell
      };
      
      setHistoricalData(prev => {
        const newData = [...prev, newDataPoint];
        // Keep only last 24 hours
        if (newData.length > 24) {
          newData.shift();
        }
        localStorage.setItem('hodlSentimentHistory', JSON.stringify(newData));
        return newData;
      });
    }, 3600 * 1000); // Every hour
    
    return () => clearInterval(interval);
  }, [votes]);
  
  // Handle vote
  const handleVote = (vote: SentimentVote) => {
    if (userVote === vote) {
      // Cancel vote
      setUserVote(null);
      localStorage.removeItem('hodlSentimentVote');
      
      setVotes(prev => {
        const newVotes = { ...prev };
        newVotes[vote]--;
        normalizeVotes(newVotes);
        return newVotes;
      });
    } else {
      // If switching vote
      if (userVote) {
        setVotes(prev => {
          const newVotes = { ...prev };
          newVotes[userVote]--;
          newVotes[vote]++;
          normalizeVotes(newVotes);
          return newVotes;
        });
      } else {
        // First vote
        setVotes(prev => {
          const newVotes = { ...prev };
          newVotes[vote]++;
          normalizeVotes(newVotes);
          return newVotes;
        });
      }
      
      setUserVote(vote);
      localStorage.setItem('hodlSentimentVote', vote);
    }
  };
  
  // Make sure votes sum to 100%
  const normalizeVotes = (votes: {hodl: number, sell: number}) => {
    const total = votes.hodl + votes.sell;
    votes.hodl = Math.round((votes.hodl / total) * 100);
    votes.sell = 100 - votes.hodl;
  };
  
  // Get sentiment description
  const getSentimentDescription = () => {
    if (votes.hodl >= 75) return "Extreme Bullish";
    if (votes.hodl >= 60) return "Bullish";
    if (votes.hodl >= 45) return "Slightly Bullish";
    if (votes.hodl >= 40) return "Neutral";
    if (votes.hodl >= 25) return "Slightly Bearish";
    if (votes.hodl >= 10) return "Bearish";
    return "Extreme Bearish";
  };
  
  // Format time for chart
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  return (
    <div className={`neo-brutalist ${isDark ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'} p-4 rounded-xl overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HeartHandshake size={20} className="text-neo-accent" />
          <h3 className="text-lg font-bold">HODL Sentiment</h3>
        </div>
        
        <Badge variant="outline" className="bg-gray-100 dark:bg-gray-700">
          {getSentimentDescription()}
        </Badge>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            <Heart size={16} className="text-red-500 mr-1" fill="currentColor" />
            <span className="font-bold">HODL</span>
            <span className="ml-1 text-xs">({votes.hodl}%)</span>
          </div>
          
          <div className="flex items-center">
            <span className="font-bold">SELL</span>
            <span className="ml-1 text-xs">({votes.sell}%)</span>
            <Compass size={16} className="text-blue-500 ml-1" />
          </div>
        </div>
        
        <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-red-500"
            style={{ 
              width: `${votes.hodl}%`,
              transition: 'width 0.5s ease-in-out'
            }}
          ></div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">What's your sentiment?</div>
        <ToggleGroup type="single" value={userVote || undefined} onValueChange={(value) => handleVote(value as SentimentVote)}>
          <ToggleGroupItem value="hodl" className="flex-1 data-[state=on]:bg-red-500 data-[state=on]:text-white">
            <Heart size={16} className="mr-1" />
            HODL
          </ToggleGroupItem>
          <ToggleGroupItem value="sell" className="flex-1 data-[state=on]:bg-blue-500 data-[state=on]:text-white">
            <Compass size={16} className="mr-1" />
            SELL
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div>
        <div className="text-sm font-medium mb-2">24-Hour Sentiment Trend</div>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={historicalData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#555" : "#eee"} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatTime} 
                stroke={isDark ? "#aaa" : "#666"}
                tick={{fontSize: 10}}
              />
              <YAxis 
                domain={[0, 100]} 
                stroke={isDark ? "#aaa" : "#666"}
                tick={{fontSize: 10}}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
              />
              <Line 
                type="monotone" 
                dataKey="hodlPercentage" 
                name="HODL %" 
                stroke="#ef4444" 
                strokeWidth={2} 
                dot={false}
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HODLSentiment;
