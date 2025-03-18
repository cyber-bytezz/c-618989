
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAsset, fetchAssetHistory, formatMarketCap, formatPercent, formatPrice } from '../lib/api';
import Header from '../components/Header';
import PriceChart from '../components/PriceChart';
import { ChevronLeft, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';

const AssetDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: assetData, isLoading: isAssetLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => fetchAsset(id!),
    enabled: !!id,
  });
  
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['assetHistory', id],
    queryFn: () => fetchAssetHistory(id!),
    enabled: !!id,
  });
  
  const asset = assetData?.data;
  const history = historyData?.data;
  const changePercent = asset ? parseFloat(asset.changePercent24Hr) : 0;
  const isPositive = changePercent > 0;
  
  return (
    <div className="min-h-screen bg-neo-gray">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8 animate-slide-up">
        <button 
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-sm font-medium hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={16} />
          <span>Back to all assets</span>
        </button>
        
        {isAssetLoading ? (
          <div className="space-y-4">
            <div className="h-20 bg-gray-100 rounded-xl animate-pulse-slow"></div>
            <div className="h-64 bg-gray-100 rounded-xl animate-pulse-slow"></div>
            <div className="h-40 bg-gray-100 rounded-xl animate-pulse-slow"></div>
          </div>
        ) : asset ? (
          <div className="space-y-6">
            <div className="neo-brutalist bg-white p-6 rounded-xl">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-neo-gray font-mono text-lg mr-4">
                    {asset.rank}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold">{asset.name}</h1>
                    <div className="text-xl text-gray-500 font-mono">{asset.symbol}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-3xl font-mono font-semibold">{formatPrice(asset.priceUsd)}</div>
                  <div className={`flex items-center justify-end text-lg ${isPositive ? 'text-neo-success' : 'text-neo-danger'}`}>
                    {isPositive ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                    <span>{formatPercent(asset.changePercent24Hr)}</span>
                    <span className="text-gray-500 text-sm ml-1">24h</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-3">Price Chart (7d)</h2>
              {isHistoryLoading ? (
                <div className="h-64 bg-gray-100 rounded-xl animate-pulse-slow"></div>
              ) : (
                <PriceChart 
                  data={history || []} 
                  color={isPositive ? '#34c759' : '#ff3b30'} 
                />
              )}
            </div>
            
            <div className="neo-brutalist bg-white rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4">Market Stats</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Market Cap</h3>
                  <div className="font-mono text-lg font-medium">{formatMarketCap(asset.marketCapUsd)}</div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">24h Volume</h3>
                  <div className="font-mono text-lg font-medium">{formatMarketCap(asset.volumeUsd24Hr)}</div>
                </div>
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">Circulating Supply</h3>
                  <div className="font-mono text-lg font-medium">
                    {parseFloat(asset.supply).toLocaleString()} {asset.symbol}
                  </div>
                </div>
                {asset.maxSupply && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Max Supply</h3>
                    <div className="font-mono text-lg font-medium">
                      {parseFloat(asset.maxSupply).toLocaleString()} {asset.symbol}
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm text-gray-500 mb-1">VWAP (24h)</h3>
                  <div className="font-mono text-lg font-medium">{formatPrice(asset.vwap24Hr)}</div>
                </div>
                {asset.explorer && (
                  <div>
                    <h3 className="text-sm text-gray-500 mb-1">Explorer</h3>
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
