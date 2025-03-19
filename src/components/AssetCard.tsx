
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { AssetData } from '../types';
import { formatMarketCap, formatPrice, formatPercent } from '../lib/api';
import { ArrowDown, ArrowUp, Heart } from 'lucide-react';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useTheme } from '../contexts/ThemeContext';
import { useIsMobile } from '../hooks/use-mobile';

interface AssetCardProps {
  asset: AssetData;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const changePercent = parseFloat(asset.changePercent24Hr);
  const isPositive = changePercent > 0;
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [isHovered, setIsHovered] = useState(false);
  const [priceFlash, setPriceFlash] = useState<'none' | 'up' | 'down'>('none');
  const prevPriceRef = useRef(asset.priceUsd);
  const { isDark } = useTheme();
  const isMobile = useIsMobile();
  
  // Flash price on updates
  useEffect(() => {
    const currentPrice = parseFloat(asset.priceUsd);
    const prevPrice = parseFloat(prevPriceRef.current);
    
    if (prevPriceRef.current && currentPrice !== prevPrice) {
      setPriceFlash(currentPrice > prevPrice ? 'up' : 'down');
      const timer = setTimeout(() => setPriceFlash('none'), 800);
      return () => clearTimeout(timer);
    }
    
    prevPriceRef.current = asset.priceUsd;
  }, [asset.priceUsd]);
  
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
      className={`crypto-card group transition-all duration-200 ${isMobile ? 'p-3' : 'p-4'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`flex items-center justify-center ${isMobile ? 'w-8 h-8' : 'w-10 h-10'} rounded-full ${isDark ? 'bg-gray-800' : 'bg-gray-100'} font-mono text-sm mr-3`}>
            {asset.rank}
          </div>
          <div>
            <h3 className={`font-medium ${isMobile ? 'text-base' : 'text-lg'}`}>{asset.name}</h3>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{asset.symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono font-semibold ${isMobile ? 'text-base' : 'text-lg'} ${
            priceFlash === 'up' ? 'price-flash-up' : 
            priceFlash === 'down' ? 'price-flash-down' : ''
          }`}>
            {formatPrice(asset.priceUsd)}
          </div>
          <div className={`flex items-center justify-end ${isMobile ? 'text-xs' : 'text-sm'} ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <ArrowUp size={isMobile ? 12 : 14} /> : <ArrowDown size={isMobile ? 12 : 14} />}
            <span>{formatPercent(asset.changePercent24Hr)}</span>
          </div>
        </div>
      </div>
      <div className={`mt-3 pt-3 border-t ${isDark ? 'border-gray-700/30' : 'border-gray-200/50'} flex flex-wrap justify-between items-center gap-2`}>
        <div className={`${isMobile ? 'w-[45%]' : ''}`}>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Market Cap</div>
          <div className="font-mono text-sm truncate">{formatMarketCap(asset.marketCapUsd)}</div>
        </div>
        <div className={`text-right ${isMobile ? 'w-[45%]' : ''}`}>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>24h Volume</div>
          <div className="font-mono text-sm truncate">{formatMarketCap(asset.volumeUsd24Hr)}</div>
        </div>
        <button 
          onClick={toggleWatchlist}
          className={`ml-auto p-2 rounded-full ${isDark ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50'} transition-colors`}
          aria-label={isInWatchlist(asset.id) ? "Remove from watchlist" : "Add to watchlist"}
        >
          <Heart 
            size={18} 
            className="transition-transform duration-300 hover:scale-110"
            fill={isInWatchlist(asset.id) ? "#ff3b30" : "none"} 
            stroke={isInWatchlist(asset.id) ? "#ff3b30" : "currentColor"}
          />
        </button>
      </div>
    </Link>
  );
};

export default AssetCard;
