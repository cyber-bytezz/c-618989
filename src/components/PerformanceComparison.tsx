
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import PriceChart from './PriceChart';
import { fetchAssetHistory, formatPrice } from '@/lib/api';
import { useTheme } from '../contexts/ThemeContext';
import { TimeFrame, TimeFrameOption, AssetHistoryData } from '@/types';
import { BarChart, TrendingUp, TrendingDown, Timer } from 'lucide-react';
import LoadingSkeleton from './LoadingSkeleton';

interface PerformanceComparisonProps {
  assetId: string;
  timeFrame: TimeFrame;
  onTimeFrameChange: (timeFrame: TimeFrame) => void;
}

const PerformanceComparison = ({ 
  assetId, 
  timeFrame = 'd1',
  onTimeFrameChange
}: PerformanceComparisonProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [priceData, setPriceData] = useState<AssetHistoryData[]>([]);
  const [comparisonData, setComparisonData] = useState<AssetHistoryData[]>([]);
  const [comparisonAsset, setComparisonAsset] = useState('ethereum');
  const { isDark } = useTheme();
  
  // Time frame options
  const timeFrameOptions: TimeFrameOption[] = [
    { value: 'h1', label: '1H' },
    { value: 'h12', label: '12H' },
    { value: 'd1', label: '1D' },
    { value: 'w1', label: '1W' },
    { value: 'm1', label: '1M' },
  ];
  
  // Fetch price data for both assets
  useEffect(() => {
    const fetchData = async () => {
      if (!assetId) return;
      
      setIsLoading(true);
      
      try {
        // Fetch main asset data
        const mainData = await fetchAssetHistory(assetId, timeFrame);
        setPriceData(mainData.data);
        
        // Fetch comparison asset data
        const compareData = await fetchAssetHistory(comparisonAsset, timeFrame);
        setComparisonData(compareData.data);
      } catch (error) {
        console.error("Error fetching asset history:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [assetId, comparisonAsset, timeFrame]);
  
  // Calculate performance metrics
  const calculatePerformance = (data: AssetHistoryData[]) => {
    if (!data.length) return { change: 0, percentChange: 0 };
    
    const firstPrice = parseFloat(data[0].priceUsd);
    const lastPrice = parseFloat(data[data.length - 1].priceUsd);
    
    const change = lastPrice - firstPrice;
    const percentChange = (change / firstPrice) * 100;
    
    return { change, percentChange };
  };
  
  const mainPerformance = calculatePerformance(priceData);
  const comparisonPerformance = calculatePerformance(comparisonData);
  
  // Handle time frame change
  const handleTimeFrameChange = (value: string) => {
    onTimeFrameChange(value as TimeFrame);
  };
  
  // Format the price change with the correct sign
  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };
  
  return (
    <div className={`neo-brutalist-sm rounded-xl p-4 ${isDark ? 'bg-gray-800 text-white' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart size={20} className="text-purple-500" />
          <h3 className="font-bold">Performance Comparison</h3>
        </div>
        
        <Tabs defaultValue={timeFrame} onValueChange={handleTimeFrameChange}>
          <TabsList>
            {timeFrameOptions.map(option => (
              <TabsTrigger key={option.value} value={option.value}>
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {isLoading ? (
        <LoadingSkeleton height={300} />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-3 bg-indigo-50 dark:bg-indigo-900/30">
              <div className="text-sm text-gray-500 dark:text-gray-400">Main Asset</div>
              <div className="text-lg font-semibold mt-1">{assetId.toUpperCase()}</div>
              <div className={`flex items-center mt-2 ${
                mainPerformance.percentChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {mainPerformance.percentChange >= 0 ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                <span>{formatChange(mainPerformance.percentChange)}</span>
              </div>
            </Card>
            
            <Card className="p-3 bg-purple-50 dark:bg-purple-900/30">
              <div className="text-sm text-gray-500 dark:text-gray-400">Comparison</div>
              <div className="text-lg font-semibold mt-1">{comparisonAsset.toUpperCase()}</div>
              <div className={`flex items-center mt-2 ${
                comparisonPerformance.percentChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {comparisonPerformance.percentChange >= 0 ? (
                  <TrendingUp size={16} className="mr-1" />
                ) : (
                  <TrendingDown size={16} className="mr-1" />
                )}
                <span>{formatChange(comparisonPerformance.percentChange)}</span>
              </div>
            </Card>
          </div>
          
          {/* Price chart for comparison */}
          <PriceChart 
            prices={priceData.map(d => ({ value: parseFloat(d.priceUsd), time: d.time }))} 
            comparisonPrices={comparisonData.map(d => ({ value: parseFloat(d.priceUsd), time: d.time }))}
            showComparison={true}
            height={220}
          />
          
          <div className="text-xs flex items-center justify-center text-gray-500 dark:text-gray-400">
            <Timer size={12} className="mr-1" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceComparison;
