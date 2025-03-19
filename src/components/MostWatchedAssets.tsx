
import { useWatchlist } from "../contexts/WatchlistContext";
import { useQuery } from "@tanstack/react-query";
import { fetchAsset } from "../lib/api";
import { Link } from "react-router-dom";
import { Heart, TrendingUp } from "lucide-react";
import LoadingSkeleton from "./LoadingSkeleton";

const MostWatchedAssets = () => {
  const { globalMostWatched } = useWatchlist();
  
  // Fetch data for top 5 most watched assets
  const { data, isLoading } = useQuery({
    queryKey: ['most-watched-assets'],
    queryFn: async () => {
      const top5 = globalMostWatched.slice(0, 5);
      const assetPromises = top5.map(item => fetchAsset(item.id));
      const results = await Promise.all(assetPromises);
      
      return top5.map((item, index) => ({
        ...results[index].data,
        watchCount: item.count
      }));
    },
    enabled: globalMostWatched.length > 0,
  });
  
  if (isLoading) {
    return <LoadingSkeleton variant="card" />;
  }
  
  if (!data || data.length === 0) {
    return null;
  }
  
  return (
    <div className="neo-brutalist-sm bg-white p-4 rounded-xl dark:bg-gray-800 dark:text-white">
      <div className="flex items-center mb-3">
        <TrendingUp size={18} className="mr-2 text-neo-accent" />
        <h3 className="text-lg font-semibold">Most Watched Assets</h3>
      </div>
      
      <div className="space-y-3">
        {data.map(asset => (
          <Link 
            key={asset.id}
            to={`/asset/${asset.id}`}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors dark:hover:bg-gray-700"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-neo-gray flex items-center justify-center mr-2 font-mono text-sm">
                {asset.rank}
              </div>
              <div>
                <div className="font-medium">{asset.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{asset.symbol}</div>
              </div>
            </div>
            <div className="flex items-center">
              <div className="text-right mr-3">
                <div className="font-mono">${parseFloat(asset.priceUsd).toFixed(2)}</div>
                <div className={`text-xs ${parseFloat(asset.changePercent24Hr) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(asset.changePercent24Hr) >= 0 ? '+' : ''}{parseFloat(asset.changePercent24Hr).toFixed(2)}%
                </div>
              </div>
              <div className="flex items-center text-red-500">
                <Heart size={14} fill="currentColor" />
                <span className="text-xs ml-1">{asset.watchCount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MostWatchedAssets;
