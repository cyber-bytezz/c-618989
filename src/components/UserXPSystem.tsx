
import { useState, useEffect } from 'react';
import { Trophy, Star, Rocket, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Progress } from '@/components/ui/progress';

interface XPRank {
  name: string;
  minXP: number;
  maxXP: number;
  icon: React.ReactNode;
  color: string;
}

const UserXPSystem = () => {
  const [userXP, setUserXP] = useState<number>(0);
  const { isDark } = useTheme();
  
  // XP Levels and ranks
  const xpRanks: XPRank[] = [
    { 
      name: "New Trader", 
      minXP: 0, 
      maxXP: 100, 
      icon: <Rocket size={16} className="text-blue-500" />,
      color: "bg-blue-500"
    },
    { 
      name: "Crypto Analyst", 
      minXP: 100, 
      maxXP: 500, 
      icon: <Star size={16} className="text-yellow-500" />,
      color: "bg-yellow-500"
    },
    { 
      name: "Market Guru", 
      minXP: 500, 
      maxXP: 1000, 
      icon: <Award size={16} className="text-purple-500" />,
      color: "bg-purple-500"
    },
  ];
  
  // Load XP from localStorage on mount
  useEffect(() => {
    const savedXP = localStorage.getItem('userXP');
    if (savedXP) {
      setUserXP(parseInt(savedXP));
    } else {
      // Start with some XP for demo
      const initialXP = Math.floor(Math.random() * 200);
      setUserXP(initialXP);
      localStorage.setItem('userXP', initialXP.toString());
    }
  }, []);
  
  // Get current rank
  const getCurrentRank = (): XPRank => {
    for (let i = xpRanks.length - 1; i >= 0; i--) {
      if (userXP >= xpRanks[i].minXP) {
        return xpRanks[i];
      }
    }
    return xpRanks[0];
  };
  
  const currentRank = getCurrentRank();
  const nextRank = xpRanks.find(rank => rank.minXP > userXP) || currentRank;
  
  // Calculate progress to next level
  const progressToNextLevel = () => {
    if (currentRank === nextRank) return 100; // Max level
    
    const xpInCurrentLevel = userXP - currentRank.minXP;
    const xpNeededForNextLevel = nextRank.minXP - currentRank.minXP;
    return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));
  };
  
  // Example function to add XP (would be called from other parts of the app)
  const addXP = (amount: number) => {
    const newXP = userXP + amount;
    setUserXP(newXP);
    localStorage.setItem('userXP', newXP.toString());
    
    // Check if leveled up
    const newRank = xpRanks.find(rank => newXP >= rank.minXP && userXP < rank.minXP);
    if (newRank) {
      // Show level-up toast
      console.log(`Leveled up to ${newRank.name}!`);
    }
  };
  
  // For demo purposes, allow clicking to gain XP
  const handleXPClick = () => {
    addXP(10);
  };
  
  return (
    <div 
      className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'} p-4 rounded-xl`}
      onClick={handleXPClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy size={18} className="text-neo-accent" />
        <h3 className="text-md font-semibold">Crypto XP</h3>
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentRank.color} text-white`}>
          {currentRank.icon}
        </div>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">{currentRank.name}</span>
            <span className="text-xs font-mono">{userXP} XP</span>
          </div>
          
          <Progress value={progressToNextLevel()} className="h-2" />
          
          {currentRank !== nextRank && (
            <div className="text-xs text-right mt-1 text-gray-500 dark:text-gray-400">
              {nextRank.minXP - userXP} XP to {nextRank.name}
            </div>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
        <p className="mb-1">How to earn XP:</p>
        <ul className="list-disc list-inside">
          <li>Make predictions (10 XP)</li>
          <li>React to market trends (5 XP)</li>
          <li>Correct predictions (50 XP)</li>
        </ul>
      </div>
    </div>
  );
};

export default UserXPSystem;
