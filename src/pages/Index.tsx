
import { useState } from 'react';
import Header from "../components/Header";
import AssetList from "../components/AssetList";
import { useWatchlist } from "../contexts/WatchlistContext";
import { useRealTimeData } from "../hooks/useRealTimeData";
import { fetchAsset } from "../lib/api";
import AssetCard from "../components/AssetCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import { Zap } from "lucide-react";
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
  
  // Fetch data for watchlist assets with real-time updates
  const { data: watchlistData, isLoading: watchlistLoading } = useRealTimeData(
    ['watchlist', ...watchlist], // Spread the watchlist array into the queryKey array
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
    <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-neo-gray'}`}>
      <Header />
      <main className="animate-slide-up">
        <div className="pt-8 pb-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-neo-black text-white p-3 rounded-xl mr-3 shadow-[5px_5px_0px_0px_rgba(0,113,227,1)]">
              <Zap size={30} className="text-neo-accent animate-pulse-slow" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Crypto Asset Tracker</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6">
            Track top cryptocurrencies ranked by market cap
          </p>
          
          <div className="flex justify-center space-x-3 mb-3">
            <button
              onClick={() => setShowWatchlist(false)}
              className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 ${
                !showWatchlist 
                  ? 'neo-brutalist bg-white dark:bg-gray-800 dark:text-white transform -translate-y-1' 
                  : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
              }`}
            >
              All Assets
            </button>
            <button
              onClick={() => setShowWatchlist(true)}
              className={`px-5 py-2 rounded-xl font-medium transition-all duration-200 flex items-center ${
                showWatchlist 
                  ? 'neo-brutalist bg-white dark:bg-gray-800 dark:text-white transform -translate-y-1' 
                  : 'hover:bg-white/50 dark:hover:bg-gray-800/50'
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
        
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
          <div className="md:col-span-2">
            {/* Crypto Whisper Component */}
            <CryptoWhisper />
            
            {/* Panic Meter - Only shows during significant drops */}
            <PanicMeter />
            
            {showWatchlist ? (
              <div className="mt-6">
                {watchlist.length === 0 ? (
                  <div className="neo-brutalist bg-white dark:bg-gray-800 dark:text-white p-6 rounded-xl text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">Your watchlist is empty</p>
                    <button
                      onClick={() => setShowWatchlist(false)}
                      className="px-5 py-2 bg-neo-black text-white rounded-xl font-medium"
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
              <div className="mt-6">
                <AssetList />
              </div>
            )}
          </div>
          
          <div className="space-y-6">
            {/* User XP System */}
            <UserXPSystem />
            
            {/* HODL vs Sell Sentiment */}
            <HODLSentiment />
            
            {/* Market Predictions */}
            <MarketPredictions />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
