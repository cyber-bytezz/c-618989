
import React, { useState, useEffect } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { fetchAssets } from '../lib/api';
import { AssetData, PredictionVote } from '../types';
import { Sword, Shield, TrendingUp, TrendingDown, Users, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

const CryptoBattleArena: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [userPrediction, setUserPrediction] = useState<'bullish' | 'bearish' | null>(null);
  const [battleData, setBattleData] = useState<{[key: string]: {bullish: number, bearish: number}}>({}); 
  const [topPredictors, setTopPredictors] = useState<{userId: string, correct: number, total: number}[]>([
    { userId: 'crypto_wizard', correct: 28, total: 32 },
    { userId: 'hodl_king', correct: 24, total: 29 },
    { userId: 'satoshi_fan', correct: 21, total: 27 },
  ]);
  
  // Fetch top assets for battle
  const { data: assets } = useRealTimeData(
    ['battle-assets'],
    () => fetchAssets(5),
    { pollingInterval: 60000 }
  );
  
  // Initialize battle data with mock values
  useEffect(() => {
    if (assets?.data) {
      const initialData: {[key: string]: {bullish: number, bearish: number}} = {};
      assets.data.forEach(asset => {
        // Generate pseudo-random votes
        const bullishVotes = Math.floor(Math.random() * 120) + 50;
        const bearishVotes = Math.floor(Math.random() * 120) + 30;
        initialData[asset.id] = {
          bullish: bullishVotes,
          bearish: bearishVotes
        };
      });
      setBattleData(initialData);
      
      // Auto-select first asset if none selected
      if (!selectedAsset && assets.data.length > 0) {
        setSelectedAsset(assets.data[0].id);
      }
    }
  }, [assets?.data, selectedAsset]);
  
  const handlePrediction = (asset: string, direction: 'bullish' | 'bearish') => {
    if (userPrediction) {
      toast.error("You've already made a prediction", {
        description: "You can only vote once per day for each asset",
      });
      return;
    }
    
    // Update prediction count for the asset
    setBattleData(prev => ({
      ...prev,
      [asset]: {
        ...prev[asset],
        [direction]: prev[asset][direction] + 1
      }
    }));
    
    setUserPrediction(direction);
    
    toast.success(`You predicted ${direction} for ${assets?.data.find(a => a.id === asset)?.name}!`, {
      description: "Come back tomorrow to see if you were right",
    });
    
    // Store prediction in localStorage (in a real app, this would go to a database)
    const prediction: PredictionVote = {
      assetId: asset,
      direction,
      userId: 'current_user', // In a real app, this would be the actual user ID
      timestamp: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
    };
    
    const predictions = JSON.parse(localStorage.getItem('predictions') || '[]');
    localStorage.setItem('predictions', JSON.stringify([...predictions, prediction]));
  };
  
  // Calculate battle stats for the selected asset
  const calculateBattleStats = (assetId: string) => {
    if (!battleData[assetId]) return { bullishPercentage: 50, bearishPercentage: 50, totalVotes: 0 };
    
    const { bullish, bearish } = battleData[assetId];
    const totalVotes = bullish + bearish;
    const bullishPercentage = totalVotes > 0 ? Math.round((bullish / totalVotes) * 100) : 50;
    const bearishPercentage = totalVotes > 0 ? Math.round((bearish / totalVotes) * 100) : 50;
    
    return { bullishPercentage, bearishPercentage, totalVotes };
  };
  
  const selectedAssetData = assets?.data?.find(a => a.id === selectedAsset);
  const battleStats = selectedAsset ? calculateBattleStats(selectedAsset) : null;
  
  return (
    <div className={`neo-brutalist-sm p-4 rounded-xl battle-arena-card ${isDark ? 'dark:bg-gray-800' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Sword size={18} className="text-red-500 mr-2" />
          <h3 className="text-lg font-bold">Crypto Battle Arena</h3>
        </div>
        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
          <Users size={14} className="mr-1" />
          <span>24h prediction contest</span>
        </div>
      </div>
      
      {/* Asset selection */}
      <div className="flex overflow-x-auto pb-2 mb-4 gap-2">
        {assets?.data?.map(asset => (
          <button
            key={asset.id}
            onClick={() => setSelectedAsset(asset.id)}
            className={`px-3 py-1.5 text-sm whitespace-nowrap rounded-lg transition-all ${
              selectedAsset === asset.id 
                ? 'bg-blue-500 text-white shadow-md' 
                : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {asset.symbol}
          </button>
        ))}
      </div>
      
      {/* Battle visualization */}
      {selectedAssetData && battleStats && (
        <div className="mb-4">
          <h4 className="text-center font-semibold mb-2">
            Will {selectedAssetData.name} be up or down in 24h?
          </h4>
          
          <div className="bg-gray-200 dark:bg-gray-700 h-8 rounded-full overflow-hidden relative mb-2">
            <div 
              className="bg-green-500 h-full absolute left-0 top-0 transition-all duration-500 flex items-center justify-start pl-2"
              style={{ width: `${battleStats.bullishPercentage}%` }}
            >
              {battleStats.bullishPercentage > 15 && (
                <span className="text-xs font-semibold text-white">Bulls {battleStats.bullishPercentage}%</span>
              )}
            </div>
            <div 
              className="bg-red-500 h-full absolute right-0 top-0 transition-all duration-500 flex items-center justify-end pr-2"
              style={{ width: `${battleStats.bearishPercentage}%` }}
            >
              {battleStats.bearishPercentage > 15 && (
                <span className="text-xs font-semibold text-white">Bears {battleStats.bearishPercentage}%</span>
              )}
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mb-4">
            {battleStats.totalVotes} traders have voted
          </div>
          
          {/* Vote buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => handlePrediction(selectedAsset, 'bullish')}
              disabled={userPrediction !== null}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg ${
                userPrediction === 'bullish'
                  ? 'bg-green-100 text-green-700 border border-green-300 dark:bg-green-900/30 dark:text-green-300'
                  : userPrediction
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white hover:bg-green-50 border border-green-200 text-green-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-green-400'
              }`}
            >
              <TrendingUp size={16} />
              <span>Bullish</span>
            </button>
            
            <button
              onClick={() => handlePrediction(selectedAsset, 'bearish')}
              disabled={userPrediction !== null}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg ${
                userPrediction === 'bearish'
                  ? 'bg-red-100 text-red-700 border border-red-300 dark:bg-red-900/30 dark:text-red-300'
                  : userPrediction
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white hover:bg-red-50 border border-red-200 text-red-600 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-red-400'
              }`}
            >
              <TrendingDown size={16} />
              <span>Bearish</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Leaderboard */}
      <div>
        <div className="flex items-center mb-2">
          <Award size={14} className="text-yellow-500 mr-1" />
          <h4 className="text-sm font-semibold">Top Predictors</h4>
        </div>
        
        <div className="space-y-2">
          {topPredictors.map((predictor, index) => (
            <div key={predictor.userId} className="flex items-center justify-between text-xs">
              <div className="flex items-center">
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mr-2">
                  {index + 1}
                </span>
                <span className="font-medium">{predictor.userId}</span>
              </div>
              <div className="flex items-center">
                <span className="text-green-600 dark:text-green-400 font-bold">{Math.round((predictor.correct / predictor.total) * 100)}%</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">({predictor.correct}/{predictor.total})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CryptoBattleArena;
