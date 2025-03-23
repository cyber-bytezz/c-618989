
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, Award, BarChart2, Brain, ChevronDown, ChevronUp, Clock, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetData, Portfolio, PortfolioAction, PortfolioAsset, RiskProfile } from '@/types';
import { formatPrice, formatPercent } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';
import AISettingsModal from './AISettingsModal';
import { generatePortfolioActions, calculatePortfolioBalance, calculatePortfolioPerformance, calculateRiskScore } from '@/lib/portfolioUtils';
import { toast } from 'sonner';

interface AIPortfolioRebalancerProps {
  assets?: AssetData[];
}

const AIPortfolioRebalancer = ({ assets = [] }: AIPortfolioRebalancerProps) => {
  const { isDark } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [suggestedActions, setSuggestedActions] = useState<PortfolioAction[]>([]);
  const [riskProfile, setRiskProfile] = useState<RiskProfile>('moderate');
  const [isAutomatedMode, setIsAutomatedMode] = useState(false);

  // Load sample portfolio data when component mounts
  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        // In a real app, this would fetch from an API or database
        // For now, we'll use mock data based on available assets
        if (assets.length > 0) {
          const mockPortfolio: Portfolio = {
            totalValueUsd: 0,
            assets: [
              {
                assetId: 'bitcoin',
                amount: 0.5,
                valueUsd: 0,
                allocation: 40,
                name: 'Bitcoin',
                symbol: 'BTC'
              },
              {
                assetId: 'ethereum',
                amount: 2.5,
                valueUsd: 0,
                allocation: 30,
                name: 'Ethereum',
                symbol: 'ETH'
              },
              {
                assetId: 'cardano',
                amount: 1000,
                valueUsd: 0,
                allocation: 15,
                name: 'Cardano',
                symbol: 'ADA'
              },
              {
                assetId: 'solana',
                amount: 25,
                valueUsd: 0,
                allocation: 10,
                name: 'Solana',
                symbol: 'SOL'
              },
              {
                assetId: 'polkadot',
                amount: 100,
                valueUsd: 0,
                allocation: 5,
                name: 'Polkadot',
                symbol: 'DOT'
              }
            ],
            lastRebalanced: Date.now() - 86400000, // 1 day ago
            performance: {
              daily: 2.3,
              weekly: -1.2,
              monthly: 8.7
            },
            riskScore: 65
          };

          // Update portfolio with current asset prices
          const updatedPortfolio = calculatePortfolioBalance(mockPortfolio, assets);
          setPortfolio(updatedPortfolio);
          
          // Generate AI suggestions
          const actions = generatePortfolioActions(updatedPortfolio, assets, riskProfile);
          setSuggestedActions(actions);
        }
      } catch (error) {
        console.error("Error loading portfolio data:", error);
        toast.error("Could not load portfolio data");
      } finally {
        setIsLoading(false);
      }
    };

    loadPortfolio();
  }, [assets, riskProfile]);

  // Apply AI suggested changes to portfolio
  const handleApplyChanges = () => {
    if (!portfolio) return;

    // In a real app, this would call an API to execute trades
    // For demo purposes, we'll just simulate the changes
    const updatedAssets = [...portfolio.assets];
    
    suggestedActions.forEach(action => {
      const assetIndex = updatedAssets.findIndex(a => a.assetId === action.assetId);
      if (assetIndex >= 0) {
        if (action.action === 'buy') {
          updatedAssets[assetIndex].amount += action.amount;
          updatedAssets[assetIndex].allocation += action.allocationChange;
        } else if (action.action === 'sell') {
          updatedAssets[assetIndex].amount -= action.amount;
          updatedAssets[assetIndex].allocation -= action.allocationChange;
        }
      }
    });
    
    const newPortfolio = {
      ...portfolio,
      assets: updatedAssets,
      lastRebalanced: Date.now(),
    };
    
    setPortfolio(newPortfolio);
    setSuggestedActions([]);
    toast.success("Portfolio rebalanced successfully");
  };

  // Toggle automated mode
  const toggleAutomatedMode = () => {
    setIsAutomatedMode(!isAutomatedMode);
    toast.success(isAutomatedMode 
      ? "Automated rebalancing disabled" 
      : "Automated rebalancing enabled");
  };

  // Calculate time since last rebalance
  const getTimeSinceRebalance = () => {
    if (!portfolio) return "Never";
    
    const now = Date.now();
    const diff = now - portfolio.lastRebalanced;
    
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-lg">AI Portfolio Rebalancer</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Settings
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : portfolio ? (
          <>
            <div className="flex flex-wrap justify-between items-start mb-4">
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Portfolio Value</h3>
                <div className="text-2xl font-bold">{formatPrice(portfolio.totalValueUsd)}</div>
                <div className={`text-sm flex items-center ${
                  portfolio.performance.daily >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {portfolio.performance.daily >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {formatPercent(portfolio.performance.daily)} today
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-2">
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Risk Score</div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-16 w-16 flex items-center justify-center">
                    <span className="text-lg font-bold">{portfolio.riskScore}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Last Rebalanced</div>
                  <div className="flex flex-col items-center justify-center h-16 px-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <Clock className="h-4 w-4 mb-1 text-gray-500" />
                    <span className="text-xs">{getTimeSinceRebalance()}</span>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Auto Mode</div>
                  <div className="flex items-center justify-center h-16 px-3 bg-gray-100 dark:bg-gray-800 rounded-md">
                    <div 
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                        isAutomatedMode ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                      onClick={toggleAutomatedMode}
                    >
                      <div 
                        className={`bg-white dark:bg-gray-200 h-5 w-5 rounded-full shadow-md transform transition-transform duration-300 ${
                          isAutomatedMode ? 'translate-x-6' : ''
                        }`} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Current Allocation</h3>
                <Badge variant={getRiskBadgeVariant(riskProfile)}>
                  {getRiskLabel(riskProfile)} Risk
                </Badge>
              </div>
              
              <div className="grid gap-2">
                {portfolio.assets.map(asset => (
                  <div key={asset.assetId} className="flex items-center">
                    <div className="w-20 mr-3">
                      <div className="text-sm font-medium">{asset.symbol}</div>
                      <div className="text-xs text-gray-500">{asset.allocation}%</div>
                    </div>
                    <Progress 
                      value={asset.allocation} 
                      max={100}
                      className="h-2 flex-1" 
                    />
                    <div className="w-24 ml-3 text-right">
                      <div className="text-sm">{formatPrice(asset.valueUsd)}</div>
                      <div className="text-xs text-gray-500">{asset.amount} {asset.symbol}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {suggestedActions.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <Brain className="h-4 w-4 text-indigo-500 mr-1" />
                  <h3 className="text-sm font-medium">AI Suggested Actions</h3>
                </div>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 rounded-md p-3">
                  <ul className="space-y-2">
                    {suggestedActions.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <Badge 
                          className="mt-0.5 mr-2"
                          variant={action.action === 'buy' ? 'success' : 'destructive'}
                        >
                          {action.action.toUpperCase()}
                        </Badge>
                        <div>
                          <div className="text-sm">
                            {action.action === 'buy' ? 'Add' : 'Reduce'} {action.amount} {action.symbol} 
                            ({action.action === 'buy' ? '+' : '-'}{action.allocationChange}%)
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {action.reasoning}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-3 flex justify-end">
                    <Button 
                      size="sm"
                      onClick={handleApplyChanges}
                    >
                      Apply Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-4">
              <AlertCircle className="h-3 w-3 mr-1" />
              AI suggestions are based on historical data and current market conditions. Not financial advice.
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400">
              Could not load portfolio data
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setIsLoading(true)}
            >
              Retry
            </Button>
          </div>
        )}
      </CardContent>
      
      <AISettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        riskProfile={riskProfile}
        onRiskProfileChange={setRiskProfile}
        isAutomatedMode={isAutomatedMode}
        onAutomatedModeChange={setIsAutomatedMode}
      />
    </Card>
  );
};

// Helper functions for UI
const getRiskLabel = (risk: RiskProfile): string => {
  switch (risk) {
    case 'conservative': return 'Conservative';
    case 'moderate': return 'Moderate';
    case 'aggressive': return 'Aggressive';
    case 'very_aggressive': return 'Very Aggressive';
    default: return 'Custom';
  }
};

const getRiskBadgeVariant = (risk: RiskProfile): 'default' | 'secondary' | 'outline' | 'destructive' => {
  switch (risk) {
    case 'conservative': return 'outline';
    case 'moderate': return 'default';
    case 'aggressive': return 'secondary';
    case 'very_aggressive': return 'destructive';
    default: return 'default';
  }
};

export default AIPortfolioRebalancer;
