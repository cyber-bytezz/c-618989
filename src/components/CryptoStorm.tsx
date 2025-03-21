
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';
import { Cloud, CloudLightning, CloudRain, CloudSun, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fetchAssets, calculateMarketSentiment } from '@/lib/api';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AssetsResponse, MarketSentiment } from '@/types';

// Types for the CryptoStorm feature
interface StormPrediction {
  id: string;
  userId: string;
  userName: string;
  createdAt: number;
  expiresAt: number;
  type: 'bullish' | 'bearish' | 'chaos';
  description: string;
  asset: string;
  targetPercentage: number;
  isResolved: boolean;
  isCorrect?: boolean;
  votes: {
    agree: number;
    disagree: number;
  };
  userVoted?: 'agree' | 'disagree' | null;
}

interface MarketEvent {
  id: string;
  timestamp: number;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  asset?: string;
  percentageChange?: number;
}

const CryptoStorm: React.FC = () => {
  const { isDark } = useTheme();
  const [stormIntensity, setStormIntensity] = useState<number>(0);
  const [marketState, setMarketState] = useState<MarketSentiment>('neutral');
  const [userPrediction, setUserPrediction] = useState<StormPrediction | null>(null);
  const [predictions, setPredictions] = useState<StormPrediction[]>([]);
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [selectedPredictionType, setSelectedPredictionType] = useState<'bullish' | 'bearish' | 'chaos'>('bullish');
  const [selectedAsset, setSelectedAsset] = useState<string>('bitcoin');
  const [predictionPercentage, setPredictionPercentage] = useState<number>(5);
  const [predictionTimeframe, setPredictionTimeframe] = useState<number>(24); // hours
  const [showPredictionForm, setShowPredictionForm] = useState<boolean>(false);
  const [predictionDescription, setPredictionDescription] = useState<string>('');
  const userName = "CryptoExplorer" + Math.floor(Math.random() * 1000);

  // Fetch real-time market data
  const { data: assetsData, isLoading } = useRealTimeData<AssetsResponse>(
    ['crypto-storm-assets'],
    () => fetchAssets(20),
    { pollingInterval: 60000 }
  );

  // Calculate storm intensity and market state based on assets data
  useEffect(() => {
    if (assetsData?.data) {
      const sentiment = calculateMarketSentiment(assetsData);
      setMarketState(sentiment);
      
      // Calculate storm intensity (0-100) based on market volatility and sentiment
      const volatilityScore = calculateVolatilityScore(assetsData);
      const sentimentScore = calculateSentimentScore(sentiment);
      const newIntensity = Math.min(100, Math.max(0, (volatilityScore + sentimentScore) / 2));
      
      setStormIntensity(newIntensity);
      
      // Generate market events based on significant price movements
      generateMarketEvents(assetsData);
    }
  }, [assetsData]);

  // Load saved predictions on mount
  useEffect(() => {
    const savedPredictions = localStorage.getItem('cryptoStormPredictions');
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions));
    }
  }, []);

  // Save predictions when they change
  useEffect(() => {
    if (predictions.length > 0) {
      localStorage.setItem('cryptoStormPredictions', JSON.stringify(predictions));
    }
  }, [predictions]);

  // Calculate volatility score based on price changes
  const calculateVolatilityScore = (data: AssetsResponse): number => {
    if (!data.data.length) return 50;
    
    const changeValues = data.data.map(asset => Math.abs(parseFloat(asset.changePercent24Hr)));
    const avgChange = changeValues.reduce((sum, val) => sum + val, 0) / changeValues.length;
    
    // Scale the average change to a 0-100 score 
    // A 5% average change would be considered quite volatile (score of ~80)
    return Math.min(100, avgChange * 16);
  };

  // Calculate sentiment score
  const calculateSentimentScore = (sentiment: MarketSentiment): number => {
    const scores: Record<MarketSentiment, number> = {
      'extreme_fear': 85,
      'fear': 70,
      'neutral': 40,
      'positive': 30,
      'greed': 65,
      'extreme_greed': 80
    };
    
    return scores[sentiment] || 50;
  };

  // Generate market events based on significant price movements
  const generateMarketEvents = (data: AssetsResponse) => {
    const newEvents: MarketEvent[] = [];
    
    data.data.forEach(asset => {
      const change = parseFloat(asset.changePercent24Hr);
      const absChange = Math.abs(change);
      
      // Only create events for significant changes (>3%)
      if (absChange > 3) {
        const impact = change > 0 ? 'positive' : 'negative';
        
        newEvents.push({
          id: `${asset.id}-${Date.now()}`,
          timestamp: Date.now(),
          description: `${asset.name} (${asset.symbol}) has ${change > 0 ? 'surged' : 'dropped'} by ${absChange.toFixed(2)}%`,
          impact,
          asset: asset.id,
          percentageChange: change
        });
      }
    });
    
    // Add new events to the existing ones, but limit to 10 most recent
    if (newEvents.length > 0) {
      setMarketEvents(prev => [...newEvents, ...prev].slice(0, 10));
    }
  };

  // Create a new storm prediction
  const createPrediction = () => {
    if (!selectedAsset || !predictionPercentage || !predictionTimeframe) {
      toast.error("Please fill in all prediction details");
      return;
    }
    
    const asset = assetsData?.data.find(a => a.id === selectedAsset);
    
    if (!asset) {
      toast.error("Asset not found");
      return;
    }
    
    const description = predictionDescription || 
      `${asset.name} will ${selectedPredictionType === 'bullish' ? 'rise' : 'fall'} by ${predictionPercentage}% within ${predictionTimeframe} hours`;
    
    const newPrediction: StormPrediction = {
      id: Date.now().toString(),
      userId: "user_" + Date.now().toString().slice(-5),
      userName,
      createdAt: Date.now(),
      expiresAt: Date.now() + (predictionTimeframe * 60 * 60 * 1000),
      type: selectedPredictionType,
      description,
      asset: selectedAsset,
      targetPercentage: predictionPercentage,
      isResolved: false,
      votes: {
        agree: 1,  // Creator automatically agrees
        disagree: 0
      },
      userVoted: 'agree'  // Creator automatically votes agree
    };
    
    setPredictions(prev => [newPrediction, ...prev]);
    setUserPrediction(newPrediction);
    setShowPredictionForm(false);
    
    // Reset form
    setPredictionDescription('');
    
    toast.success("Storm prediction created!", {
      description: "You'll be notified when your prediction resolves"
    });
    
    // Add XP for creating a prediction
    const currentXP = parseInt(localStorage.getItem('userXP') || '0');
    localStorage.setItem('userXP', (currentXP + 15).toString());
  };

  // Vote on a prediction
  const handleVote = (predictionId: string, vote: 'agree' | 'disagree') => {
    setPredictions(prev => 
      prev.map(prediction => {
        if (prediction.id !== predictionId) return prediction;
        
        // If user already voted this way, remove vote
        if (prediction.userVoted === vote) {
          const newPrediction = { ...prediction, userVoted: null };
          if (vote === 'agree') newPrediction.votes.agree--;
          else newPrediction.votes.disagree--;
          return newPrediction;
        }
        
        // If switching votes
        let newPrediction = { ...prediction, userVoted: vote };
        if (prediction.userVoted === 'agree') {
          newPrediction.votes.agree--;
          newPrediction.votes.disagree++;
        } else if (prediction.userVoted === 'disagree') {
          newPrediction.votes.agree++;
          newPrediction.votes.disagree--;
        } else {
          // First time voting
          if (vote === 'agree') newPrediction.votes.agree++;
          else newPrediction.votes.disagree++;
        }
        
        return newPrediction;
      })
    );
    
    // Add XP for voting
    const currentXP = parseInt(localStorage.getItem('userXP') || '0');
    localStorage.setItem('userXP', (currentXP + 5).toString());
    
    toast.success("Vote recorded! +5 XP");
  };

  // Render the icon for the current market state
  const renderWeatherIcon = () => {
    switch(marketState) {
      case 'extreme_fear':
        return <CloudLightning size={32} className="text-red-500" />;
      case 'fear':
        return <CloudRain size={32} className="text-red-400" />;
      case 'neutral':
        return <Cloud size={32} className="text-gray-500" />;
      case 'positive':
        return <CloudSun size={32} className="text-green-400" />;
      case 'greed':
        return <CloudSun size={32} className="text-yellow-500" />;
      case 'extreme_greed':
        return <CloudLightning size={32} className="text-yellow-600" />;
      default:
        return <Cloud size={32} className="text-gray-500" />;
    }
  };

  // Get storm intensity description
  const getStormDescription = (): string => {
    if (stormIntensity < 20) return "Calm waters";
    if (stormIntensity < 40) return "Light breeze";
    if (stormIntensity < 60) return "Moderate activity";
    if (stormIntensity < 80) return "High volatility";
    return "Extreme market storm";
  };

  // Get color based on storm intensity
  const getStormColor = (): string => {
    if (stormIntensity < 20) return "bg-blue-500";
    if (stormIntensity < 40) return "bg-green-500";
    if (stormIntensity < 60) return "bg-yellow-500";
    if (stormIntensity < 80) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className={`neo-brutalist-sm rounded-xl p-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {renderWeatherIcon()}
          <div>
            <h3 className="font-bold text-lg">CryptoStorm</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Predict market chaos events</p>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => setShowPredictionForm(!showPredictionForm)}
          className="text-sm"
        >
          {showPredictionForm ? 'Cancel' : 'Make Prediction'}
        </Button>
      </div>
      
      {/* Storm Intensity Meter */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium">Market Storm Intensity</span>
          <span className="text-sm">{stormIntensity.toFixed(0)}%</span>
        </div>
        
        <Progress 
          value={stormIntensity} 
          className="h-3"
          indicatorClassName={getStormColor()}
        />
        
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Calm</span>
          <span className="text-xs font-medium">{getStormDescription()}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Chaotic</span>
        </div>
      </div>
      
      {/* Prediction Form */}
      {showPredictionForm && (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
          <h4 className="font-medium mb-3">Create Storm Prediction</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Select Asset</label>
              <select 
                className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                value={selectedAsset}
                onChange={(e) => setSelectedAsset(e.target.value)}
              >
                {assetsData?.data.map(asset => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name} ({asset.symbol})
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Prediction Type</label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button"
                  variant={selectedPredictionType === 'bullish' ? 'default' : 'outline'}
                  className={selectedPredictionType === 'bullish' ? 'bg-green-500 hover:bg-green-600' : ''}
                  onClick={() => setSelectedPredictionType('bullish')}
                >
                  Bullish
                </Button>
                <Button 
                  type="button"
                  variant={selectedPredictionType === 'bearish' ? 'default' : 'outline'}
                  className={selectedPredictionType === 'bearish' ? 'bg-red-500 hover:bg-red-600' : ''}
                  onClick={() => setSelectedPredictionType('bearish')}
                >
                  Bearish
                </Button>
                <Button 
                  type="button"
                  variant={selectedPredictionType === 'chaos' ? 'default' : 'outline'}
                  className={selectedPredictionType === 'chaos' ? 'bg-purple-500 hover:bg-purple-600' : ''}
                  onClick={() => setSelectedPredictionType('chaos')}
                >
                  Chaos
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Target Change (%)</label>
              <input 
                type="number" 
                min="1" 
                max="50"
                value={predictionPercentage}
                onChange={(e) => setPredictionPercentage(Number(e.target.value))}
                className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Timeframe (hours)</label>
              <select 
                className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                value={predictionTimeframe}
                onChange={(e) => setPredictionTimeframe(Number(e.target.value))}
              >
                <option value={6}>6 hours</option>
                <option value={12}>12 hours</option>
                <option value={24}>24 hours</option>
                <option value={48}>48 hours</option>
                <option value={72}>3 days</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Description (optional)</label>
              <textarea 
                className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
                value={predictionDescription}
                onChange={(e) => setPredictionDescription(e.target.value)}
                placeholder="Describe your prediction..."
                rows={2}
              />
            </div>
            
            <Button 
              onClick={createPrediction}
              className="w-full"
            >
              Submit Prediction
            </Button>
          </div>
        </div>
      )}
      
      {/* Tabs for Predictions and Events */}
      <Tabs defaultValue="predictions" className="w-full">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="predictions" className="flex-1">Community Predictions</TabsTrigger>
          <TabsTrigger value="events" className="flex-1">Market Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="predictions" className="space-y-3 max-h-[300px] overflow-y-auto">
          {predictions.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No predictions yet. Be the first to predict!</p>
            </div>
          ) : (
            predictions.map(prediction => (
              <div 
                key={prediction.id}
                className={`border rounded-lg p-3 ${
                  prediction.type === 'bullish' 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                    : prediction.type === 'bearish'
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    : 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <Badge 
                      variant={
                        prediction.type === 'bullish' 
                          ? 'default' 
                          : prediction.type === 'bearish' 
                          ? 'destructive' 
                          : 'outline'
                      }
                      className={prediction.type === 'chaos' ? 'bg-purple-500' : ''}
                    >
                      {prediction.type.charAt(0).toUpperCase() + prediction.type.slice(1)}
                    </Badge>
                    <span className="text-sm ml-2">
                      {assetsData?.data.find(a => a.id === prediction.asset)?.symbol || prediction.asset}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(prediction.expiresAt).toLocaleString()}
                  </div>
                </div>
                
                <p className="text-sm mb-2">{prediction.description}</p>
                
                <div className="flex justify-between text-xs mb-3">
                  <span>By {prediction.userName}</span>
                  
                  {prediction.isResolved ? (
                    prediction.isCorrect ? (
                      <span className="flex items-center text-green-600">
                        <CheckCircle size={12} className="mr-1" />
                        Correct
                      </span>
                    ) : (
                      <span className="flex items-center text-red-600">
                        <AlertTriangle size={12} className="mr-1" />
                        Incorrect
                      </span>
                    )
                  ) : (
                    <span className="flex items-center text-yellow-600">
                      <Clock size={12} className="mr-1" />
                      {Math.ceil((prediction.expiresAt - Date.now()) / (1000 * 60 * 60))}h left
                    </span>
                  )}
                </div>
                
                {!prediction.isResolved && (
                  <div className="flex justify-between mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 mr-2 ${prediction.userVoted === 'agree' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : ''}`}
                      onClick={() => handleVote(prediction.id, 'agree')}
                    >
                      <CheckCircle size={14} className="mr-1" />
                      Agree ({prediction.votes.agree})
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className={`flex-1 ${prediction.userVoted === 'disagree' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' : ''}`}
                      onClick={() => handleVote(prediction.id, 'disagree')}
                    >
                      <AlertTriangle size={14} className="mr-1" />
                      Disagree ({prediction.votes.disagree})
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
        
        <TabsContent value="events" className="space-y-3 max-h-[300px] overflow-y-auto">
          {marketEvents.length === 0 ? (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              <p>No significant market events detected yet.</p>
            </div>
          ) : (
            marketEvents.map(event => (
              <div 
                key={event.id}
                className={`border rounded-lg p-3 ${
                  event.impact === 'positive' 
                    ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20' 
                    : event.impact === 'negative'
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20'
                }`}
              >
                <div className="flex justify-between mb-1">
                  <span className={`text-sm font-medium ${
                    event.impact === 'positive' 
                      ? 'text-green-600 dark:text-green-400' 
                      : event.impact === 'negative' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)} Event
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <p className="text-sm">{event.description}</p>
                
                {event.percentageChange && (
                  <div className={`text-sm mt-1 font-medium ${
                    event.percentageChange > 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {event.percentageChange > 0 ? '+' : ''}{event.percentageChange.toFixed(2)}%
                  </div>
                )}
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoStorm;
