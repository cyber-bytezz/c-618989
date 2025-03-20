
import React from 'react';
import { ReactionType, UserReactions, InsightReactions } from '../types';

interface CryptoWhisperReactionsProps {
  onReaction: (reaction: ReactionType) => void;
  userReacted?: {
    fire?: boolean;
    rocket?: boolean;
    diamond?: boolean;
    nervous?: boolean;
  };
  reactionCounts?: {
    fire: number;
    rocket: number;
    diamond: number;
    nervous: number;
  };
}

const CryptoWhisperReactions: React.FC<CryptoWhisperReactionsProps> = ({ 
  onReaction, 
  userReacted = {}, 
  reactionCounts = { fire: 0, rocket: 0, diamond: 0, nervous: 0 } 
}) => {
  const reactions = [
    { type: 'fire' as ReactionType, emoji: '🔥', label: 'Hot' },
    { type: 'rocket' as ReactionType, emoji: '🚀', label: 'Moon' },
    { type: 'diamond' as ReactionType, emoji: '💎', label: 'HODL' },
    { type: 'nervous' as ReactionType, emoji: '😬', label: 'Risky' },
  ];
  
  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">React:</div>
      <div className="flex space-x-2">
        {reactions.map(reaction => (
          <button
            key={reaction.type}
            onClick={() => !userReacted?.[reaction.type] && onReaction(reaction.type)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-colors ${
              userReacted?.[reaction.type]
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            disabled={!!userReacted?.[reaction.type]}
          >
            <span>{reaction.emoji}</span>
            <span className="font-medium">{reactionCounts?.[reaction.type] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CryptoWhisperReactions;
