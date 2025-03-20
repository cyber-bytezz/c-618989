
import React, { useState, useEffect } from 'react';
import { ReactionType } from '../types';

// Initialize reactions with the correct type mapping
type ReactionCounts = {
  [key in ReactionType]: number;
};

const defaultReactions: ReactionCounts = {
  fire: 0,
  rocket: 0,
  diamond: 0,
  nervous: 0
};

interface CryptoWhisperReactionsProps {
  onReaction?: (reaction: ReactionType) => void;
  userReacted?: { [key in ReactionType]?: boolean };
  reactionCounts?: ReactionCounts;
  insightId?: string;
}

const CryptoWhisperReactions: React.FC<CryptoWhisperReactionsProps> = ({ 
  onReaction, 
  userReacted = {}, 
  reactionCounts = defaultReactions,
  insightId 
}) => {
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);
  const [localCounts, setLocalCounts] = useState<ReactionCounts>(reactionCounts);

  // Update local counts when prop changes
  useEffect(() => {
    if (reactionCounts) {
      setLocalCounts(reactionCounts);
    }
  }, [reactionCounts]);

  const handleReaction = (reaction: ReactionType) => {
    setActiveReaction(reaction);
    if (onReaction) {
      onReaction(reaction);
    } else {
      // When no onReaction handler is provided, update local counts
      setLocalCounts(prev => ({
        ...prev,
        [reaction]: prev[reaction] + 1
      }));
    }
  };

  return (
    <div className="flex justify-around items-center p-2 mt-2">
      <button
        onClick={() => handleReaction('fire')}
        className={`reaction-button p-1.5 rounded-full transition-all ${userReacted?.fire ? 'bg-red-100 dark:bg-red-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
        aria-label="Fire reaction"
      >
        <span className="text-lg">🔥</span> <span className="text-sm font-medium">{localCounts.fire}</span>
      </button>
      <button
        onClick={() => handleReaction('rocket')}
        className={`reaction-button p-1.5 rounded-full transition-all ${userReacted?.rocket ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
        aria-label="Rocket reaction"
      >
        <span className="text-lg">🚀</span> <span className="text-sm font-medium">{localCounts.rocket}</span>
      </button>
      <button
        onClick={() => handleReaction('diamond')}
        className={`reaction-button p-1.5 rounded-full transition-all ${userReacted?.diamond ? 'bg-purple-100 dark:bg-purple-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
        aria-label="Diamond reaction"
      >
        <span className="text-lg">💎</span> <span className="text-sm font-medium">{localCounts.diamond}</span>
      </button>
      <button
        onClick={() => handleReaction('nervous')}
        className={`reaction-button p-1.5 rounded-full transition-all ${userReacted?.nervous ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-800/30'}`}
        aria-label="Nervous reaction"
      >
        <span className="text-lg">😨</span> <span className="text-sm font-medium">{localCounts.nervous}</span>
      </button>
    </div>
  );
};

export default CryptoWhisperReactions;
