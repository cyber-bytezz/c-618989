import { useState, useEffect } from 'react';
import { 
  Bot, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Eye, 
  PieChart, 
  BarChart, 
  Brain, 
  Sliders, 
  ArrowUpRight,
  ArrowDownRight,
  Pause,
  History
} from 'lucide-react';
import { 
  AssetData,
  TradeAction,
  TradeSuggestion,
  RiskTolerance,
  AIAdvisorSettings,
  TimeFrame
} from '@/types';
import { fetchAssetHistory, calculateVolatility, formatPrice } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface AIAdvisorProps {
  asset: AssetData;
}

const AIAdvisor = ({ asset }: AIAdvisorProps) => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [tradeSuggestion, setTradeSuggestion] = useState<TradeSuggestion | null>(null);
  const [settings, setSettings] = useState<AIAdvisorSettings>({
    riskTolerance: 'moderate',
    notificationsEnabled: true,
    preferredTimeFrame: 'd1',
    prioritizeVolume: false,
    considerMarketSentiment: true,
    trackPerformance: true,
  });
  const [historicalSuggestions, setHistoricalSuggestions] = useState<TradeSuggestion[]>([]);
  const [volatility, setVolatility] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // Generate a suggestion based on asset data and settings
  useEffect(() => {
    const generateSuggestion = async () => {
      if (!asset) return;
      
      setIsLoading(true);
      
      try {
        // Get historical data to calculate volatility
        const timeFrames: TimeFrame[] = ['h1', 'd1', 'w1'];
        const historyPromises = timeFrames.map(tf => 
          fetchAssetHistory(asset.id, tf)
        );
        
        const historyResults = await Promise.all(historyPromises);
        const dailyHistory = historyResults[1]; // d1 data
        
        if (dailyHistory.data.length > 0) {
          const assetVolatility = calculateVolatility(dailyHistory.data);
          setVolatility(assetVolatility);
          
          // Generate AI suggestion based on historical data
          const suggestion = generateAISuggestion(asset, assetVolatility, settings);
          setTradeSuggestion(suggestion);
          
          // Add to historical suggestions
          setHistoricalSuggestions(prev => {
            // Keep only last 5 suggestions
            const updated = [suggestion, ...prev].slice(0, 5);
            return updated;
          });
        }
      } catch (error) {
        console.error("Error generating AI suggestion:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    generateSuggestion();
    
    // Set up an interval to refresh the suggestion
    const interval = setInterval(() => {
      generateSuggestion();
    }, 120000); // Update every 2 minutes
    
    return () => clearInterval(interval);
  }, [asset?.id, settings]);
  
  // Change risk tolerance
  const handleRiskToleranceChange = (value: RiskTolerance) => {
    setSettings(prev => ({ ...prev, riskTolerance: value }));
    toast.success(`Risk tolerance updated to ${value}`);
  };
  
  // Change notifications setting
  const handleToggleNotifications = () => {
    setSettings(prev => ({ 
      ...prev, 
      notificationsEnabled: !prev.notificationsEnabled 
    }));
  };
  
  // Generate a new suggestion manually
  const handleRefreshSuggestion = () => {
    const suggestion = generateAISuggestion(asset, volatility, settings);
    setTradeSuggestion(suggestion);
    
    // Add to historical suggestions
    setHistoricalSuggestions(prev => {
      // Keep only last 5 suggestions
      const updated = [suggestion, ...prev].slice(0, 5);
      return updated;
    });
    
    toast.success("Generated new trading suggestion");
  };
  
  return (
    <div className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'} p-4 rounded-xl shadow-md`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-indigo-500" />
          <h3 className="text-lg font-bold">AI Trading Advisor</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshSuggestion}
            className="p-1.5 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-800 dark:hover:bg-indigo-700 rounded-md transition-colors"
            title="Refresh suggestion"
          >
            <ArrowUpRight size={16} className="text-indigo-600 dark:text-indigo-300" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
            title="Advisor settings"
          >
            <Sliders size={16} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>
      
      {!showSettings ? (
        <>
          <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-3 mb-4">
            <div className="flex items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{asset.name}</span>
                  <span className="text-sm font-mono bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                    {asset.symbol}
                  </span>
                </div>
                <div className="text-2xl font-bold mt-1 mb-2">
                  {formatPrice(asset.priceUsd)}
                </div>
                <div className={`inline-flex items-center text-sm px-2 py-0.5 rounded ${
                  parseFloat(asset.changePercent24Hr) >= 0 
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                }`}>
                  {parseFloat(asset.changePercent24Hr) >= 0 ? (
                    <TrendingUp size={14} className="mr-1" />
                  ) : (
                    <TrendingDown size={14} className="mr-1" />
                  )}
                  {parseFloat(asset.changePercent24Hr).toFixed(2)}%
                </div>
              </div>
              
              {/* AI Suggestion Box */}
              {tradeSuggestion && (
                <div className={`ml-4 p-3 rounded-lg ${getActionColor(tradeSuggestion.action)}`}>
                  <div className="font-bold text-lg">{getActionLabel(tradeSuggestion.action)}</div>
                  <div className="flex items-center mt-1">
                    <span className="text-sm mr-2">Confidence:</span>
                    <Progress 
                      value={tradeSuggestion.confidence} 
                      className="h-2 flex-1" 
                    />
                    <span className="text-sm ml-2">{tradeSuggestion.confidence}%</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Volatility indicator */}
            <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-800">
              <div className="flex justify-between text-sm mb-1">
                <span>Volatility: {volatility.toFixed(2)}%</span>
                <span>{getVolatilityLabel(volatility)}</span>
              </div>
              <Progress 
                value={Math.min(volatility * 5, 100)} 
                className="h-1.5" 
              />
            </div>
          </div>
          
          {/* AI Reasoning */}
          {tradeSuggestion && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold mb-2">AI Analysis:</h4>
              <p className="text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded border border-gray-100 dark:border-gray-700">
                {tradeSuggestion.reasoning}
              </p>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-100 dark:border-green-800">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Potential Gain</div>
                  <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                    +{tradeSuggestion.potentialGain.toFixed(2)}%
                  </div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-100 dark:border-red-800">
                  <div className="text-xs text-gray-600 dark:text-gray-400">Potential Loss</div>
                  <div className="text-lg font-semibold text-red-600 dark:text-red-400">
                    -{tradeSuggestion.potentialLoss.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Historical suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <History size={14} className="text-gray-500" />
              <h4 className="text-sm font-semibold">Previous Advisories</h4>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {historicalSuggestions.length > 1 ? (
                historicalSuggestions.slice(1).map((suggestion, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/30 rounded border border-gray-100 dark:border-gray-700 text-sm"
                  >
                    <div className="flex items-center">
                      {getActionIcon(suggestion.action, 14)}
                      <span className="ml-2">
                        {getActionLabel(suggestion.action)} at {formatPrice(asset.priceUsd)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(suggestion.suggestedAt)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 py-4">
                  No previous advisories yet
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // Settings Panel
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <h4 className="font-medium mb-4">Advisor Settings</h4>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Risk Tolerance</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRiskToleranceChange('conservative')}
                  className={`py-2 text-sm rounded-md ${
                    settings.riskTolerance === 'conservative' 
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium' 
                      : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  Conservative
                </button>
                <button
                  onClick={() => handleRiskToleranceChange('moderate')}
                  className={`py-2 text-sm rounded-md ${
                    settings.riskTolerance === 'moderate' 
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium' 
                      : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  Moderate
                </button>
                <button
                  onClick={() => handleRiskToleranceChange('aggressive')}
                  className={`py-2 text-sm rounded-md ${
                    settings.riskTolerance === 'aggressive' 
                      ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 font-medium' 
                      : 'bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500'
                  }`}
                >
                  Aggressive
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm">Enable notifications</label>
                <Switch 
                  checked={settings.notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Consider market sentiment</label>
                <Switch 
                  checked={settings.considerMarketSentiment}
                  onCheckedChange={() => setSettings(prev => ({ 
                    ...prev, 
                    considerMarketSentiment: !prev.considerMarketSentiment 
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Prioritize volume in analysis</label>
                <Switch 
                  checked={settings.prioritizeVolume}
                  onCheckedChange={() => setSettings(prev => ({ 
                    ...prev, 
                    prioritizeVolume: !prev.prioritizeVolume 
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Track advisor performance</label>
                <Switch 
                  checked={settings.trackPerformance}
                  onCheckedChange={() => setSettings(prev => ({ 
                    ...prev, 
                    trackPerformance: !prev.trackPerformance 
                  }))}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Preferred Time Frame</label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setSettings(prev => ({ ...prev, preferredTimeFrame: 'h1' }))}
                  className={`py-1.5 text-xs rounded ${
                    settings.preferredTimeFrame === 'h1' 
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}
                >
                  1H
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, preferredTimeFrame: 'h12' }))}
                  className={`py-1.5 text-xs rounded ${
                    settings.preferredTimeFrame === 'h12' 
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}
                >
                  12H
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, preferredTimeFrame: 'd1' }))}
                  className={`py-1.5 text-xs rounded ${
                    settings.preferredTimeFrame === 'd1' 
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}
                >
                  1D
                </button>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, preferredTimeFrame: 'w1' }))}
                  className={`py-1.5 text-xs rounded ${
                    settings.preferredTimeFrame === 'w1' 
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                      : 'bg-gray-100 dark:bg-gray-600'
                  }`}
                >
                  1W
                </button>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(false)}
            className="w-full mt-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors text-sm"
          >
            Save & Close
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to get action color for UI
const getActionColor = (action: TradeAction): string => {
  switch (action) {
    case 'buy':
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
    case 'sell':
      return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    case 'hold':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    case 'watch':
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
    default:
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
  }
};

// Helper function to get human-readable action labels
const getActionLabel = (action: TradeAction): string => {
  switch (action) {
    case 'buy':
      return 'Buy Now';
    case 'sell':
      return 'Sell Now';
    case 'hold':
      return 'Hold Position';
    case 'watch':
      return 'Watch Closely';
    default:
      return action;
  }
};

// Helper function to get action icon
const getActionIcon = (action: TradeAction, size: number = 16) => {
  switch (action) {
    case 'buy':
      return <ArrowUpRight size={size} className="text-green-600 dark:text-green-400" />;
    case 'sell':
      return <ArrowDownRight size={size} className="text-red-600 dark:text-red-400" />;
    case 'hold':
      return <Pause size={size} className="text-blue-600 dark:text-blue-400" />;
    case 'watch':
      return <Eye size={size} className="text-yellow-600 dark:text-yellow-400" />;
    default:
      return null;
  }
};

// Helper function to get volatility label
const getVolatilityLabel = (volatility: number): string => {
  if (volatility < 2) return 'Very Low';
  if (volatility < 5) return 'Low';
  if (volatility < 10) return 'Moderate';
  if (volatility < 20) return 'High';
  return 'Very High';
};

// Format timestamp to relative time
const formatTimestamp = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
};

// AI suggestion generator
const generateAISuggestion = (
  asset: AssetData, 
  volatility: number,
  settings: AIAdvisorSettings
): TradeSuggestion => {
  const price = parseFloat(asset.priceUsd);
  const changePercent = parseFloat(asset.changePercent24Hr);
  const volume = parseFloat(asset.volumeUsd24Hr);
  
  // Analyze data to determine action
  let action: TradeAction = 'hold';
  let confidence = 0;
  let reasoning = '';
  let potentialGain = 0;
  let potentialLoss = 0;
  
  // Adjust risk factors based on risk tolerance
  const riskFactors = {
    volatilityWeight: settings.riskTolerance === 'conservative' ? 0.4 : 
                      settings.riskTolerance === 'moderate' ? 0.6 : 0.8,
    priceChangeThreshold: settings.riskTolerance === 'conservative' ? 3 : 
                          settings.riskTolerance === 'moderate' ? 2 : 1,
    volumeThreshold: settings.riskTolerance === 'conservative' ? 1000000000 : 
                     settings.riskTolerance === 'moderate' ? 500000000 : 250000000,
  };
  
  // Implement simplified "AI" logic - this would be much more complex in a real system
  if (changePercent >= riskFactors.priceChangeThreshold && volatility < 15) {
    // Strong positive momentum with manageable volatility
    if (settings.riskTolerance === 'aggressive') {
      action = 'buy';
      confidence = Math.min(85, 55 + (changePercent * 2));
      reasoning = `${asset.symbol} shows strong positive momentum (${changePercent.toFixed(2)}%) with manageable volatility (${volatility.toFixed(2)}%). Volume is ${formatLargeNumber(volume)} indicating healthy trading activity.`;
      potentialGain = changePercent * 1.5;
      potentialLoss = Math.max(volatility * 0.5, 3);
    } else if (settings.riskTolerance === 'moderate' && changePercent > 3) {
      action = 'buy';
      confidence = Math.min(75, 50 + changePercent);
      reasoning = `${asset.symbol} has solid upward momentum (${changePercent.toFixed(2)}%) and volume indicators suggest continued growth. Risk is moderate given the current market conditions.`;
      potentialGain = changePercent * 1.2;
      potentialLoss = Math.max(volatility * 0.7, 4);
    } else {
      action = 'watch';
      confidence = 65;
      reasoning = `${asset.symbol} is trending upward (${changePercent.toFixed(2)}%), but given your conservative risk profile, it's better to watch for more confirmation before entering.`;
      potentialGain = changePercent;
      potentialLoss = volatility * 0.8;
    }
  } else if (changePercent <= -riskFactors.priceChangeThreshold && volatility > 10) {
    // Negative momentum with high volatility
    if (Math.abs(changePercent) > 8) {
      action = 'sell';
      confidence = Math.min(90, 60 + Math.abs(changePercent));
      reasoning = `${asset.symbol} is showing significant downward pressure (${changePercent.toFixed(2)}%) with high volatility (${volatility.toFixed(2)}%). Technical indicators suggest further decline is possible.`;
      potentialGain = Math.abs(changePercent) * 0.8; // Gain from avoiding further loss
      potentialLoss = volatility * 0.4; // Loss from potential rebound
    } else {
      action = settings.riskTolerance === 'conservative' ? 'sell' : 'watch';
      confidence = 70;
      reasoning = `${asset.symbol} is experiencing downward movement (${changePercent.toFixed(2)}%) with elevated volatility. ${settings.riskTolerance === 'conservative' ? 'Conservative approach suggests reducing exposure.' : 'Monitor closely for stabilization patterns before taking action.'}`;
      potentialGain = Math.abs(changePercent) * 0.6;
      potentialLoss = volatility * 0.5;
    }
  } else if (Math.abs(changePercent) < 1 && volatility < 8) {
    // Stable price with low volatility
    action = 'hold';
    confidence = 75;
    reasoning = `${asset.symbol} is showing price stability (${changePercent.toFixed(2)}%) with low volatility (${volatility.toFixed(2)}%). Current conditions suggest maintaining existing positions while monitoring market developments.`;
    potentialGain = volatility * 0.6;
    potentialLoss = volatility * 0.4;
  } else {
    // Mixed or unclear signals
    action = 'watch';
    confidence = 60;
    reasoning = `${asset.symbol} presents mixed signals with ${changePercent > 0 ? 'positive' : 'negative'} price change (${changePercent.toFixed(2)}%) and ${volatility > 10 ? 'high' : 'moderate'} volatility (${volatility.toFixed(2)}%). More data needed before making decisive moves.`;
    potentialGain = Math.max(Math.abs(changePercent), volatility * 0.5);
    potentialLoss = Math.max(Math.abs(changePercent) * 0.8, volatility * 0.3);
  }
  
  // Adjust confidence based on volume if prioritized
  if (settings.prioritizeVolume) {
    const volumeConfidenceAdjustment = volume > 1000000000 ? 10 : 
                                     volume > 500000000 ? 5 : 
                                     volume > 100000000 ? 0 : -5;
    confidence = Math.min(95, Math.max(40, confidence + volumeConfidenceAdjustment));
  }
  
  return {
    assetId: asset.id,
    action,
    confidence,
    reasoning,
    suggestedAt: Date.now(),
    expiresAt: Date.now() + 3600000, // 1 hour
    potentialGain,
    potentialLoss
  };
};

// Helper for formatting large numbers
const formatLargeNumber = (num: number): string => {
  if (num >= 1000000000) return `$${(num / 1000000000).toFixed(2)}B`;
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  return `$${num.toFixed(2)}`;
};

export default AIAdvisor;
