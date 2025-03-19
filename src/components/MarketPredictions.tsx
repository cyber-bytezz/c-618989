
import { useState, useEffect } from 'react';
import { Check, X, BarChart4, ChevronsUp, ChevronsDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AssetData } from '../types';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { fetchAssets } from '../lib/api';

interface Prediction {
  id: string;
  assetId: string;
  assetName: string;
  symbol: string;
  targetPrice: number;
  currentPrice: number;
  direction: 'up' | 'down';
  deadline: number;
  createdAt: number;
  createdBy: string; // User ID or name
  agreeVotes: number;
  disagreeVotes: number;
  userVote: 'agree' | 'disagree' | null;
  resolved: boolean;
  wasCorrect?: boolean;
}

const MOCK_USER_NAME = "CryptoTrader" + Math.floor(Math.random() * 1000);

const MarketPredictions = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [predictionDirection, setPredictionDirection] = useState<'up' | 'down'>('up');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [predictionDays, setPredictionDays] = useState<number>(7);
  const { isDark } = useTheme();
  
  // Fetch assets for prediction creation
  const { data: assetsData } = useRealTimeData(
    ['assets-for-predictions'],
    fetchAssets,
    { 
      pollingInterval: 300000, // 5 minutes
    }
  );
  
  // Load predictions from localStorage
  useEffect(() => {
    const savedPredictions = localStorage.getItem('marketPredictions');
    if (savedPredictions) {
      setPredictions(JSON.parse(savedPredictions));
    }
  }, []);
  
  // Save predictions to localStorage whenever they change
  useEffect(() => {
    if (predictions.length > 0) {
      localStorage.setItem('marketPredictions', JSON.stringify(predictions));
    }
  }, [predictions]);
  
  // Check if any predictions have been resolved
  useEffect(() => {
    if (!assetsData?.data || predictions.length === 0) return;
    
    const now = Date.now();
    let updated = false;
    
    const updatedPredictions = predictions.map(prediction => {
      // Skip if already resolved
      if (prediction.resolved) return prediction;
      
      // Check if deadline passed
      if (now > prediction.deadline) {
        // Find the current price of the asset
        const asset = assetsData.data.find(a => a.id === prediction.assetId);
        if (!asset) return prediction;
        
        const currentPrice = parseFloat(asset.priceUsd);
        const wasCorrect = prediction.direction === 'up' 
          ? currentPrice >= prediction.targetPrice
          : currentPrice <= prediction.targetPrice;
        
        // Reward XP if prediction was correct
        if (wasCorrect && prediction.createdBy === MOCK_USER_NAME) {
          const currentXP = parseInt(localStorage.getItem('userXP') || '0');
          localStorage.setItem('userXP', (currentXP + 50).toString());
          
          toast.success("Your prediction was correct! +50 XP", {
            description: `${prediction.assetName} ${prediction.direction === 'up' ? 'reached' : 'fell to'} your target of $${prediction.targetPrice}`,
          });
        }
        
        updated = true;
        return { 
          ...prediction, 
          resolved: true, 
          wasCorrect,
          currentPrice
        };
      }
      
      return prediction;
    });
    
    if (updated) {
      setPredictions(updatedPredictions);
    }
  }, [assetsData, predictions]);
  
  // Create a new prediction
  const handleCreatePrediction = () => {
    if (!selectedAsset || !targetPrice) return;
    
    const targetPriceValue = parseFloat(targetPrice);
    if (isNaN(targetPriceValue)) return;
    
    const currentPrice = parseFloat(selectedAsset.priceUsd);
    const deadline = Date.now() + (predictionDays * 24 * 60 * 60 * 1000);
    
    const newPrediction: Prediction = {
      id: Date.now().toString(),
      assetId: selectedAsset.id,
      assetName: selectedAsset.name,
      symbol: selectedAsset.symbol,
      targetPrice: targetPriceValue,
      currentPrice,
      direction: predictionDirection,
      deadline,
      createdAt: Date.now(),
      createdBy: MOCK_USER_NAME,
      agreeVotes: 1, // Creator automatically agrees
      disagreeVotes: 0,
      userVote: 'agree', // Creator automatically votes agree
      resolved: false
    };
    
    setPredictions(prev => [newPrediction, ...prev]);
    setShowCreateForm(false);
    setSelectedAsset(null);
    setTargetPrice('');
    setPredictionDirection('up');
    setPredictionDays(7);
    
    // Award XP for creating prediction
    const currentXP = parseInt(localStorage.getItem('userXP') || '0');
    localStorage.setItem('userXP', (currentXP + 10).toString());
    
    toast.success("Prediction created! +10 XP", {
      description: `Your prediction for ${selectedAsset.name} has been added`
    });
  };
  
  // Vote on a prediction
  const handleVote = (predictionId: string, vote: 'agree' | 'disagree') => {
    setPredictions(prev => 
      prev.map(prediction => {
        if (prediction.id !== predictionId) return prediction;
        
        // If user already voted this way, remove vote
        if (prediction.userVote === vote) {
          const newPrediction = { ...prediction, userVote: null };
          if (vote === 'agree') newPrediction.agreeVotes--;
          else newPrediction.disagreeVotes--;
          return newPrediction;
        }
        
        // If switching votes
        let newPrediction = { ...prediction, userVote: vote };
        if (prediction.userVote === 'agree') {
          newPrediction.agreeVotes--;
          newPrediction.disagreeVotes++;
        } else if (prediction.userVote === 'disagree') {
          newPrediction.agreeVotes++;
          newPrediction.disagreeVotes--;
        } else {
          // First time voting
          if (vote === 'agree') newPrediction.agreeVotes++;
          else newPrediction.disagreeVotes++;
        }
        
        return newPrediction;
      })
    );
    
    // Award XP for voting
    const currentXP = parseInt(localStorage.getItem('userXP') || '0');
    localStorage.setItem('userXP', (currentXP + 5).toString());
  };
  
  return (
    <div className={`neo-brutalist ${isDark ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'} p-4 rounded-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart4 size={20} className="text-neo-accent" />
          <h3 className="text-lg font-bold">Market Predictions</h3>
        </div>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-3 py-1 bg-neo-accent text-white rounded-lg text-sm"
        >
          {showCreateForm ? 'Cancel' : 'New Prediction'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Create New Prediction</h4>
          
          <div className="mb-3">
            <label className="block text-xs mb-1">Select Asset</label>
            <select 
              className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              value={selectedAsset?.id || ''}
              onChange={(e) => {
                const asset = assetsData?.data.find(a => a.id === e.target.value);
                setSelectedAsset(asset || null);
              }}
            >
              <option value="">Select an asset</option>
              {assetsData?.data.slice(0, 20).map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.name} ({asset.symbol})
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-xs mb-1">Prediction Type</label>
            <div className="flex gap-2">
              <button
                onClick={() => setPredictionDirection('up')}
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-sm ${
                  predictionDirection === 'up' 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <ChevronsUp size={16} />
                <span>Will Rise</span>
              </button>
              
              <button
                onClick={() => setPredictionDirection('down')}
                className={`flex-1 py-1.5 rounded flex items-center justify-center gap-1 text-sm ${
                  predictionDirection === 'down' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <ChevronsDown size={16} />
                <span>Will Fall</span>
              </button>
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-xs mb-1">Target Price (USD)</label>
            <input
              type="number"
              step="0.01"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
              placeholder="Enter target price"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-xs mb-1">Time Frame</label>
            <select
              value={predictionDays}
              onChange={(e) => setPredictionDays(parseInt(e.target.value))}
              className="w-full p-2 rounded border dark:bg-gray-800 dark:border-gray-600"
            >
              <option value={1}>1 day</option>
              <option value={3}>3 days</option>
              <option value={7}>7 days</option>
              <option value={14}>14 days</option>
              <option value={30}>30 days</option>
            </select>
          </div>
          
          <button
            onClick={handleCreatePrediction}
            disabled={!selectedAsset || !targetPrice}
            className="w-full py-2 bg-neo-accent text-white rounded disabled:opacity-50"
          >
            Create Prediction
          </button>
        </div>
      )}
      
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {predictions.length === 0 ? (
          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
            <p>No predictions yet. Create the first one!</p>
          </div>
        ) : (
          predictions.map(prediction => (
            <div 
              key={prediction.id} 
              className={`border p-3 rounded-lg ${
                prediction.resolved
                  ? prediction.wasCorrect 
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{prediction.assetName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    ({prediction.symbol})
                  </span>
                </div>
                
                {prediction.resolved ? (
                  <Badge variant={prediction.wasCorrect ? "default" : "destructive"}>
                    {prediction.wasCorrect ? 'Correct ✓' : 'Incorrect ✗'}
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    {Math.ceil((prediction.deadline - Date.now()) / (1000 * 60 * 60 * 24))} days left
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm mb-3">
                <span className="text-gray-600 dark:text-gray-300">
                  Will {prediction.direction === 'up' ? 'rise to' : 'fall to'}
                </span>
                <span className="font-mono font-medium">
                  ${prediction.targetPrice.toFixed(2)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  from ${prediction.currentPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
                <div>By {prediction.createdBy}</div>
                <div>
                  {new Date(prediction.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              {!prediction.resolved && (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleVote(prediction.id, 'agree')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors ${
                      prediction.userVote === 'agree'
                        ? 'bg-green-500 text-white'
                        : isDark
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <Check size={14} />
                    <span>Agree</span>
                    <span className="ml-1 opacity-80">({prediction.agreeVotes})</span>
                  </button>
                  
                  <button
                    onClick={() => handleVote(prediction.id, 'disagree')}
                    className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm transition-colors ${
                      prediction.userVote === 'disagree'
                        ? 'bg-red-500 text-white'
                        : isDark
                          ? 'bg-gray-700 hover:bg-gray-600'
                          : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <X size={14} />
                    <span>Disagree</span>
                    <span className="ml-1 opacity-80">({prediction.disagreeVotes})</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MarketPredictions;
