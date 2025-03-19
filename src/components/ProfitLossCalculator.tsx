
import { useState, useEffect } from 'react';
import { AssetData } from '../types';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice } from '../lib/api';

interface ProfitLossCalculatorProps {
  asset: AssetData;
  className?: string;
}

const ProfitLossCalculator = ({ asset, className = "" }: ProfitLossCalculatorProps) => {
  const [investment, setInvestment] = useState(1000);
  const [purchaseDate, setPurchaseDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [historicalPrice, setHistoricalPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch historical price for the selected date
  useEffect(() => {
    const fetchHistoricalPrice = async () => {
      if (!purchaseDate || !asset) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const timestamp = new Date(purchaseDate).getTime();
        const response = await fetch(`https://api.coincap.io/v2/assets/${asset.id}/history?interval=d1&start=${timestamp}&end=${timestamp + 86400000}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch historical price');
        }
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          setHistoricalPrice(parseFloat(data.data[0].priceUsd));
        } else {
          // If no exact price for that day, use current price as fallback
          setHistoricalPrice(parseFloat(asset.priceUsd));
          setError('No price data available for selected date, using current price');
        }
      } catch (err) {
        console.error('Error fetching historical price:', err);
        setError('Failed to fetch historical price');
        // Fallback to current price
        setHistoricalPrice(parseFloat(asset.priceUsd));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistoricalPrice();
  }, [asset, purchaseDate]);
  
  // Calculate profit/loss
  const calculateResults = () => {
    if (!historicalPrice || historicalPrice <= 0) return { coins: 0, value: 0, profit: 0, percentChange: 0 };
    
    const coins = investment / historicalPrice;
    const currentValue = coins * parseFloat(asset.priceUsd);
    const profit = currentValue - investment;
    const percentChange = (profit / investment) * 100;
    
    return { coins, value: currentValue, profit, percentChange };
  };
  
  const results = calculateResults();
  const isProfitable = results.profit > 0;
  
  return (
    <div className={`neo-brutalist-sm bg-white p-4 rounded-xl dark:bg-gray-800 dark:text-white ${className}`}>
      <div className="flex items-center mb-3">
        <Calculator size={18} className="mr-2 text-neo-accent" />
        <h3 className="text-lg font-semibold">Profit/Loss Calculator</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Initial Investment ($)</label>
          <input
            type="number"
            min="1"
            value={investment}
            onChange={(e) => setInvestment(Math.max(1, Number(e.target.value)))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Purchase Date</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600"
          />
        </div>
        
        {error && <div className="text-red-500 text-sm">{error}</div>}
        
        <div className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Price at purchase</div>
              <div className="font-mono font-medium">
                {isLoading ? '...' : historicalPrice ? formatPrice(historicalPrice) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current price</div>
              <div className="font-mono font-medium">{formatPrice(asset.priceUsd)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Coins bought</div>
              <div className="font-mono font-medium">
                {isLoading ? '...' : results.coins.toFixed(8)} {asset.symbol}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Current value</div>
              <div className="font-mono font-medium">
                {isLoading ? '...' : formatPrice(results.value)}
              </div>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Profit/Loss</div>
              <div className={`flex items-center font-mono font-medium ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                {isProfitable ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                {isLoading ? '...' : formatPrice(Math.abs(results.profit))} 
                ({isLoading ? '...' : results.percentChange.toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitLossCalculator;
