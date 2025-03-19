
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchlistComment {
  id: string;
  assetId: string;
  text: string;
  timestamp: number;
}

interface WatchlistContextType {
  watchlist: string[];
  globalMostWatched: { id: string; count: number }[];
  comments: WatchlistComment[];
  addToWatchlist: (assetId: string) => void;
  removeFromWatchlist: (assetId: string) => void;
  isInWatchlist: (assetId: string) => boolean;
  addComment: (assetId: string, text: string) => void;
  getCommentsForAsset: (assetId: string) => WatchlistComment[];
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

// Simulate global most-watched data (in a real app, this would come from a server)
const MOCK_GLOBAL_MOST_WATCHED = [
  { id: 'bitcoin', count: 1532 },
  { id: 'ethereum', count: 978 },
  { id: 'solana', count: 645 },
  { id: 'cardano', count: 423 },
  { id: 'xrp', count: 312 },
  { id: 'polkadot', count: 287 },
  { id: 'dogecoin', count: 265 },
  { id: 'avalanche', count: 214 },
  { id: 'litecoin', count: 189 },
  { id: 'chainlink', count: 154 }
];

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [comments, setComments] = useState<WatchlistComment[]>([]);
  const [globalMostWatched, setGlobalMostWatched] = useState(MOCK_GLOBAL_MOST_WATCHED);

  useEffect(() => {
    // Load watchlist from localStorage on component mount
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
    
    // Load comments from localStorage
    const savedComments = localStorage.getItem('watchlist_comments');
    if (savedComments) {
      setComments(JSON.parse(savedComments));
    }
  }, []);

  useEffect(() => {
    // Save watchlist to localStorage whenever it changes
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    
    // Update simulated global most-watched
    // In a real app, this would be a server update
    if (watchlist.length > 0) {
      const updatedMostWatched = [...globalMostWatched];
      watchlist.forEach(assetId => {
        const existingIndex = updatedMostWatched.findIndex(item => item.id === assetId);
        if (existingIndex >= 0) {
          updatedMostWatched[existingIndex].count += 1;
        } else {
          updatedMostWatched.push({ id: assetId, count: 1 });
        }
      });
      
      // Sort by count and limit to top 10
      updatedMostWatched.sort((a, b) => b.count - a.count);
      setGlobalMostWatched(updatedMostWatched.slice(0, 10));
    }
  }, [watchlist]);

  useEffect(() => {
    // Save comments to localStorage
    localStorage.setItem('watchlist_comments', JSON.stringify(comments));
  }, [comments]);

  const addToWatchlist = (assetId: string) => {
    setWatchlist(prev => [...prev, assetId]);
  };

  const removeFromWatchlist = (assetId: string) => {
    setWatchlist(prev => prev.filter(id => id !== assetId));
  };

  const isInWatchlist = (assetId: string) => {
    return watchlist.includes(assetId);
  };
  
  const addComment = (assetId: string, text: string) => {
    const newComment: WatchlistComment = {
      id: Date.now().toString(),
      assetId,
      text,
      timestamp: Date.now(),
    };
    
    setComments(prev => [...prev, newComment]);
  };
  
  const getCommentsForAsset = (assetId: string) => {
    return comments.filter(comment => comment.assetId === assetId);
  };

  return (
    <WatchlistContext.Provider 
      value={{ 
        watchlist, 
        globalMostWatched,
        comments,
        addToWatchlist, 
        removeFromWatchlist, 
        isInWatchlist,
        addComment,
        getCommentsForAsset
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = () => {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error('useWatchlist must be used within a WatchlistProvider');
  }
  return context;
};
