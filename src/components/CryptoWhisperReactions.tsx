
import { useState, useEffect } from 'react';
import { Flame, Rocket, Frown, Diamond } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { toast } from 'sonner';

interface Reaction {
  emoji: string;
  count: number;
  icon: React.ReactNode;
  label: string;
}

interface ReactionStates {
  [key: string]: {
    [reactionType: string]: number;
    userReacted?: string;
  };
}

const CryptoWhisperReactions = ({ insightId }: { insightId: string }) => {
  const { isDark } = useTheme();
  const storageKey = `crypto-reactions-${insightId}`;
  
  // Initial reactions
  const initialReactions: Reaction[] = [
    { emoji: "🔥", count: Math.floor(Math.random() * 15), icon: <Flame size={16} className="text-red-500" />, label: "Fire" },
    { emoji: "🚀", count: Math.floor(Math.random() * 15), icon: <Rocket size={16} className="text-blue-500" />, label: "Moon" },
    { emoji: "😨", count: Math.floor(Math.random() * 15), icon: <Frown size={16} className="text-yellow-500" />, label: "Scared" },
    { emoji: "💎", count: Math.floor(Math.random() * 15), icon: <Diamond size={16} className="text-purple-500" />, label: "HODL" },
  ];
  
  const [reactions, setReactions] = useState(initialReactions);
  const [userReacted, setUserReacted] = useState<string | null>(null);
  
  // Load saved reaction state from localStorage on mount
  useEffect(() => {
    try {
      const savedReactions = localStorage.getItem('cryptoReactions');
      
      if (savedReactions) {
        const parsedReactions: ReactionStates = JSON.parse(savedReactions);
        
        if (parsedReactions[insightId]) {
          // Update counts from saved data
          const updatedReactions = reactions.map(reaction => ({
            ...reaction,
            count: parsedReactions[insightId][reaction.emoji] || reaction.count
          }));
          
          setReactions(updatedReactions);
          setUserReacted(parsedReactions[insightId].userReacted || null);
        }
      }
    } catch (error) {
      console.error('Error loading reactions:', error);
    }
  }, [insightId]);
  
  // Handle reaction click
  const handleReaction = (emoji: string) => {
    // Get current reactions from storage
    const savedReactions = localStorage.getItem('cryptoReactions') || '{}';
    const parsedReactions: ReactionStates = JSON.parse(savedReactions);
    
    // Initialize insight reactions if needed
    if (!parsedReactions[insightId]) {
      parsedReactions[insightId] = {};
      reactions.forEach(r => {
        parsedReactions[insightId][r.emoji] = r.count;
      });
    }
    
    // If user already reacted, toggle it off
    if (userReacted === emoji) {
      parsedReactions[insightId][emoji]--;
      parsedReactions[insightId].userReacted = undefined;
      setUserReacted(null);
      
      // Update UI
      setReactions(prev => 
        prev.map(r => r.emoji === emoji ? {...r, count: r.count - 1} : r)
      );
      
      toast.info("Reaction removed");
    } 
    // If user had a different reaction, switch to this one
    else if (userReacted) {
      parsedReactions[insightId][userReacted]--;
      parsedReactions[insightId][emoji]++;
      parsedReactions[insightId].userReacted = emoji;
      
      // Update UI
      setReactions(prev => 
        prev.map(r => {
          if (r.emoji === emoji) return {...r, count: r.count + 1};
          if (r.emoji === userReacted) return {...r, count: r.count - 1};
          return r;
        })
      );
      
      setUserReacted(emoji);
      toast.success("Reaction updated!");
    } 
    // First time reacting
    else {
      parsedReactions[insightId][emoji]++;
      parsedReactions[insightId].userReacted = emoji;
      
      // Update UI
      setReactions(prev => 
        prev.map(r => r.emoji === emoji ? {...r, count: r.count + 1} : r)
      );
      
      setUserReacted(emoji);
      toast.success("Reaction added!");
    }
    
    // Save to localStorage
    localStorage.setItem('cryptoReactions', JSON.stringify(parsedReactions));
    
    // Set expiration for reactions (24 hours)
    const expirationTime = Date.now() + 24 * 60 * 60 * 1000;
    localStorage.setItem('cryptoReactionsExpiration', expirationTime.toString());
  };
  
  // Clean up expired reactions
  useEffect(() => {
    const expirationTime = localStorage.getItem('cryptoReactionsExpiration');
    
    if (expirationTime && parseInt(expirationTime) < Date.now()) {
      localStorage.removeItem('cryptoReactions');
      localStorage.removeItem('cryptoReactionsExpiration');
    }
  }, []);
  
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {reactions.map(reaction => (
        <button
          key={reaction.emoji}
          onClick={() => handleReaction(reaction.emoji)}
          className={`flex items-center px-3 py-1.5 rounded-full text-xs transition-all ${
            userReacted === reaction.emoji 
              ? 'bg-neo-accent text-white' 
              : isDark 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-100 hover:bg-gray-200'
          }`}
          aria-label={`React with ${reaction.label}`}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span className="font-mono">{reaction.count}</span>
        </button>
      ))}
    </div>
  );
};

export default CryptoWhisperReactions;
