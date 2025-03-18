
import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (assetId: string) => void;
  removeFromWatchlist: (assetId: string) => void;
  isInWatchlist: (assetId: string) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export const WatchlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    // Load watchlist from localStorage on component mount
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist));
    }
  }, []);

  useEffect(() => {
    // Save watchlist to localStorage whenever it changes
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = (assetId: string) => {
    setWatchlist(prev => [...prev, assetId]);
  };

  const removeFromWatchlist = (assetId: string) => {
    setWatchlist(prev => prev.filter(id => id !== assetId));
  };

  const isInWatchlist = (assetId: string) => {
    return watchlist.includes(assetId);
  };

  return (
    <WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist }}>
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
