
import React, { useState, useEffect } from 'react';
import { AssetData, TradeSimulation } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import { TrendingUp, TrendingDown, DollarSign, BarChart4, RefreshCw, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface TradingSimulatorProps {
  asset: AssetData;
}

const TradingSimulator: React.FC<TradingSimulatorProps> = ({ asset }) => {
  const { isDark } = useTheme();
  
  const [simulation, setSimulation] = useState<TradeSimulation>({
    assetId: asset.id,
    initialInvestment: 1000,
    entryPrice: parseFloat(asset.priceUsd),
    entryTimestamp: Date.now(),
    currentPrice: parseFloat(asset.priceUsd),
    currentTimestamp: Date.now(),
    profitLoss: 0,
    profitLossPercentage: 0,
    leverageUsed: 1,
    isLong: true
  });
  
  const [settings, setSettings] = useState({
    startingBalance: 1000,
    enableLeverage: false,
    maxLeverage: 5,
    simulationActive: false,
    showChart: false
  });
  
  const [priceHistory, setPriceHistory] = useState<{price: number, timestamp: number}[]>([]);
  const [volatility, setVolatility] = useState(0.005); // 0.5% default volatility
  
  // Initialize simulation with current asset
  useEffect(() => {
    if (asset) {
      setSimulation(prev => ({
        ...prev,
        assetId: asset.id,
        entryPrice: parseFloat(asset.priceUsd),
        currentPrice: parseFloat(asset.priceUsd),
        entryTimestamp: Date.now(),
        currentTimestamp: Date.now()
      }));
      
      // Set volatility based on 24hr change
      const percentChange = Math.abs(parseFloat(asset.changePercent24Hr));
      setVolatility(percentChange > 5 ? 0.01 : percentChange > 2 ? 0.005 : 0.002);
      
      // Initialize price history
      setPriceHistory([{ price: parseFloat(asset.priceUsd), timestamp: Date.now() }]);
    }
  }, [asset]);
  
  // Run the price simulation
  useEffect(() => {
    if (!settings.simulationActive) return;
    
    const interval = setInterval(() => {
      // Generate random price movement based on volatility
      const randomFactor = Math.random() > 0.5 ? 1 : -1;
      const changePercent = randomFactor * volatility * (Math.random() + 0.5);
      
      setSimulation(prev => {
        const newPrice = prev.currentPrice * (1 + changePercent);
        const newTimestamp = Date.now();
        
        // Calculate P&L
        const positionMultiplier = prev.isLong ? 1 : -1;
        const leverageMultiplier = prev.leverageUsed;
        const priceChange = positionMultiplier * (newPrice - prev.entryPrice) / prev.entryPrice;
        const newProfitLossPercentage = priceChange * leverageMultiplier * 100;
        const newProfitLoss = prev.initialInvestment * (newProfitLossPercentage / 100);
        
        // Update price history
        setPriceHistory(prevHistory => [
          ...prevHistory, 
          { price: newPrice, timestamp: newTimestamp }
        ].slice(-30)); // Keep last 30 data points
        
        // Liquidation check (if using leverage)
        if (leverageMultiplier > 1 && newProfitLossPercentage <= -95) {
          setSettings(prev => ({ ...prev, simulationActive: false }));
          toast.error("Position Liquidated!", {
            description: `Your ${leverageMultiplier}x leveraged position has been liquidated.`
          });
          return { ...prev };
        }
        
        // Significant profit/loss notifications
        if (
          Math.abs(newProfitLossPercentage) > 10 && 
          Math.floor(prev.profitLossPercentage / 10) !== Math.floor(newProfitLossPercentage / 10)
        ) {
          if (newProfitLossPercentage > 0) {
            toast.success(`Profit milestone reached: +${Math.floor(newProfitLossPercentage)}%`, {
              description: `Your ${asset.symbol} position is performing well!`
            });
          } else {
            toast.error(`Loss milestone reached: ${Math.floor(newProfitLossPercentage)}%`, {
              description: `Your ${asset.symbol} position is underwater.`
            });
          }
        }
        
        return {
          ...prev,
          currentPrice: newPrice,
          currentTimestamp: newTimestamp,
          profitLoss: newProfitLoss,
          profitLossPercentage: newProfitLossPercentage
        };
      });
    }, 1000); // Update every second
    
    return () => clearInterval(interval);
  }, [settings.simulationActive, asset, volatility]);
  
  const handleLeverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const leverage = parseInt(e.target.value, 10);
    setSimulation(prev => ({
      ...prev,
      leverageUsed: leverage
    }));
  };
  
  const handleDirectionToggle = () => {
    setSimulation(prev => ({
      ...prev,
      isLong: !prev.isLong
    }));
  };
  
  const handleInvestmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) return;
    
    setSimulation(prev => ({
      ...prev,
      initialInvestment: value
    }));
    setSettings(prev => ({
      ...prev,
      startingBalance: value
    }));
  };
  
  const handleStartSimulation = () => {
    // Reset the simulation with current settings
    setSimulation(prev => ({
      ...prev,
      entryPrice: parseFloat(asset.priceUsd),
      currentPrice: parseFloat(asset.priceUsd),
      entryTimestamp: Date.now(),
      currentTimestamp: Date.now(),
      profitLoss: 0,
      profitLossPercentage: 0
    }));
    
    setPriceHistory([{ price: parseFloat(asset.priceUsd), timestamp: Date.now() }]);
    
    setSettings(prev => ({
      ...prev,
      simulationActive: true
    }));
    
    toast(`Started ${simulation.isLong ? 'Long' : 'Short'} position on ${asset.symbol}`, {
      description: `Entry price: $${parseFloat(asset.priceUsd).toFixed(2)} with ${simulation.leverageUsed}x leverage`
    });
  };
  
  const handleStopSimulation = () => {
    setSettings(prev => ({
      ...prev,
      simulationActive: false
    }));
    
    toast.info(`Closed ${simulation.isLong ? 'Long' : 'Short'} position on ${asset.symbol}`, {
      description: `P&L: ${simulation.profitLossPercentage > 0 ? '+' : ''}${simulation.profitLossPercentage.toFixed(2)}% ($${simulation.profitLoss.toFixed(2)})`
    });
  };
  
  const handleToggleChart = () => {
    setSettings(prev => ({
      ...prev,
      showChart: !prev.showChart
    }));
  };
  
  const getActiveColor = () => {
    if (!settings.simulationActive) return 'text-gray-500';
    return simulation.profitLossPercentage > 0 ? 'text-green-500' : 'text-red-500';
  };
  
  // Render price history chart (simplified)
  const renderChart = () => {
    if (priceHistory.length < 2) return null;
    
    const minPrice = Math.min(...priceHistory.map(p => p.price));
    const maxPrice = Math.max(...priceHistory.map(p => p.price));
    const range = maxPrice - minPrice;
    const paddedMin = minPrice - (range * 0.1);
    const paddedMax = maxPrice + (range * 0.1);
    const paddedRange = paddedMax - paddedMin;
    
    return (
      <div className="mt-4 h-40 w-full relative">
        <div className="absolute inset-0">
          {/* Draw price line */}
          <svg className="w-full h-full">
            <path
              d={priceHistory.map((point, i) => {
                const x = (i / (priceHistory.length - 1)) * 100;
                const y = 100 - ((point.price - paddedMin) / paddedRange) * 100;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              fill="none"
              stroke={simulation.profitLossPercentage >= 0 ? "#10B981" : "#EF4444"}
              strokeWidth="2"
            />
          </svg>
          
          {/* Price markers */}
          <div className="absolute right-0 top-0 text-xs text-gray-500">
            ${paddedMax.toFixed(2)}
          </div>
          <div className="absolute right-0 bottom-0 text-xs text-gray-500">
            ${paddedMin.toFixed(2)}
          </div>
          
          {/* Entry line */}
          <div 
            className="absolute left-0 right-0 border-dashed border-b border-gray-400"
            style={{ 
              bottom: `${((simulation.entryPrice - paddedMin) / paddedRange) * 100}%` 
            }}
          >
            <span className="absolute right-0 transform translate-y-(-50%) text-xs bg-gray-100 dark:bg-gray-800 px-1">
              Entry: ${simulation.entryPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="neo-brutalist-sm overflow-hidden">
      <div className={`p-4 ${
        !settings.simulationActive 
          ? 'bg-gray-100 dark:bg-gray-800' 
          : simulation.profitLossPercentage >= 0
            ? 'bg-green-50 dark:bg-green-900/20'
            : 'bg-red-50 dark:bg-red-900/20'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Coins className={`w-5 h-5 mr-2 ${getActiveColor()}`} />
            <h3 className="font-bold text-lg">Trading Simulator</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleChart}
              className="p-1.5 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              <BarChart4 className="w-4 h-4" />
            </button>
            
            {settings.simulationActive ? (
              <button
                onClick={handleStopSimulation}
                className="px-2 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-xs font-medium"
              >
                Close Position
              </button>
            ) : (
              <button
                onClick={handleStartSimulation}
                className="px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 text-xs font-medium"
              >
                Start Simulation
              </button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Investment Amount</span>
              <span className="text-sm">${simulation.initialInvestment}</span>
            </div>
            <input
              type="range"
              min="100"
              max="10000"
              step="100"
              value={simulation.initialInvestment}
              onChange={handleInvestmentChange}
              disabled={settings.simulationActive}
              className="w-full"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Position Type</span>
              <div className="flex space-x-2">
                <button
                  onClick={handleDirectionToggle}
                  disabled={settings.simulationActive}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    simulation.isLong 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 inline mr-1" />
                  Long
                </button>
                <button
                  onClick={handleDirectionToggle}
                  disabled={settings.simulationActive}
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    !simulation.isLong 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <TrendingDown className="w-3 h-3 inline mr-1" />
                  Short
                </button>
              </div>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="enableLeverage"
                checked={settings.enableLeverage}
                onChange={() => setSettings(prev => ({ ...prev, enableLeverage: !prev.enableLeverage }))}
                disabled={settings.simulationActive}
                className="mr-2"
              />
              <label htmlFor="enableLeverage" className="text-sm font-medium">
                Enable Leverage
              </label>
              
              {settings.enableLeverage && (
                <div className="ml-4 flex items-center">
                  <span className="text-sm mr-2">{simulation.leverageUsed}x</span>
                  <input
                    type="range"
                    min="1"
                    max={settings.maxLeverage}
                    value={simulation.leverageUsed}
                    onChange={handleLeverageChange}
                    disabled={settings.simulationActive}
                    className="w-24"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        {settings.simulationActive && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white/50 dark:bg-black/20">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-xs text-gray-500">Current Price</div>
                <div className="font-semibold">
                  ${simulation.currentPrice.toFixed(2)}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500">Entry Price</div>
                <div className="font-semibold">
                  ${simulation.entryPrice.toFixed(2)}
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500">P&L</div>
                <div className={`font-semibold ${
                  simulation.profitLossPercentage > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {simulation.profitLossPercentage > 0 ? '+' : ''}
                  ${simulation.profitLoss.toFixed(2)} 
                  ({simulation.profitLossPercentage > 0 ? '+' : ''}
                  {simulation.profitLossPercentage.toFixed(2)}%)
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500">Current Balance</div>
                <div className="font-semibold">
                  ${(simulation.initialInvestment + simulation.profitLoss).toFixed(2)}
                </div>
              </div>
            </div>
            
            {/* Live price indicator */}
            <div className="mt-2 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              <span className="text-xs text-gray-500">
                Live simulation - prices update every second
              </span>
            </div>
            
            {/* Display chart if enabled */}
            {settings.showChart && renderChart()}
          </div>
        )}
        
        {!settings.simulationActive && (
          <div className="text-center text-sm text-gray-500 mt-2 p-3 border border-dashed border-gray-300 dark:border-gray-700 rounded">
            <RefreshCw className="w-4 h-4 inline mr-1 text-gray-400" />
            Start a simulation to see how your trade would perform with real-time price movements.
            {settings.enableLeverage && simulation.leverageUsed > 1 && (
              <div className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                Warning: Trading with leverage ({simulation.leverageUsed}x) significantly increases risk of losses.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingSimulator;
