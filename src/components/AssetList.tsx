import { useState } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { 
  fetchAssets, 
  fetchTopGainers, 
  fetchTopLosers, 
  fetchTrendingAssets, 
  calculateMarketSentiment, 
  clearApiCache 
} from '../lib/api';
import AssetCard from './AssetCard';
import MarketSentiment from './MarketSentiment';
import LoadingSkeleton from './LoadingSkeleton';
import { ChevronUp, ChevronDown, Search, Zap, TrendingUp, TrendingDown, BarChart4, RefreshCw } from 'lucide-react';
import { AssetCategory, AssetData, SortOption } from '../types';
import { toast } from 'sonner';
import ThemeToggle from './ThemeToggle';
import RefreshTimer from './RefreshTimer';
import MostWatchedAssets from './MostWatchedAssets';
import { useTheme } from '../contexts/ThemeContext';

interface AssetListProps {
  onAssetSelect?: (asset: AssetData) => void;
}

const sortOptions: SortOption[] = [
  {
    id: 'rank',
    label: 'Rank',
    sortFn: (a, b) => parseInt(a.rank) - parseInt(b.rank)
  },
  {
    id: 'name',
    label: 'Name',
    sortFn: (a, b) => a.name.localeCompare(b.name)
  },
  {
    id: 'price',
    label: 'Price',
    sortFn: (a, b) => parseFloat(a.priceUsd) - parseFloat(b.priceUsd)
  },
  {
    id: 'marketCap',
    label: 'Market Cap',
    sortFn: (a, b) => parseFloat(a.marketCapUsd) - parseFloat(b.marketCapUsd)
  },
  {
    id: 'change',
    label: '24h Change',
    sortFn: (a, b) => parseFloat(a.changePercent24Hr) - parseFloat(b.changePercent24Hr)
  },
  {
    id: 'volume',
    label: 'Volume',
    sortFn: (a, b) => parseFloat(a.volumeUsd24Hr) - parseFloat(b.volumeUsd24Hr)
  }
];

const categoryOptions = [
  { id: 'all', label: 'All Assets', icon: Zap },
  { id: 'gainers', label: 'Top Gainers', icon: TrendingUp },
  { id: 'losers', label: 'Top Losers', icon: TrendingDown },
  { id: 'trending', label: 'Trending', icon: BarChart4 }
];

