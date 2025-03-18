
import { useState } from 'react';
import { useRealTimeData } from '../hooks/useRealTimeData';
import { fetchAssets, fetchTopGainers, fetchTopLosers, fetchTrendingAssets, calculateMarketSentiment } from '../lib/api';
import AssetCard from './AssetCard';
import MarketSentiment from './MarketSentiment';
import LoadingSkeleton from './LoadingSkeleton';
import { ChevronUp, ChevronDown, Search, Zap, TrendingUp, TrendingDown, BarChart4 } from 'lucide-react';
import { AssetCategory, AssetData, SortOption } from '../types';
import { toast } from 'sonner';

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

const AssetList = () => {
  const [sortBy, setSortBy] = useState('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState<AssetCategory>('all');
  
  // Fetch the appropriate category data
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
    togglePolling
  } = useRealTimeData(
    ['assets', category],
    fetchCategoryData,
    { 
      pollingInterval: 30000, // 30 seconds
      onSuccess: (newData) => {
        const lastUpdated = new Date(dataUpdatedAt);
        const now = new Date();
        
        // Only show toast if there was a previous update (not first load)
        if (dataUpdatedAt && now.getTime() - lastUpdated.getTime() > 1000) {
          toast("Data refreshed", {
            description: `Latest crypto prices updated just now`,
            position: "bottom-right"
          });
        }
      }
    }
  );
  
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
  
  // Find the current sort function
  const currentSortOption = sortOptions.find(option => option.id === sortBy);
  
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const comparison = currentSortOption ? currentSortOption.sortFn(a, b) : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Calculate market sentiment
  const marketSentiment = data ? calculateMarketSentiment(data) : 'neutral';

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-brutalist-sm w-full px-4 py-3 pl-10 rounded-xl bg-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <div className="flex items-center">
          <MarketSentiment sentiment={marketSentiment} className="mr-3" />
          <button 
            onClick={togglePolling}
            className={`p-2 rounded-full ${isPaused ? 'bg-red-100' : 'bg-green-100'} transition-colors`}
            title={isPaused ? "Resume auto-updates" : "Pause auto-updates"}
          >
            <Zap 
              size={16} 
              className={isPaused ? 'text-red-500' : 'text-green-500'} 
              fill={isPaused ? 'none' : 'currentColor'}
            />
          </button>
        </div>
      </div>
      
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
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <LoadingSkeleton count={8} variant="card" />
        </div>
      ) : error ? (
        <div className="neo-brutalist p-6 bg-neo-danger text-white mt-6">
          <h2 className="text-xl font-bold mb-2">Error loading assets</h2>
          <p>Please try again later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in mt-6">
          {sortedAssets.map(asset => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>
      )}
      
      {sortedAssets.length === 0 && !isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500">No assets found matching "{searchTerm}"</p>
        </div>
      )}
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
