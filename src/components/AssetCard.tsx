
import { Link } from 'react-router-dom';
import { AssetData } from '../types';
import { formatMarketCap, formatPrice, formatPercent } from '../lib/api';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface AssetCardProps {
  asset: AssetData;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const changePercent = parseFloat(asset.changePercent24Hr);
  const isPositive = changePercent > 0;
  
  return (
    <Link 
      to={`/asset/${asset.id}`}
      className="neo-brutalist-sm block bg-white rounded-xl p-4 hover:translate-y-[-2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-200"
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
      <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex justify-between">
        <div>
          <div className="text-xs text-gray-500">Market Cap</div>
          <div className="font-mono text-sm">{formatMarketCap(asset.marketCapUsd)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">24h Volume</div>
          <div className="font-mono text-sm">{formatMarketCap(asset.volumeUsd24Hr)}</div>
        </div>
      </div>
    </Link>
  );
};

export default AssetCard;
