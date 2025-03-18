
import { useNavigate } from 'react-router-dom';
import { useWatchlist } from '../contexts/WatchlistContext';
import { Heart } from 'lucide-react';

const Header = () => {
  const navigate = useNavigate();
  const { watchlist } = useWatchlist();

  return (
    <header className="px-6 py-4 backdrop-blur-lg bg-white/80 border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <button
          onClick={() => navigate('/')}
          className="text-xl font-semibold tracking-tight flex items-center transition duration-300 hover:opacity-70"
        >
          <span className="bg-neo-black text-white px-2 py-1 mr-2 rounded-md">
            COIN
          </span>
          <span>TRACKER</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Heart size={16} className="text-neo-danger mr-1" fill="#ff3b30" />
            <span className="text-sm font-medium">{watchlist.length}</span>
          </div>
          <div className="text-xs font-medium px-3 py-1 rounded-full bg-neo-gray text-neo-black">
            Powered by CoinCap API
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
