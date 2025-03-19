
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchAsset, 
  fetchAssetHistory, 
  formatMarketCap, 
  formatPercent, 
  formatPrice, 
  calculateVolatility 
} from '../lib/api';
import Header from '../components/Header';
import PriceChart, { TIME_FRAME_OPTIONS } from '../components/PriceChart';
import { ChevronLeft, ArrowUp, ArrowDown, ExternalLink, Heart, Activity, AlertTriangle } from 'lucide-react';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useState } from 'react';
import { TimeFrame } from '../types';
import ThemeToggle from '../components/ThemeToggle';
import PerformanceComparison from '../components/PerformanceComparison';
import AssetComment from '../components/AssetComment';
import ProfitLossCalculator from '../components/ProfitLossCalculator';
import LoadingSkeleton from '../components/LoadingSkeleton';
import RefreshTimer from '../components/RefreshTimer';
import { useTheme } from '../contexts/ThemeContext';

const AssetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('d1');
  const { isDark } = useTheme();
  
  const { data: assetData, isLoading: isAssetLoading, dataUpdatedAt } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchAsset(id!),
    enabled: !!id,
    refetchInterval: 30000, // 30 seconds
  });
  
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['assetHistory', id, timeFrame],
    queryFn: () => fetchAssetHistory(id!, timeFrame),
    enabled: !!id,
  });
  
  const asset = assetData?.data;
  const history = historyData?.data;
  const changePercent = asset ? parseFloat(asset.changePercent24Hr) : 0;
  const isPositive = changePercent > 0;
  
  // Calculate volatility if history data is available
  const volatility = history && history.length > 0 ? calculateVolatility(history) : null;
  
  const toggleWatchlist = () => {
    if (!id) return;
    
    if (isInWatchlist(id)) {
      removeFromWatchlist(id);
    } else {
      addToWatchlist(id);
    }
  };
  
  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-neo-gray'}`}>
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 animate-slide-up dark:text-white">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center text-sm font-medium hover:opacity-70 transition-opacity"
          >
            <ChevronLeft size={16} />
            <span>Back to all assets</span>
          </button>
          
          <ThemeToggle />
        </div>
        
        {isAssetLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton variant="detail" />
            <LoadingSkeleton variant="chart" />
            <LoadingSkeleton variant="detail" />
          </div>
        ) : asset ? (
          <div className="space-y-6">
            <div className="neo-brutalist bg-white p-6 rounded-xl dark:bg-gray-800">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neo-gray font-mono text-lg mr-4 dark:bg-gray-700">
                    {asset.rank}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{asset.name}</h1>
                    <div className="text-xl text-gray-500 font-mono dark:text-gray-400">{asset.symbol}</div>
                  </div>
                  <button 
                    onClick={toggleWatchlist}
                    className="ml-3 p-2 rounded-full hover:bg-gray-100 transition-colors dark:hover:bg-gray-700"
                    aria-label={isInWatchlist(id!) ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    <Heart 
                      size={24} 
                      fill={isInWatchlist(id!) ? "#ff3b30" : "none"} 
                      stroke={isInWatchlist(id!) ? "#ff3b30" : "currentColor"}
                    />
                  </button>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-mono font-semibold">{formatPrice(asset.priceUsd)}</div>
                  <div className={`flex items-center justify-end text-lg ${isPositive ? 'text-neo-success' : 'text-neo-danger'}`}>
                    {isPositive ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                    <span>{formatPercent(asset.changePercent24Hr)}</span>
                    <span className="text-gray-500 text-sm ml-1 dark:text-gray-400">24h</span>
                  </div>
                </div>
              </div>
              
              {dataUpdatedAt && (
                <div className="mt-4 flex justify-end">
                  <RefreshTimer 
                    lastUpdated={dataUpdatedAt} 
                    pollingInterval={30000} 
                  />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Price Chart</h2>
                <div className="flex space-x-2 overflow-x-auto">
                  {TIME_FRAME_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setTimeFrame(option.value)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        timeFrame === option.value 
                          ? 'bg-neo-black text-white dark:bg-neo-accent' 
                          : 'bg-neo-gray hover:bg-neo-gray/80 dark:bg-gray-700 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {isHistoryLoading ? (
                <LoadingSkeleton variant="chart" />
              ) : (
                <PriceChart 
                  data={history || []} 
                  color={isPositive ? '#34c759' : '#ff3b30'} 
                  timeFrame={timeFrame}
                />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="neo-brutalist bg-white rounded-xl p-6 dark:bg-gray-800">
                <div className="flex items-center mb-4">
                  <Activity size={18} className="mr-2 text-neo-accent" />
                  <h2 className="text-xl font-semibold">Market Stats</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1 dark:text-gray-400">Market Cap</h3>
                    <div className="font-mono text-lg font-medium">{formatMarketCap(asset.marketCapUsd)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1 dark:text-gray-400">24h Volume</h3>
                    <div className="font-mono text-lg font-medium">{formatMarketCap(asset.volumeUsd24Hr)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1 dark:text-gray-400">Circulating Supply</h3>
                    <div className="font-mono text-lg font-medium">
                      {parseFloat(asset.supply).toLocaleString()} {asset.symbol}
                    </div>
                  </div>
                  {asset.maxSupply && (
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1 dark:text-gray-400">Max Supply</h3>
                      <div className="font-mono text-lg font-medium">
                        {parseFloat(asset.maxSupply).toLocaleString()} {asset.symbol}
                      </div>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1 dark:text-gray-400">VWAP (24h)</h3>
                    <div className="font-mono text-lg font-medium">{formatPrice(asset.vwap24Hr)}</div>
                  </div>
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1 dark:text-gray-400">Volatility (24h)</h3>
                    <div className="font-mono text-lg font-medium flex items-center">
                      {volatility ? (
                        <>
                          {volatility.toFixed(2)}%
                          {volatility > 5 && <AlertTriangle size={16} className="ml-1 text-neo-warning" />}
                        </>
                      ) : 'N/A'}
                    </div>
                  </div>
                  {asset.explorer && (
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1 dark:text-gray-400">Explorer</h3>
                      <a 
                        href={asset.explorer} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-neo-accent hover:underline font-medium"
                      >
                        View <ExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <ProfitLossCalculator asset={asset} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PerformanceComparison assetId={id!} timeFrame={timeFrame} />
              
              <AssetComment assetId={id!} />
            </div>
            
            <div className="neo-brutalist bg-white rounded-xl p-6 dark:bg-gray-800">
              <h2 className="text-xl font-semibold mb-4">Performance Heatmap</h2>
              <div className="grid grid-cols-5 gap-2">
                {[-10, -5, -2, -1, -0.5, 0.5, 1, 2, 5, 10].map((percent) => {
                  const isPositive = percent > 0;
                  const intensity = Math.min(Math.abs(percent) / 10, 1);
                  const bgColor = isPositive 
                    ? `rgba(52, 199, 89, ${intensity})` 
                    : `rgba(255, 59, 48, ${intensity})`;
                  
                  return (
                    <div 
                      key={percent}
                      className="flex flex-col items-center justify-center p-2 rounded border border-gray-200 dark:border-gray-600"
                      style={{ backgroundColor: bgColor }}
                    >
                      <span className={`text-xs font-medium ${intensity > 0.5 ? 'text-white' : ''}`}>
                        {percent > 0 ? `+${percent}%` : `${percent}%`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center dark:text-gray-400">
                Color intensity represents market movement potential
              </p>
            </div>
          </div>
        ) : (
          <div className="neo-brutalist p-6 bg-neo-danger text-white">
            <h2 className="text-xl font-bold mb-2">Asset not found</h2>
            <p>The asset you're looking for doesn't exist or couldn't be loaded.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AssetDetails;
