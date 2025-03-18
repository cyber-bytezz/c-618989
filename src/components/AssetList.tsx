
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAssets } from '../lib/api';
import AssetCard from './AssetCard';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';

const AssetList = () => {
  const [sortBy, setSortBy] = useState('rank');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['assets'],
    queryFn: fetchAssets,
  });
  
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
  
  const sortedAssets = [...filteredAssets].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === 'rank') {
      comparison = parseInt(a.rank) - parseInt(b.rank);
    } else if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'price') {
      comparison = parseFloat(a.priceUsd) - parseFloat(b.priceUsd);
    } else if (sortBy === 'marketCap') {
      comparison = parseFloat(a.marketCapUsd) - parseFloat(b.marketCapUsd);
    } else if (sortBy === 'change') {
      comparison = parseFloat(a.changePercent24Hr) - parseFloat(b.changePercent24Hr);
    }
    
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-36 rounded-xl bg-gray-100 animate-pulse-slow"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="neo-brutalist p-6 bg-neo-danger text-white">
          <h2 className="text-xl font-bold mb-2">Error loading assets</h2>
          <p>Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="neo-brutalist-sm w-full px-4 py-3 pl-10 rounded-xl bg-white"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        </div>
        
        <div className="mt-4 flex space-x-2 overflow-x-auto py-1 scrollbar-none">
          <SortButton 
            label="Rank" 
            active={sortBy === 'rank'} 
            direction={sortBy === 'rank' ? sortDirection : undefined}
            onClick={() => toggleSort('rank')}
          />
          <SortButton 
            label="Name" 
            active={sortBy === 'name'} 
            direction={sortBy === 'name' ? sortDirection : undefined}
            onClick={() => toggleSort('name')}
          />
          <SortButton 
            label="Price" 
            active={sortBy === 'price'} 
            direction={sortBy === 'price' ? sortDirection : undefined}
            onClick={() => toggleSort('price')}
          />
          <SortButton 
            label="Market Cap" 
            active={sortBy === 'marketCap'} 
            direction={sortBy === 'marketCap' ? sortDirection : undefined}
            onClick={() => toggleSort('marketCap')}
          />
          <SortButton 
            label="24h Change" 
            active={sortBy === 'change'} 
            direction={sortBy === 'change' ? sortDirection : undefined}
            onClick={() => toggleSort('change')}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
        {sortedAssets.map(asset => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
      
      {sortedAssets.length === 0 && (
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

export default AssetList;
