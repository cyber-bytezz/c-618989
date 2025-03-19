
import { useState } from 'react';
import { useWatchlist } from "../contexts/WatchlistContext";
import { MessageSquare, Send } from 'lucide-react';

interface AssetCommentProps {
  assetId: string;
  className?: string;
}

const AssetComment = ({ assetId, className = "" }: AssetCommentProps) => {
  const { addComment, getCommentsForAsset } = useWatchlist();
  const [newComment, setNewComment] = useState('');
  const comments = getCommentsForAsset(assetId);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addComment(assetId, newComment);
      setNewComment('');
    }
  };
  
  return (
    <div className={`neo-brutalist-sm bg-white p-4 rounded-xl dark:bg-gray-800 dark:text-white ${className}`}>
      <div className="flex items-center mb-3">
        <MessageSquare size={18} className="mr-2 text-neo-accent" />
        <h3 className="text-lg font-semibold">Comments</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex">
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Add your comment..."
            className="flex-1 py-2 px-3 rounded-l-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neo-accent dark:bg-gray-700 dark:border-gray-600"
          />
          <button
            type="submit"
            className="bg-neo-accent text-white py-2 px-4 rounded-r-lg hover:bg-neo-accent/90 transition-colors"
            disabled={!newComment.trim()}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
      
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg dark:bg-gray-700">
              <div className="text-sm">{comment.text}</div>
              <div className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                {new Date(comment.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-3 text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
};

export default AssetComment;
