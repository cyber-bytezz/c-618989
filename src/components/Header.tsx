
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext';
import { Heart, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/use-mobile';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { isDark } = useTheme();
  
  // Close menu on resize to desktop
  useEffect(() => {
    if (!isMobile && menuOpen) {
      setMenuOpen(false);
    }
  }, [isMobile, menuOpen]);

  return (
    <header className={`px-3 sm:px-6 py-3 sm:py-4 glass-card sticky top-0 z-10 ${isDark ? 'dark:bg-gray-900/80' : 'bg-white/80'} backdrop-blur-lg border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
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
          <div className="flex items-center p-1.5 rounded-full bg-red-100 dark:bg-red-900/30">
            <Heart size={isMobile ? 14 : 16} className="text-red-500 mr-1" fill="#f43f5e" />
            <span className="text-xs sm:text-sm font-medium pr-1">{watchlist.length}</span>
          </div>
          
          {!isMobile && (
            <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-neo-gray text-neo-black">
              Powered by CoinCap API
            </div>
          )}
          
          {isMobile && (
            <button 
              className={`p-1.5 rounded-md transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </div>
      
      {isMobile && menuOpen && (
        <div className={`absolute top-full left-0 right-0 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b py-2 px-4 flex flex-col space-y-2 animate-slide-in shadow-lg`}>
          <div className="text-xs font-medium px-3 py-1.5 rounded-full bg-neo-gray text-neo-black self-center">
            Powered by CoinCap API
          </div>
          <button 
            onClick={() => {
              navigate('/');
              setMenuOpen(false);
            }}
            className="text-left py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          >
            Home
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
