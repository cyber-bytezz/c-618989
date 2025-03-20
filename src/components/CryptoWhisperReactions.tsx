
import React from 'react';
import { ReactionType, UserReactions, InsightReactions } from '../types';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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
    { type: 'fire' as ReactionType, emoji: '🔥', label: 'Hot', description: 'This insight is on fire!' },
    { type: 'rocket' as ReactionType, emoji: '🚀', label: 'Moon', description: 'To the moon!' },
    { type: 'diamond' as ReactionType, emoji: '💎', label: 'HODL', description: 'Diamond hands, holding strong!' },
    { type: 'nervous' as ReactionType, emoji: '😬', label: 'Risky', description: 'This seems risky...' },
  ];
  
  const handleReaction = (reaction: ReactionType) => {
    if (userReacted?.[reaction]) {
      // User already reacted with this reaction
      toast.info("You've already reacted with this emoji");
      return;
    }
    
    // Show a small toast when user reacts
    const reactionInfo = reactions.find(r => r.type === reaction);
    if (reactionInfo) {
      toast.success(`${reactionInfo.emoji} ${reactionInfo.description}`);
    }
    
    onReaction(reaction);
  };
  
  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 dark:text-gray-400">React:</div>
      <div className="flex space-x-2">
        {reactions.map(reaction => (
          <motion.button
            key={reaction.type}
            onClick={() => handleReaction(reaction.type)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-colors ${
              userReacted?.[reaction.type]
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            disabled={!!userReacted?.[reaction.type]}
            whileHover={{ scale: userReacted?.[reaction.type] ? 1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="relative"
              animate={userReacted?.[reaction.type] ? { 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0],
                transition: { repeat: 0, duration: 0.5 }
              } : {}}
            >
              <span>{reaction.emoji}</span>
              {userReacted?.[reaction.type] && (
                <motion.div 
                  className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                />
              )}
            </motion.div>
            <motion.div 
              className="font-medium flex items-center space-x-1"
              animate={userReacted?.[reaction.type] ? { 
                scale: [1, 1.1, 1],
                transition: { repeat: 0, duration: 0.5 }
              } : {}}
            >
              <motion.span
                key={reactionCounts?.[reaction.type] || 0}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {reactionCounts?.[reaction.type] || 0}
              </motion.span>
            </motion.div>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default CryptoWhisperReactions;
