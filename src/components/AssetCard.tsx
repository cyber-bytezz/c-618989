
import { Link } from 'react-router-dom';
import { AssetData } from '../types';
import { formatMarketCap, formatPrice, formatPercent } from '../lib/api';
import { ArrowDown, ArrowUp, Heart } from 'lucide-react';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useState } from 'react';

interface AssetCardProps {
  asset: AssetData;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const changePercent = parseFloat(asset.changePercent24Hr);
  const isPositive = changePercent > 0;
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isHovered, setIsHovered] = useState(false);
  
  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWatchlist(asset.id)) {
      removeFromWatchlist(asset.id);
    } else {
      addToWatchlist(asset.id);
    }
  };
  
  return (
    <Link 
      to={`/asset/${asset.id}`}
      className="neo-brutalist-sm group block bg-white rounded-xl p-4 hover:translate-y-[-2px] transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-2px) rotate(0.5deg)' : 'translateY(0) rotate(0deg)',
        boxShadow: isHovered ? '6px 6px 0px 0px rgba(0,0,0,1)' : '2px 2px 0px 0px rgba(0,0,0,1)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-neo-gray font-mono text-sm mr-3">
            {asset.rank}
          </div>
          <div>
            <h3 className="font-medium text-lg">{asset.name}</h3>
            <div className="text-sm text-gray-500">{asset.symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono font-semibold text-lg">{formatPrice(asset.priceUsd)}</div>
          <div className={`flex items-center justify-end text-sm ${isPositive ? 'text-neo-success' : 'text-neo-danger'}`}>
            {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span>{formatPercent(asset.changePercent24Hr)}</span>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-between items-center">
        <div>
          <div className="text-xs text-gray-500">Market Cap</div>
          <div className="font-mono text-sm">{formatMarketCap(asset.marketCapUsd)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">24h Volume</div>
          <div className="font-mono text-sm">{formatMarketCap(asset.volumeUsd24Hr)}</div>
        </div>
        <button 
          onClick={toggleWatchlist}
          className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <Heart 
            size={18} 
            fill={isInWatchlist(asset.id) ? "#ff3b30" : "none"} 
            stroke={isInWatchlist(asset.id) ? "#ff3b30" : "currentColor"}
          />
        </button>
      </div>
    </Link>
  );
};

export default AssetCard;
