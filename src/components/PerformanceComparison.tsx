
import { useState, useEffect } from 'react';
import { AssetHistoryData, TimeFrame } from '../types';
import { fetchAssetHistory } from '../lib/api';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatPrice } from '../lib/api';
import LoadingSkeleton from './LoadingSkeleton';

interface PerformanceComparisonProps {
  assetId: string;
  timeFrame: TimeFrame;
}

type Period = 'current' | 'previous';

const PerformanceComparison = ({ assetId, timeFrame }: PerformanceComparisonProps) => {
  const [currentPeriodData, setCurrentPeriodData] = useState<AssetHistoryData[]>([]);
  const [previousPeriodData, setPreviousPeriodData] = useState<AssetHistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch current period data
        const currentPeriodResponse = await fetchAssetHistory(assetId, timeFrame);
        setCurrentPeriodData(currentPeriodResponse.data);
        
        // Calculate the previous period based on the current timeFrame
        let previousTimeFrame = timeFrame;
        let historyPeriod = '';
        const now = Date.now();
        
        if (timeFrame === 'h1') {
          historyPeriod = `&start=${now - 2 * 60 * 60 * 1000}&end=${now - 60 * 60 * 1000}`;
        } else if (timeFrame === 'h12') {
          historyPeriod = `&start=${now - 24 * 60 * 60 * 1000}&end=${now - 12 * 60 * 60 * 1000}`;
        } else if (timeFrame === 'd1') {
          historyPeriod = `&start=${now - 2 * 24 * 60 * 60 * 1000}&end=${now - 24 * 60 * 60 * 1000}`;
        } else if (timeFrame === 'w1') {
          historyPeriod = `&start=${now - 14 * 24 * 60 * 60 * 1000}&end=${now - 7 * 24 * 60 * 60 * 1000}`;
        } else if (timeFrame === 'm1') {
          historyPeriod = `&start=${now - 60 * 24 * 60 * 60 * 1000}&end=${now - 30 * 24 * 60 * 60 * 1000}`;
        }
        
        // Custom fetch for previous period
        const response = await fetch(`https://api.coincap.io/v2/assets/${assetId}/history?interval=${previousTimeFrame}${historyPeriod}`);
        if (!response.ok) {
          throw new Error('Failed to fetch previous period data');
        }
        
        const data = await response.json();
        setPreviousPeriodData(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('Failed to fetch performance comparison data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [assetId, timeFrame]);
  
  if (isLoading) {
    return <LoadingSkeleton variant="chart" />;
  }
  
  if (error) {
    return (
      <div className="neo-brutalist-sm bg-red-100 p-4 rounded-xl">
        <p className="text-red-600">Error loading comparison data: {error}</p>
      </div>
    );
  }
  
  // Prepare chart data
  const combinedData = currentPeriodData.map((item, index) => {
    const previousPeriodPoint = previousPeriodData[index] || { priceUsd: '0', time: item.time - (24 * 60 * 60 * 1000) };
    
    return {
      date: new Date(item.time).toLocaleDateString(),
      current: parseFloat(item.priceUsd),
      previous: parseFloat(previousPeriodPoint.priceUsd),
      timestamp: item.time,
    };
  });
  
  // Calculate performance change
  const calculatePerformanceChange = (periodData: AssetHistoryData[], period: Period) => {
    if (!periodData.length) return { change: 0, percentChange: 0 };
    
    const firstPrice = parseFloat(periodData[0].priceUsd);
    const lastPrice = parseFloat(periodData[periodData.length - 1].priceUsd);
    const change = lastPrice - firstPrice;
    const percentChange = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    return { change, percentChange };
  };
  
  const currentPerformance = calculatePerformanceChange(currentPeriodData, 'current');
  const previousPerformance = calculatePerformanceChange(previousPeriodData, 'previous');
  
  // Performance improved or worsened compared to previous period
  const performanceComparison = currentPerformance.percentChange - previousPerformance.percentChange;
  const isImproved = performanceComparison >= 0;
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="neo-brutalist-sm bg-white p-3 rounded-lg dark:bg-gray-800 dark:text-white">
          <p className="text-sm font-medium">{new Date(payload[0].payload.timestamp).toLocaleString()}</p>
          <p className="text-sm font-mono font-semibold">Current: {formatPrice(payload[0].value)}</p>
          {payload[1] && <p className="text-sm font-mono font-semibold">Previous: {formatPrice(payload[1].value)}</p>}
        </div>
      );
    }
    return null;
  };
  
  const getPeriodLabel = () => {
    switch (timeFrame) {
      case 'h1': return 'hour';
      case 'h12': return '12 hours';
      case 'd1': return 'day';
      case 'w1': return 'week';
      case 'm1': return 'month';
      default: return 'period';
    }
  };
  
  return (
    <div className="neo-brutalist-sm bg-white p-4 rounded-xl dark:bg-gray-800 dark:text-white">
      <h3 className="text-lg font-semibold mb-2">Performance Comparison</h3>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm">Current {getPeriodLabel()}: 
            <span className={`font-semibold ml-1 ${currentPerformance.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentPerformance.percentChange.toFixed(2)}%
            </span>
          </p>
          <p className="text-sm">Previous {getPeriodLabel()}: 
            <span className={`font-semibold ml-1 ${previousPerformance.percentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {previousPerformance.percentChange.toFixed(2)}%
            </span>
          </p>
        </div>
        <div className={`text-sm font-semibold ${isImproved ? 'text-green-600' : 'text-red-600'}`}>
          {isImproved ? 'Improved' : 'Declined'} by {Math.abs(performanceComparison).toFixed(2)}%
        </div>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={combinedData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12 }}
              minTickGap={30}
            />
            <YAxis 
              domain={['auto', 'auto']} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12 }}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="current" 
              name="Current Period" 
              stroke="#0071e3" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="previous" 
              name="Previous Period" 
              stroke="#8e8e93" 
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceComparison;
