
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { fetchAssetHistory } from '@/lib/api';
import { AssetHistoryData } from '@/types';
import PriceChart from './PriceChart';
import { Info } from 'lucide-react';

interface PriceDataPoint {
  date: Date;
  value: number;
}

interface PerformanceComparisonProps {
  assetId: string;
  className?: string;
  timeFrame?: string;
  onTimeFrameChange?: (value: string) => void;
}

const PerformanceComparison = ({ assetId, className = '', timeFrame = 'd1', onTimeFrameChange }: PerformanceComparisonProps) => {
  const [comparisonAsset, setComparisonAsset] = useState('ethereum');
  const [localTimeframe, setLocalTimeframe] = useState(timeFrame);
  const [showComparison, setShowComparison] = useState(true);
  
  // Use either the prop timeFrame or local state
  const effectiveTimeframe = onTimeFrameChange ? timeFrame : localTimeframe;
  
  // Fetch main asset data
  const { data: mainAssetData, isLoading: mainLoading } = useQuery({
    queryKey: ['assetHistory', assetId, effectiveTimeframe],
    queryFn: () => fetchAssetHistory(assetId, effectiveTimeframe as any),
  });
  
  // Fetch comparison asset data
  const { data: comparisonAssetData, isLoading: comparisonLoading } = useQuery({
    queryKey: ['assetHistory', comparisonAsset, effectiveTimeframe],
    queryFn: () => fetchAssetHistory(comparisonAsset, effectiveTimeframe as any),
    enabled: showComparison,
  });
  
  // Transform data for the chart
  const transformHistoryData = (historyData: AssetHistoryData[] | undefined): PriceDataPoint[] => {
    if (!historyData) return [];
    
    return historyData.map(dataPoint => ({
      date: new Date(dataPoint.time),
      value: parseFloat(dataPoint.priceUsd)
    }));
  };
  
  const mainPrices = transformHistoryData(mainAssetData?.data);
  const comparisonPrices = transformHistoryData(comparisonAssetData?.data);
  
  // Calculate performance metrics
  const calculatePerformance = (prices: PriceDataPoint[]): number => {
    if (prices.length < 2) return 0;
    const firstPrice = prices[0].value;
    const lastPrice = prices[prices.length - 1].value;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };
  
  const mainPerformance = calculatePerformance(mainPrices);
  const comparisonPerformance = calculatePerformance(comparisonPrices);
  
  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    if (onTimeFrameChange) {
      onTimeFrameChange(value);
    } else {
      setLocalTimeframe(value);
    }
  };
  
  // Handle comparison asset change
  const handleComparisonChange = (value: string) => {
    setComparisonAsset(value);
  };
  
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Performance Comparison</CardTitle>
          <div className="flex items-center space-x-2">
            <Switch 
              id="comparison-toggle"
              checked={showComparison}
              onCheckedChange={setShowComparison}
            />
            <Label htmlFor="comparison-toggle">Compare</Label>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4 justify-between">
          <div>
            <div className="mb-1 text-sm text-gray-500">Timeframe</div>
            <Select 
              value={effectiveTimeframe} 
              onValueChange={handleTimeframeChange}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h1">1 Hour</SelectItem>
                <SelectItem value="h12">12 Hours</SelectItem>
                <SelectItem value="d1">1 Day</SelectItem>
                <SelectItem value="w1">1 Week</SelectItem>
                <SelectItem value="m1">1 Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {showComparison && (
            <div>
              <div className="mb-1 text-sm text-gray-500">Compare with</div>
              <Select 
                value={comparisonAsset} 
                onValueChange={handleComparisonChange}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select Asset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bitcoin">Bitcoin</SelectItem>
                  <SelectItem value="ethereum">Ethereum</SelectItem>
                  <SelectItem value="ripple">XRP</SelectItem>
                  <SelectItem value="cardano">Cardano</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {/* Price chart */}
        <div className="relative h-64">
          {(mainLoading || (showComparison && comparisonLoading)) ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-md">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : mainPrices.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-md">
              <div className="flex items-center text-gray-500">
                <Info className="w-4 h-4 mr-2" />
                <span>No data available</span>
              </div>
            </div>
          ) : (
            <div style={{ height: 300 }}>
              <PriceChart 
                data={mainPrices}
                comparisonData={showComparison ? comparisonPrices : undefined}
                height={300}
                mainLabel={assetId.charAt(0).toUpperCase() + assetId.slice(1)}
                comparisonLabel={comparisonAsset.charAt(0).toUpperCase() + comparisonAsset.slice(1)}
              />
            </div>
          )}
        </div>
        
        {/* Performance metrics */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
            <div className="text-sm text-gray-500 mb-1">
              {assetId.charAt(0).toUpperCase() + assetId.slice(1)}
            </div>
            <div className={`text-lg font-medium ${mainPerformance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {mainPerformance.toFixed(2)}%
            </div>
          </div>
          
          {showComparison && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="text-sm text-gray-500 mb-1">
                {comparisonAsset.charAt(0).toUpperCase() + comparisonAsset.slice(1)}
              </div>
              <div className={`text-lg font-medium ${comparisonPerformance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {comparisonPerformance.toFixed(2)}%
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceComparison;
