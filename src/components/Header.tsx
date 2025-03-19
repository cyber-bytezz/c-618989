
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext';
import { Heart, Menu } from 'lucide-react';
import { useState } from 'react';
import { useIsMobile } from '../hooks/use-mobile';

const Header = () => {
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="px-3 sm:px-6 py-3 sm:py-4 backdrop-blur-lg bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-lg sm:text-xl font-semibold tracking-tight flex items-center transition duration-300 hover:opacity-70"
        >
          <span className="bg-neo-black text-white px-2 py-1 mr-2 rounded-md">
            COIN
          </span>
          <span className="hidden sm:inline">TRACKER</span>
        </button>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex items-center">
            <Heart size={isMobile ? 14 : 16} className="text-neo-danger mr-1" fill="#ff3b30" />
            <span className="text-xs sm:text-sm font-medium">{watchlist.length}</span>
          </div>
          {!isMobile && (
            <div className="text-xs font-medium px-3 py-1 rounded-full bg-neo-gray text-neo-black">
              Powered by CoinCap API
            </div>
          )}
          {isMobile && (
            <button 
              className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={18} />
            </button>
          )}
        </div>
      </div>
      
      {isMobile && menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-2 px-4 flex flex-col space-y-2 animate-slide-up">
          <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-neo-gray text-neo-black self-center">
            Powered by CoinCap API
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