const AssetList = ({ onAssetSelect }: AssetListProps) => {
  const [sortBy, setSortBy] = useState('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<AssetCategory>('all');
  const { isDark } = useTheme();
  
  const fetchCategoryData = () => {
    switch (category) {
      case 'gainers': return fetchTopGainers();
      case 'losers': return fetchTopLosers();
      case 'trending': return fetchTrendingAssets();
      default: return fetchAssets();
    }
  };

  const { 
    data, 
    isLoading, 
    error, 
    dataUpdatedAt,
    isPaused,
    togglePolling,
    refetch
  } = useRealTimeData(
    ['assets', category],
    fetchCategoryData,
    { 
      pollingInterval: 30000, // 30 seconds
    }
  );
  
  const handleRefresh = () => {
    clearApiCache();
    refetch();
    toast.success("Refreshing data", {
      description: "Fetching the latest crypto prices",
      position: "bottom-right"
    });
  };
  
  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };
  
  const filteredAssets = data?.data.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];
  
  const currentSortOption = sortOptions.find(option => option.id === sortBy);
  
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const comparison = currentSortOption ? currentSortOption.sortFn(a, b) : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const marketSentiment = data ? calculateMarketSentiment(data) : 'neutral';

  const handleAssetSelect = (asset: AssetData) => {
    if (onAssetSelect) {
      onAssetSelect(asset);
      toast.success(`Selected ${asset.name} for analysis`);
    }
  };

  return (
    <div className={`max-w-4xl mx-auto py-8 px-4 ${isDark ? 'dark text-white' : ''}`}>
      <div className="flex justify-end mb-4">
        <ThemeToggle />
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-brutalist-sm w-full px-4 py-3 pl-10 rounded-xl bg-white dark:bg-gray-800 dark:text-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <div className="flex items-center space-x-2">
          <MarketSentiment sentiment={marketSentiment} />
          
          <button 
            onClick={togglePolling}
            className={`p-2 rounded-full ${isPaused ? 'bg-red-100 dark:bg-red-900' : 'bg-green-100 dark:bg-green-900'} transition-colors`}
            title={isPaused ? "Resume auto-updates" : "Pause auto-updates"}
          >
            <Zap 
              size={16} 
              className={isPaused ? 'text-red-500' : 'text-green-500'} 
              fill={isPaused ? 'none' : 'currentColor'}
            />
          </button>
          
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:hover:bg-blue-800"
            title="Refresh data"
          >
            <RefreshCw size={16} className="text-neo-accent" />
          </button>
        </div>
      </div>
      
      {dataUpdatedAt && (
        <div className="flex justify-end mb-3">
          <RefreshTimer 
            lastUpdated={dataUpdatedAt} 
            pollingInterval={30000} 
          />
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-4">
        {categoryOptions.map(cat => (
          <CategoryButton 
            key={cat.id}
            icon={cat.icon}
            label={cat.label}
            active={category === cat.id}
            onClick={() => setCategory(cat.id as AssetCategory)}
          />
        ))}
      </div>
      
      <div className="mt-4 flex space-x-2 overflow-x-auto py-1 scrollbar-none">
        {sortOptions.map(option => (
          <SortButton 
            key={option.id}
            label={option.label} 
            active={sortBy === option.id} 
            direction={sortBy === option.id ? sortDirection : undefined}
            onClick={() => toggleSort(option.id)}
          />
        ))}
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mt-6">
        <div className="md:col-span-2">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              <LoadingSkeleton count={5} variant="card" />
            </div>
          ) : error ? (
            <div className="neo-brutalist p-6 bg-neo-danger text-white mt-6">
              <h2 className="text-xl font-bold mb-2">Error loading assets</h2>
              <p>Please try again later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 animate-fade-in">
              {sortedAssets.map(asset => (
                <div key={asset.id} onClick={() => handleAssetSelect(asset)} className="cursor-pointer">
                  <AssetCard key={asset.id} asset={asset} />
                </div>
              ))}
            </div>
          )}
          
          {sortedAssets.length === 0 && !isLoading && (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No assets found matching "{searchTerm}"</p>
            </div>
          )}
        </div>
        
        <div className="space-y-4">
          <MostWatchedAssets />
          
          <div className="neo-brutalist-sm bg-white p-4 rounded-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-3">Pro Trading Tips</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-neo-accent text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">1</span>
                <p>Use volume as a confirmation indicator for price movements</p>
              </li>
              <li className="flex items-start">
                <span className="bg-neo-accent text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">2</span>
                <p>Set stop losses to protect your investments from sudden market drops</p>
              </li>
              <li className="flex items-start">
                <span className="bg-neo-accent text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">3</span>
                <p>Diversify your portfolio across different asset classes</p>
              </li>
              <li className="flex items-start">
                <span className="bg-neo-accent text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 mt-0.5">4</span>
                <p>Consider dollar-cost averaging for long-term investments</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SortButtonProps {
  label: string;
  active: boolean;
  direction?: 'asc' | 'desc';
  onClick: () => void;
}

const SortButton = ({ label, active, direction, onClick }: SortButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full flex items-center whitespace-nowrap text-sm font-medium transition-colors ${
        active 
          ? 'bg-neo-black text-white' 
          : 'bg-neo-gray hover:bg-neo-gray/80'
      }`}
    >
      {label}
      {active && direction === 'asc' && <ChevronUp size={14} className="ml-1" />}
      {active && direction === 'desc' && <ChevronDown size={14} className="ml-1" />}
    </button>
  );
};

interface CategoryButtonProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

const CategoryButton = ({ icon: Icon, label, active, onClick }: CategoryButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl flex items-center text-sm font-medium transition-all duration-200 ${
        active 
          ? 'neo-brutalist bg-white transform -translate-y-1' 
          : 'hover:bg-white/50'
      }`}
    >
      <Icon size={16} className="mr-1.5" />
      {label}
    </button>
  );
};

export default AssetList;

