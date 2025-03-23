
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ThumbsUp, 
  ThumbsDown, 
  BarChart4, 
  AlertTriangle, 
  Award
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetData, TimeFrame } from '@/types';
import { formatPrice, formatPercent } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

interface Prediction {
  assetId: string;
  symbol: string;
  name: string;
  direction: 'up' | 'down' | 'sideways';
  confidence: number;
  expectedChange: number;
  timeframe: TimeFrame;
  reasoning: string;
  createdAt: number;
  expiresAt: number;
  communityAgreement: number; // -100 to 100 (disagree to agree)
  votes: {
    agree: number;
    disagree: number;
  };
  userVote?: 'agree' | 'disagree';
  hasExpired?: boolean;
  wasCorrect?: boolean;
}

interface AICryptoPredictionsProps {
  assets?: AssetData[];
}

const AICryptoPredictions = ({ assets = [] }: AICryptoPredictionsProps) => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [userGenerated, setUserGenerated] = useState<Prediction[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'community'>('ai');
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('d1');

  // Generate mock predictions based on available assets
  useEffect(() => {
    if (assets.length > 0) {
      setIsLoading(true);
      
      // Simulate API delay
      setTimeout(() => {
        const mockPredictions = generateMockPredictions(assets);
        setPredictions(mockPredictions);
        
        const mockUserPredictions = generateMockUserPredictions(assets);
        setUserGenerated(mockUserPredictions);
        
        setIsLoading(false);
      }, 1500);
    }
  }, [assets]);

  // Generate AI predictions
  const generateMockPredictions = (assets: AssetData[]): Prediction[] => {
    // Select a random subset of assets for predictions
    const selectedAssets = [...assets]
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
    
    return selectedAssets.map(asset => {
      const now = Date.now();
      const direction = Math.random() > 0.5 ? 'up' : 'down';
      const confidence = 50 + Math.floor(Math.random() * 40);
      const expectedChange = direction === 'up' 
        ? 1 + Math.random() * 15 
        : -(1 + Math.random() * 10);
      
      // Random timeframe
      const timeframes: TimeFrame[] = ['h1', 'h12', 'd1', 'w1', 'm1'];
      const timeframe = timeframes[Math.floor(Math.random() * timeframes.length)];
      
      // Expiry based on timeframe
      let expiryTime = now;
      switch(timeframe) {
        case 'h1': expiryTime += 60 * 60 * 1000; break;
        case 'h12': expiryTime += 12 * 60 * 60 * 1000; break;
        case 'd1': expiryTime += 24 * 60 * 60 * 1000; break;
        case 'w1': expiryTime += 7 * 24 * 60 * 60 * 1000; break;
        case 'm1': expiryTime += 30 * 24 * 60 * 60 * 1000; break;
      }
      
      return {
        assetId: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        direction: direction,
        confidence,
        expectedChange,
        timeframe,
        reasoning: generateReasoning(asset, direction, expectedChange, timeframe),
        createdAt: now,
        expiresAt: expiryTime,
        communityAgreement: -25 + Math.floor(Math.random() * 125), // -25 to 100
        votes: {
          agree: Math.floor(Math.random() * 120),
          disagree: Math.floor(Math.random() * 40)
        },
        hasExpired: Math.random() > 0.8, // Some are expired for demo
        wasCorrect: Math.random() > 0.3 // Most AI predictions are correct for demo
      };
    });
  };
  
  // Generate mock user predictions
  const generateMockUserPredictions = (assets: AssetData[]): Prediction[] => {
    const selectedAssets = [...assets]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    return selectedAssets.map(asset => {
      const now = Date.now();
      const direction = Math.random() > 0.4 ? 'up' : 'down';
      const confidence = 40 + Math.floor(Math.random() * 40);
      const expectedChange = direction === 'up' 
        ? 2 + Math.random() * 20 
        : -(2 + Math.random() * 15);
      
      const timeframe: TimeFrame = 'd1';
      const expiryTime = now + 24 * 60 * 60 * 1000;
      
      return {
        assetId: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        direction: direction,
        confidence,
        expectedChange,
        timeframe,
        reasoning: `Community prediction based on technical analysis and market sentiment.`,
        createdAt: now - Math.floor(Math.random() * 12 * 60 * 60 * 1000),
        expiresAt: expiryTime,
        communityAgreement: -15 + Math.floor(Math.random() * 100), // -15 to 85
        votes: {
          agree: Math.floor(Math.random() * 50),
          disagree: Math.floor(Math.random() * 20)
        },
        hasExpired: Math.random() > 0.7,
        wasCorrect: Math.random() > 0.5
      };
    });
  };
  
  // Generate reasoning for AI predictions
  const generateReasoning = (
    asset: AssetData, 
    direction: 'up' | 'down', 
    expectedChange: number,
    timeframe: TimeFrame
  ): string => {
    const reasons = [
      `Based on ${timeframeText(timeframe)} trading patterns and market volume`,
      `Analyzing historical support/resistance levels and ${timeframeText(timeframe)} movement`,
      `Considering recent news events and ${timeframeText(timeframe)} market sentiment`,
      `Evaluating on-chain metrics and ${timeframeText(timeframe)} holder behavior`,
      `Examining correlation with market leaders and ${timeframeText(timeframe)} momentum`
    ];
    
    return reasons[Math.floor(Math.random() * reasons.length)];
  };
  
  const timeframeText = (timeframe: TimeFrame): string => {
    switch(timeframe) {
      case 'h1': return '1-hour';
      case 'h12': return '12-hour';
      case 'd1': return 'daily';
      case 'w1': return 'weekly';
      case 'm1': return 'monthly';
    }
  };
  
  // Vote on a prediction
  const handleVote = (predictionIndex: number, vote: 'agree' | 'disagree') => {
    // Clone predictions array
    const updatedPredictions = [...predictions];
    const prediction = updatedPredictions[predictionIndex];
    
    // If user already voted, remove previous vote
    if (prediction.userVote) {
      prediction.votes[prediction.userVote]--;
    }
    
    // Add new vote
    prediction.votes[vote]++;
    prediction.userVote = vote;
    
    // Recalculate community agreement
    const totalVotes = prediction.votes.agree + prediction.votes.disagree;
    prediction.communityAgreement = totalVotes > 0 
      ? ((prediction.votes.agree - prediction.votes.disagree) / totalVotes) * 100
      : 0;
    
    setPredictions(updatedPredictions);
    
    // Show toast
    toast.success(`You ${vote === 'agree' ? 'agreed' : 'disagreed'} with the prediction for ${prediction.symbol}`);
  };
  
  // Filter predictions by timeframe
  const filteredPredictions = activeTab === 'ai'
    ? predictions.filter(p => selectedTimeframe === 'all' || p.timeframe === selectedTimeframe)
    : userGenerated.filter(p => selectedTimeframe === 'all' || p.timeframe === selectedTimeframe);
  
  // Calculate AI accuracy
  const calculateAccuracy = (): number => {
    const expiredPredictions = predictions.filter(p => p.hasExpired);
    if (expiredPredictions.length === 0) return 0;
    
    const correctPredictions = expiredPredictions.filter(p => p.wasCorrect);
    return (correctPredictions.length / expiredPredictions.length) * 100;
  };
  
  const accuracy = calculateAccuracy();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">AI Crypto Predictions</CardTitle>
          </div>
          <Badge variant="outline" className="px-2 py-1">
            {accuracy.toFixed(0)}% Accuracy
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <Button 
              variant={activeTab === 'ai' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('ai')}
              className="h-8"
            >
              <Brain className="h-4 w-4 mr-1" />
              AI Predictions
            </Button>
            <Button 
              variant={activeTab === 'community' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setActiveTab('community')}
              className="h-8"
            >
              <Award className="h-4 w-4 mr-1" />
              Community
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Timeframe:</span>
            <select 
              className="text-xs bg-background border rounded px-2 py-1"
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as TimeFrame)}
            >
              <option value="all">All</option>
              <option value="h1">1h</option>
              <option value="h12">12h</option>
              <option value="d1">24h</option>
              <option value="w1">1w</option>
              <option value="m1">1m</option>
            </select>
          </div>
        </div>
      
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : filteredPredictions.length > 0 ? (
          <div className="space-y-3">
            {filteredPredictions.map((prediction, index) => (
              <div 
                key={index} 
                className={`border rounded-lg p-3 ${
                  prediction.hasExpired 
                    ? prediction.wasCorrect
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-800/30'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-800/30'
                    : 'bg-background'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        prediction.direction === 'up' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                      }`}
                    >
                      {prediction.direction === 'up' 
                        ? <TrendingUp className="h-5 w-5" /> 
                        : <TrendingDown className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium">{prediction.symbol}</div>
                      <div className="text-xs text-gray-500">{prediction.name}</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`font-bold ${
                      prediction.direction === 'up' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {prediction.direction === 'up' ? '+' : ''}{prediction.expectedChange.toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {timeframeText(prediction.timeframe)} forecast
                    </div>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs">Confidence</span>
                    <span className="text-xs font-medium">{prediction.confidence}%</span>
                  </div>
                  <Progress value={prediction.confidence} className="h-1.5" />
                </div>
                
                <div className="mt-2">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {prediction.reasoning}
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="mr-2 text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {prediction.hasExpired 
                        ? 'Completed' 
                        : formatTimeLeft(prediction.expiresAt)}
                    </Badge>
                    
                    {prediction.hasExpired && (
                      <Badge 
                        variant={prediction.wasCorrect ? 'default' : 'destructive'} 
                        className="text-xs"
                      >
                        {prediction.wasCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    )}
                  </div>
                  
                  {!prediction.hasExpired && !prediction.userVote && (
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => handleVote(index, 'agree')}
                      >
                        <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">{prediction.votes.agree}</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 px-2"
                        onClick={() => handleVote(index, 'disagree')}
                      >
                        <ThumbsDown className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">{prediction.votes.disagree}</span>
                      </Button>
                    </div>
                  )}
                  
                  {prediction.userVote && (
                    <div className="text-xs text-gray-500">
                      You {prediction.userVote === 'agree' ? 'agreed' : 'disagreed'} with this prediction
                    </div>
                  )}
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Community sentiment</span>
                    <span>{prediction.communityAgreement.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getAgreementColor(prediction.communityAgreement)}`} 
                      style={{ width: `${Math.max(0, prediction.communityAgreement)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
            
            {activeTab === 'community' && (
              <Button 
                className="w-full mt-4"
                variant="outline"
                onClick={() => toast.info("Create prediction feature coming soon!")}
              >
                Create Your Own Prediction
              </Button>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <AlertTriangle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              No predictions found for the selected timeframe
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setSelectedTimeframe('all')}
            >
              View All Timeframes
            </Button>
          </div>
        )}
        
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-4">
          <AlertTriangle className="h-3 w-3 mr-1" />
          AI predictions are for informational purposes only. Not financial advice.
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to format time left
const formatTimeLeft = (timestamp: number): string => {
  const now = Date.now();
  const timeLeft = timestamp - now;
  
  if (timeLeft <= 0) return 'Expired';
  
  const minutes = Math.floor(timeLeft / (60 * 1000));
  const hours = Math.floor(timeLeft / (60 * 60 * 1000));
  const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
  
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h left`;
  return `${minutes}m left`;
};

// Helper function to get agreement color
const getAgreementColor = (agreement: number): string => {
  if (agreement > 66) return 'bg-green-500';
  if (agreement > 33) return 'bg-yellow-500';
  if (agreement > 0) return 'bg-orange-400';
  return 'bg-red-500';
};

export default AICryptoPredictions;
