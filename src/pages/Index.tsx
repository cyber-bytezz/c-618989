
import { useState } from 'react';
import Header from "../components/Header";
import AssetList from "../components/AssetList";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useRealTimeData } from "../hooks/useRealTimeData";
import { fetchAsset } from "../lib/api";
import AssetCard from "../components/AssetCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { Zap } from "lucide-react";

const Index = () => {
  const [showWatchlist, setShowWatchlist] = useState(false);
  const { watchlist } = useWatchlist();
  
  // Fetch data for watchlist assets with real-time updates
  const { data: watchlistData, isLoading: watchlistLoading } = useRealTimeData(
    ['watchlist', watchlist],
    async () => {
      if (watchlist.length === 0) return [];
      
      const promises = watchlist.map(id => fetchAsset(id));
      const results = await Promise.all(promises);
      return results.map(result => result.data);
    },
    {
      enabled: watchlist.length > 0 && showWatchlist,
      pollingInterval: 30000, // 30 seconds
    }
  );
  
  return (
    <div className="min-h-screen bg-neo-gray">
      <Header />
      <main className="animate-slide-up">
        <div className="pt-8 pb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-neo-black text-white p-3 rounded-xl mr-3 shadow-[5px_5px_0px_0px_rgba(0,113,227,1)]">
              <Zap size={30} className="text-neo-accent animate-pulse-slow" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Crypto Asset Tracker</h1>
          </div>
          <p className="text-gray-600 max-w-lg mx-auto mb-6">
            Track top cryptocurrencies ranked by market cap
          </p>
          
          <div className="flex justify-center space-x-3 mb-3">
            <button
              onClick={() => setShowWatchlist(false)}
              className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
                !showWatchlist 
                  ? 'neo-brutalist bg-white transform -translate-y-1' 
                  : 'hover:bg-white/50'
              }`}
            >
              All Assets
            </button>
            <button
              onClick={() => setShowWatchlist(true)}
              className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 flex items-center ${
                showWatchlist 
                  ? 'neo-brutalist bg-white transform -translate-y-1' 
                  : 'hover:bg-white/50'
              }`}
              disabled={watchlist.length === 0}
            >
              Watchlist
              {watchlist.length > 0 && (
                <span className="ml-2 bg-neo-black text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {showWatchlist ? (
          <div className="max-w-4xl mx-auto py-4 px-4">
            {watchlist.length === 0 ? (
              <div className="neo-brutalist bg-white p-6 rounded-xl text-center">
                <p className="text-gray-600 mb-4">Your watchlist is empty</p>
                <button
                  onClick={() => setShowWatchlist(false)}
                  className="px-5 py-2 bg-neo-black text-white rounded-xl font-medium"
                >
                  Browse Assets
                </button>
              </div>
            ) : watchlistLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LoadingSkeleton count={watchlist.length} variant="card" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                {watchlistData?.map(asset => (
                  <AssetCard key={asset.id} asset={asset} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <AssetList />
        )}
      </main>
    </div>
  );
};

export default Index;
