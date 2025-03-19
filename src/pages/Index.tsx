import { useState } from 'react';
import Header from "../components/Header";
import AssetList from "../components/AssetList";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useRealTimeData } from "../hooks/useRealTimeData";
import { fetchAsset } from "../lib/api";
import AssetCard from "../components/AssetCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { TrendingUp, Zap } from "lucide-react";
import CryptoWhisper from "../components/CryptoWhisper";
import PanicMeter from "../components/PanicMeter";
import UserXPSystem from "../components/UserXPSystem";
import MarketPredictions from "../components/MarketPredictions";
import HODLSentiment from "../components/HODLSentiment";
import { useTheme } from "../contexts/ThemeContext";

const Index = () => {
  const [showWatchlist, setShowWatchlist] = useState(false);
  const { watchlist } = useWatchlist();
  const { isDark } = useTheme();
  
  const { data: watchlistData, isLoading: watchlistLoading } = useRealTimeData(
    ['watchlist', ...watchlist], 
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
    <div className={`min-h-screen ${isDark ? 'dark bg-gradient-to-br from-gray-900 to-gray-950' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <Header />
      <main className="animate-slide-up px-4 md:px-6">
        <div className="pt-6 pb-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-blue-500 text-white p-2 rounded-xl mr-3 shadow-lg">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Crypto Tracker</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-4 text-sm">
            Track, analyze and predict cryptocurrency markets in real-time
          </p>
          
          <div className="flex justify-center space-x-3 mb-3">
            <button
              onClick={() => setShowWatchlist(false)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                !showWatchlist 
                  ? 'bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/20 dark:border-gray-700/30 shadow-md' 
                  : 'hover:bg-white/5 dark:hover:bg-gray-800/20'
              }`}
            >
              All Assets
            </button>
            <button
              onClick={() => setShowWatchlist(true)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center ${
                showWatchlist 
                  ? 'bg-white/10 dark:bg-gray-800/40 backdrop-blur-md border border-gray-200/20 dark:border-gray-700/30 shadow-md' 
                  : 'hover:bg-white/5 dark:hover:bg-gray-800/20'
              }`}
              disabled={watchlist.length === 0}
            >
              Watchlist
              {watchlist.length > 0 && (
                <span className="ml-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {watchlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CryptoWhisper />
            
            <PanicMeter />
            
            {showWatchlist ? (
              <div className="mt-4">
                {watchlist.length === 0 ? (
                  <div className="modern-card p-6 text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Your watchlist is empty</p>
                    <button
                      onClick={() => setShowWatchlist(false)}
                      className="modern-button"
                    >
                      Browse Assets
                    </button>
                  </div>
                ) : watchlistLoading ? (
                  <div className="grid grid-cols-1 gap-4">
                    <LoadingSkeleton count={watchlist.length} variant="card" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 animate-fade-in">
                    {watchlistData?.map(asset => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4">
                <AssetList />
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            <HODLSentiment />
            
            <MarketPredictions />
            
            <UserXPSystem />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
