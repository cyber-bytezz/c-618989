
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { AssetData } from '../types';
import { formatMarketCap, formatPrice, formatPercent } from '../lib/api';
import { ArrowDown, ArrowUp, Heart } from 'lucide-react';
import { useWatchlist } from '../contexts/WatchlistContext';
import { useTheme } from '../contexts/ThemeContext';

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
      className={`neo-brutalist-sm group block ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-4 hover:translate-y-[-2px] transition-all duration-200`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? 'translateY(-2px) rotate(0.5deg)' : 'translateY(0) rotate(0deg)',
        boxShadow: isHovered 
          ? isDark 
            ? '6px 6px 0px 0px rgba(0,113,227,1)' 
            : '6px 6px 0px 0px rgba(0,0,0,1)' 
          : isDark 
            ? '2px 2px 0px 0px rgba(0,113,227,1)' 
            : '2px 2px 0px 0px rgba(0,0,0,1)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${isDark ? 'bg-gray-700' : 'bg-neo-gray'} font-mono text-sm mr-3`}>
            {asset.rank}
          </div>
          <div>
            <h3 className="font-medium text-lg">{asset.name}</h3>
            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{asset.symbol}</div>
          </div>
        </div>
        <div className="text-right">
          <div className={`font-mono font-semibold text-lg ${
            priceFlash === 'up' ? 'price-flash-up' : 
            priceFlash === 'down' ? 'price-flash-down' : ''
          }`}>
            {formatPrice(asset.priceUsd)}
          </div>
          <div className={`flex items-center justify-end text-sm ${isPositive ? 'text-neo-success' : 'text-neo-danger'}`}>
            {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            <span>{formatPercent(asset.changePercent24Hr)}</span>
          </div>
        </div>
      </div>
      <div className={`mt-3 pt-3 border-t border-dashed ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
        <div>
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Market Cap</div>
          <div className="font-mono text-sm">{formatMarketCap(asset.marketCapUsd)}</div>
        </div>
        <div className="text-right">
          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>24h Volume</div>
          <div className="font-mono text-sm">{formatMarketCap(asset.volumeUsd24Hr)}</div>
        </div>
        <button 
          onClick={toggleWatchlist}
          className={`ml-2 p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
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
