
import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sparkles, Award, TrendingUp, TrendingDown, Flame, Medal, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fetchAssets } from '../lib/api';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { CryptoPrediction } from '../types';

const CryptoFortuneTeller: React.FC = () => {
  const { isDark } = useTheme();
  const [predictions, setPredictions] = useState<CryptoPrediction[]>([]);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [predictionType, setPredictionType] = useState<'rise' | 'fall'>('rise');
  const [percentChange, setPercentChange] = useState('');
  const [timeFrame, setTimeFrame] = useState('24h');
  const [activeTab, setActiveTab] = useState('make');
  const [userName, setUserName] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  
  // Fetch assets for prediction creation
  const { data: assetsData } = useRealTimeData(
    ['assets-for-fortune-teller'],
    fetchAssets,
    { 
      pollingInterval: 60000, // 1 minute
    }
  );

  // Initialize user data on component mount
  useEffect(() => {
    // Generate random username if not set
    if (!userName) {
      setUserName(`Prophet${Math.floor(Math.random() * 1000)}`);
    }
    
    // Load existing predictions from localStorage
    const savedPredictions = localStorage.getItem('cryptoPredictions');
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions));
    }
  }, []);

  // Save predictions whenever they change
  useEffect(() => {
    if (predictions.length > 0) {
      localStorage.setItem('cryptoPredictions', JSON.stringify(predictions));
    }
  }, [predictions]);

  // Form validation
  useEffect(() => {
    const isValid = 
      selectedCoin !== '' && 
      percentChange !== '' && 
      !isNaN(parseFloat(percentChange)) && 
      parseFloat(percentChange) > 0;
    
    setIsFormValid(isValid);
  }, [selectedCoin, percentChange]);

  // Check if predictions have been fulfilled
  useEffect(() => {
    if (!assetsData?.data || predictions.length === 0) return;
    
    const now = Date.now();
    let updatedPredictions = false;
    
    const newPredictions = predictions.map(prediction => {
      // Skip if already resolved
      if (prediction.isResolved) return prediction;
      
      // Check if deadline passed
      if (now > prediction.deadline) {
        const asset = assetsData.data.find(a => a.id === prediction.coinId);
        if (!asset) return prediction;
        
        const currentPrice = parseFloat(asset.priceUsd);
        const startPrice = prediction.startPrice;
        const actualPercentChange = ((currentPrice - startPrice) / startPrice) * 100;
        
        // Determine if prediction was correct
        const predictedRise = prediction.direction === 'rise';
        const actualRise = actualPercentChange > 0;
        const isCorrect = predictedRise === actualRise && 
                          Math.abs(actualPercentChange) >= prediction.percentChange;
        
        // Award XP if correct
        if (isCorrect && prediction.userName === userName) {
          const currentXP = parseInt(localStorage.getItem('userXP') || '0');
          localStorage.setItem('userXP', (currentXP + 50).toString());
          
          toast.success("Your prediction was correct! +50 XP", {
            description: `${prediction.coinName} ${predictedRise ? 'rose' : 'fell'} as you predicted!`,
          });
        }
        
        updatedPredictions = true;
        return { 
          ...prediction, 
          isResolved: true, 
          isCorrect,
          actualPercentChange 
        };
      }
      
      return prediction;
    });
    
    if (updatedPredictions) {
      setPredictions(newPredictions);
    }
  }, [assetsData, predictions, userName]);

  // Create a new prediction
  const handleCreatePrediction = () => {
    if (!isFormValid || !assetsData) return;
    
    const selectedAsset = assetsData.data.find(a => a.id === selectedCoin);
    if (!selectedAsset) return;
    
    const parsedPercentChange = parseFloat(percentChange);
    const startPrice = parseFloat(selectedAsset.priceUsd);
    
    // Calculate deadline based on timeframe
    let deadline: number;
    switch (timeFrame) {
      case '1h':
        deadline = Date.now() + (60 * 60 * 1000);
        break;
      case '12h':
        deadline = Date.now() + (12 * 60 * 60 * 1000);
        break;
      case '7d':
        deadline = Date.now() + (7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        deadline = Date.now() + (30 * 24 * 60 * 60 * 1000);
        break;
      case '24h':
      default:
        deadline = Date.now() + (24 * 60 * 60 * 1000);
    }
    
    const newPrediction: CryptoPrediction = {
      id: `pred-${Date.now()}`,
      coinId: selectedAsset.id,
      coinName: selectedAsset.name,
      coinSymbol: selectedAsset.symbol,
      direction: predictionType,
      percentChange: parsedPercentChange,
      timeFrame,
      startPrice,
      predictedAt: Date.now(),
      deadline,
      userName,
      likes: 0,
      isResolved: false,
      userHasLiked: false
    };
    
    setPredictions(prev => [newPrediction, ...prev]);
    
    // Reset form
    setSelectedCoin('');
    setPercentChange('');
    setPredictionType('rise');
    setTimeFrame('24h');
    
    // Award XP for creating prediction
    const currentXP = parseInt(localStorage.getItem('userXP') || '0');
    localStorage.setItem('userXP', (currentXP + 10).toString());
    
    toast.success("Prediction created! +10 XP", {
      description: `Your prediction for ${selectedAsset.name} has been recorded`
    });
    
    setActiveTab('active');
  };

  // Like a prediction
  const handleLikePrediction = (id: string) => {
    setPredictions(prev => 
      prev.map(prediction => {
        if (prediction.id !== id) return prediction;
        
        // Toggle like
        const userHasLiked = !prediction.userHasLiked;
        const likes = userHasLiked ? prediction.likes + 1 : prediction.likes - 1;
        
        return { ...prediction, likes, userHasLiked };
      })
    );
  };

  // Get the predicted target price
  const getTargetPrice = (prediction: CryptoPrediction) => {
    const { startPrice, percentChange, direction } = prediction;
    const multiplier = direction === 'rise' ? 1 + (percentChange / 100) : 1 - (percentChange / 100);
    return startPrice * multiplier;
  };

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Calculate accuracy percentage
  const calculateAccuracy = () => {
    const resolvedPredictions = predictions.filter(p => p.isResolved);
    if (resolvedPredictions.length === 0) return 0;
    
    const correctPredictions = resolvedPredictions.filter(p => p.isCorrect);
    return Math.round((correctPredictions.length / resolvedPredictions.length) * 100);
  };

  // Get leaderboard data
  const getLeaderboard = () => {
    const userStats = new Map<string, { correct: number; total: number }>();
    
    // Collect stats for each user
    predictions.filter(p => p.isResolved).forEach(prediction => {
      const userStat = userStats.get(prediction.userName) || { correct: 0, total: 0 };
      userStats.set(prediction.userName, {
        correct: userStat.correct + (prediction.isCorrect ? 1 : 0),
        total: userStat.total + 1
      });
    });
    
    // Convert to array and sort by accuracy
    return Array.from(userStats.entries())
      .map(([name, stats]) => ({
        name,
        correct: stats.correct,
        total: stats.total,
        accuracy: Math.round((stats.correct / stats.total) * 100)
      }))
      .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total)
      .slice(0, 5); // Top 5 users
  };

  // Calculate confidence score for a coin
  const getConfidenceScore = (coinId: string) => {
    const coinPredictions = predictions.filter(p => p.coinId === coinId && !p.isResolved);
    if (coinPredictions.length < 3) return null; // Need at least 3 predictions
    
    const risePredictions = coinPredictions.filter(p => p.direction === 'rise').length;
    const confidencePercent = Math.round((risePredictions / coinPredictions.length) * 100);
    
    return {
      score: confidencePercent,
      direction: confidencePercent > 50 ? 'rise' : 'fall'
    };
  };

  return (
    <Card className={`neo-brutalist ${isDark ? 'dark:bg-gray-800' : 'bg-white'} overflow-hidden border-t-4 ${isDark ? 'border-indigo-500' : 'border-indigo-600'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            Crypto Fortune Teller
          </CardTitle>
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
            <span className="font-mono">@{userName}</span>
            {predictions.some(p => p.isResolved && p.isCorrect && p.userName === userName) && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 p-1 rounded-full"
              >
                <Award className="h-3.5 w-3.5" />
              </motion.div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4">
        <Tabs defaultValue="make" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="make">Make Prediction</TabsTrigger>
            <TabsTrigger value="active">Active Predictions</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>
          
          {/* Make Prediction Tab */}
          <TabsContent value="make" className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Select Cryptocurrency</label>
                <select 
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                >
                  <option value="">Choose a coin</option>
                  {assetsData?.data.slice(0, 20).map(asset => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.symbol})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Prediction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => setPredictionType('rise')}
                    variant={predictionType === 'rise' ? 'default' : 'outline'}
                    className={`flex items-center justify-center gap-1 ${
                      predictionType === 'rise' ? 'bg-green-600 hover:bg-green-700' : ''
                    }`}
                  >
                    <TrendingUp className="h-4 w-4" />
                    Will Rise
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={() => setPredictionType('fall')}
                    variant={predictionType === 'fall' ? 'default' : 'outline'}
                    className={`flex items-center justify-center gap-1 ${
                      predictionType === 'fall' ? 'bg-red-600 hover:bg-red-700' : ''
                    }`}
                  >
                    <TrendingDown className="h-4 w-4" />
                    Will Fall
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Percent Change (Min: 1%)</label>
                <Input
                  type="number"
                  min="1"
                  step="0.1"
                  value={percentChange}
                  onChange={(e) => setPercentChange(e.target.value)}
                  placeholder="e.g., 5.5"
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Time Frame</label>
                <select
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value)}
                >
                  <option value="1h">1 Hour</option>
                  <option value="12h">12 Hours</option>
                  <option value="24h">24 Hours</option>
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>
              
              <Button
                onClick={handleCreatePrediction}
                disabled={!isFormValid}
                className="w-full mt-2"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Create Prediction
              </Button>
            </div>
          </TabsContent>
          
          {/* Active Predictions Tab */}
          <TabsContent value="active">
            <div className="space-y-4">
              {predictions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <p>No predictions yet. Be the first to predict market movements!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {predictions.map((prediction) => {
                    const targetPrice = getTargetPrice(prediction);
                    const confidence = getConfidenceScore(prediction.coinId);
                    
                    return (
                      <motion.div
                        key={prediction.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border p-3 rounded-lg ${
                          prediction.isResolved
                            ? prediction.isCorrect
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <div className="flex items-center">
                            <span className="font-medium">{prediction.coinName}</span>
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1.5 ml-1">
                              {prediction.coinSymbol}
                            </span>
                          </div>
                          
                          {prediction.isResolved ? (
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              prediction.isCorrect
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                            }`}>
                              {prediction.isCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                            </span>
                          ) : (
                            <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded">
                              Ends: {new Date(prediction.deadline).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm space-y-1 mt-1">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">
                              Will {prediction.direction === 'rise' ? 'rise' : 'fall'} by at least {prediction.percentChange}%
                            </span>
                          </div>
                          
                          <div className="flex justify-between text-xs">
                            <span>
                              From ${prediction.startPrice.toFixed(2)} to  
                              <span className={`font-medium ${
                                prediction.direction === 'rise' 
                                  ? 'text-green-600 dark:text-green-400' 
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {' '}${targetPrice.toFixed(2)}
                              </span>
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                              {prediction.timeFrame} timeframe
                            </span>
                          </div>
                          
                          {confidence && !prediction.isResolved && (
                            <div className="mt-1 text-xs bg-gray-100 dark:bg-gray-800 p-1.5 rounded flex items-center justify-between">
                              <span>Community Confidence:</span>
                              <span className={`font-medium ${
                                confidence.direction === 'rise'
                                  ? 'text-green-600 dark:text-green-400'
                                  : 'text-red-600 dark:text-red-400'
                              }`}>
                                {confidence.score}% {confidence.direction === 'rise' ? 'Bullish' : 'Bearish'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            By {prediction.userName}
                          </span>
                          
                          {!prediction.isResolved && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePrediction(prediction.id)}
                              className={`text-xs ${
                                prediction.userHasLiked 
                                  ? 'text-indigo-600 dark:text-indigo-400' 
                                  : 'text-gray-500 dark:text-gray-400'
                              }`}
                            >
                              <Flame className="h-3.5 w-3.5 mr-1" />
                              <span>{prediction.likes}</span>
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg text-center">
                  <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {predictions.filter(p => p.isResolved).length}
                  </div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-300">
                    Total Predictions
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-center">
                  <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                    {calculateAccuracy()}%
                  </div>
                  <div className="text-xs text-amber-700 dark:text-amber-300">
                    Average Accuracy
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <Crown className="h-4 w-4 mr-1 text-amber-500" />
                  Top Predictors
                </h3>
                
                {getLeaderboard().length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Prophet</TableHead>
                        <TableHead className="text-right">Accuracy</TableHead>
                        <TableHead className="text-right">Predictions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getLeaderboard().map((user, index) => (
                        <TableRow key={user.name}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              {index === 0 && <Medal className="h-4 w-4 mr-1 text-amber-500" />}
                              {index === 1 && <Medal className="h-4 w-4 mr-1 text-gray-400" />}
                              {index === 2 && <Medal className="h-4 w-4 mr-1 text-amber-700" />}
                              {index > 2 && `#${index + 1}`}
                            </div>
                          </TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell className="text-right font-mono">
                            {user.accuracy}%
                          </TableCell>
                          <TableCell className="text-right">{user.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>No resolved predictions yet to build a leaderboard.</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default CryptoFortuneTeller;
