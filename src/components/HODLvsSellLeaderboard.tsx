
import React, { useState, useEffect } from 'react';
import { Diamond, ArrowDownRight, Trophy, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { fetchAssets } from '../lib/api';
import { motion } from 'framer-motion';

interface AssetSentiment {
  id: string;
  name: string;
  symbol: string;
  hodlPercentage: number;
  sellPercentage: number;
  votes: number;
  userVote?: 'hodl' | 'sell' | null;
}

const HODLvsSellLeaderboard: React.FC = () => {
  const { isDark } = useTheme();
  const [assetSentiments, setAssetSentiments] = useState<AssetSentiment[]>([]);
  const [votedAssets, setVotedAssets] = useState<{[key: string]: 'hodl' | 'sell'}>({});
  
  // Fetch assets
  const { data: assetsData } = useRealTimeData(
    ['hodl-leaderboard-assets'],
    () => fetchAssets(20),
    { pollingInterval: 60000 }
  );
  
  // Initialize asset sentiments
  useEffect(() => {
    if (assetsData?.data) {
      // Load user votes from localStorage
      const savedVotes = localStorage.getItem('hodlVsSellVotes');
      const parsedVotes = savedVotes ? JSON.parse(savedVotes) : {};
      setVotedAssets(parsedVotes);
      
      // Initialize sentiment data
      const sentiments = assetsData.data.map(asset => {
        // Generate random sentiment values
        const hodlPercentage = Math.floor(Math.random() * 60) + 40; // 40-100%
        return {
          id: asset.id,
          name: asset.name,
          symbol: asset.symbol,
          hodlPercentage,
          sellPercentage: 100 - hodlPercentage,
          votes: Math.floor(Math.random() * 1000) + 500,
          userVote: parsedVotes[asset.id] || null
        };
      });
      
      setAssetSentiments(sentiments);
    }
  }, [assetsData]);
  
  // Save votes to localStorage
  useEffect(() => {
    localStorage.setItem('hodlVsSellVotes', JSON.stringify(votedAssets));
  }, [votedAssets]);
  
  const handleVote = (assetId: string, vote: 'hodl' | 'sell') => {
    // Update votes in state
    setVotedAssets(prev => {
      const newVotes = { ...prev };
      
      // Toggle vote if clicking the same option
      if (newVotes[assetId] === vote) {
        delete newVotes[assetId];
      } else {
        newVotes[assetId] = vote;
      }
      
      return newVotes;
    });
    
    // Update asset sentiments
    setAssetSentiments(prev => 
      prev.map(asset => {
        if (asset.id !== assetId) return asset;
        
        // Calculate new percentages based on the vote
        let hodlPercentage = asset.hodlPercentage;
        let sellPercentage = asset.sellPercentage;
        let votes = asset.votes;
        
        // If user already voted, first remove that vote
        if (asset.userVote) {
          if (asset.userVote === 'hodl') {
            const hodlVotes = Math.floor(asset.votes * asset.hodlPercentage / 100) - 1;
            votes -= 1;
            hodlPercentage = Math.round((hodlVotes / votes) * 100);
            sellPercentage = 100 - hodlPercentage;
          } else {
            const sellVotes = Math.floor(asset.votes * asset.sellPercentage / 100) - 1;
            votes -= 1;
            sellPercentage = Math.round((sellVotes / votes) * 100);
            hodlPercentage = 100 - sellPercentage;
          }
        }
        
        // Now add the new vote if not toggling off
        if (votedAssets[assetId] !== vote) {
          votes += 1;
          if (vote === 'hodl') {
            const hodlVotes = Math.floor(votes * hodlPercentage / 100) + 1;
            hodlPercentage = Math.round((hodlVotes / votes) * 100);
            sellPercentage = 100 - hodlPercentage;
          } else {
            const sellVotes = Math.floor(votes * sellPercentage / 100) + 1;
            sellPercentage = Math.round((sellVotes / votes) * 100);
            hodlPercentage = 100 - sellPercentage;
          }
        }
        
        // Ensure we don't go below 0% or above 100%
        hodlPercentage = Math.max(0, Math.min(100, hodlPercentage));
        sellPercentage = 100 - hodlPercentage;
        
        return {
          ...asset,
          hodlPercentage,
          sellPercentage,
          votes,
          userVote: votedAssets[assetId] === vote ? null : vote
        };
      })
    );
  };
  
  // Sort assets by HODL percentage for the leaderboard
  const topHodlAssets = [...assetSentiments]
    .sort((a, b) => b.hodlPercentage - a.hodlPercentage)
    .slice(0, 10);
  
  return (
    <motion.div 
      className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800' : 'bg-white'} p-4 rounded-xl`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Trophy size={18} className="text-yellow-500 mr-2" />
          <h3 className="text-lg font-bold">HODL vs. Sell Leaderboard</h3>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-3">
            <Diamond size={14} className="text-blue-500 mr-1" />
            <span className="text-xs font-medium">HODL</span>
          </div>
          <div className="flex items-center">
            <ArrowDownRight size={14} className="text-red-500 mr-1" />
            <span className="text-xs font-medium">Sell</span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 flex items-center">
          <Trophy size={14} className="text-yellow-500 mr-1" />
          Top 10 Most HODL'd Assets
        </h4>
        
        <div className="space-y-2">
          {topHodlAssets.map((asset, index) => (
            <div key={asset.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs mr-2">
                    {index + 1}
                  </div>
                  <div className="text-sm font-medium">{asset.name} ({asset.symbol})</div>
                  {votedAssets[asset.id] && (
                    <CheckCircle2 size={14} className="text-green-500 ml-1" />
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {asset.votes.toLocaleString()} votes
                </div>
              </div>
              
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${asset.hodlPercentage}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {asset.hodlPercentage}% HODL
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleVote(asset.id, 'hodl')}
                    className={`py-1 px-2 rounded flex items-center transition-colors ${
                      votedAssets[asset.id] === 'hodl' 
                        ? 'bg-blue-500 text-white' 
                        : 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    }`}
                  >
                    <Diamond size={12} className="mr-1" />
                    HODL
                  </button>
                  <button
                    onClick={() => handleVote(asset.id, 'sell')}
                    className={`py-1 px-2 rounded flex items-center transition-colors ${
                      votedAssets[asset.id] === 'sell' 
                        ? 'bg-red-500 text-white' 
                        : 'hover:bg-red-100 dark:hover:bg-red-900/30'
                    }`}
                  >
                    <ArrowDownRight size={12} className="mr-1" />
                    Sell
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center text-xs text-gray-500 dark:text-gray-400">
        Vote to see how your sentiment compares with other traders
      </div>
    </motion.div>
  );
};

export default HODLvsSellLeaderboard;
