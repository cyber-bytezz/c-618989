// Fix the userReacted type error by ensuring it returns a number for the string index
const reactions = {
  fire: 0,
  rocket: 0,
  diamond: 0,
  nervous: 0
};

// Set the correct type for tracking user reactions
export type ReactionType = 'fire' | 'rocket' | 'diamond' | 'nervous';

// Initialize reactionCounts with the correct type mapping
type ReactionCounts = {
  [key in ReactionType]: number;
};

// Use the fixed types
import React, { useState } from 'react';

interface CryptoWhisperReactionsProps {
  onReaction: (reaction: ReactionType) => void;
  userReacted: { [key in ReactionType]?: boolean };
  reactionCounts: ReactionCounts;
}

const CryptoWhisperReactions: React.FC<CryptoWhisperReactionsProps> = ({ onReaction, userReacted, reactionCounts }) => {
  const [activeReaction, setActiveReaction] = useState<ReactionType | null>(null);

  const handleReaction = (reaction: ReactionType) => {
    setActiveReaction(reaction);
    onReaction(reaction);
  };

  return (
    <div className="flex justify-around items-center p-2">
      <button
        onClick={() => handleReaction('fire')}
        className={`reaction-button ${userReacted?.fire ? 'active' : ''}`}
      >
        🔥 {reactionCounts.fire}
      </button>
      <button
        onClick={() => handleReaction('rocket')}
        className={`reaction-button ${userReacted?.rocket ? 'active' : ''}`}
      >
        🚀 {reactionCounts.rocket}
      </button>
      <button
        onClick={() => handleReaction('diamond')}
        className={`reaction-button ${userReacted?.diamond ? 'active' : ''}`}
      >
        💎 {reactionCounts.diamond}
      </button>
      <button
        onClick={() => handleReaction('nervous')}
        className={`reaction-button ${userReacted?.nervous ? 'active' : ''}`}
      >
        😨 {reactionCounts.nervous}
      </button>
    </div>
  );
};

export default CryptoWhisperReactions;
