
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RefreshTimerProps {
  lastUpdated: number;
  pollingInterval: number;
  className?: string;
}

const RefreshTimer = ({ lastUpdated, pollingInterval, className = "" }: RefreshTimerProps) => {
  const [timeAgo, setTimeAgo] = useState('');
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    // Update time ago text and progress bar
    const intervalId = setInterval(() => {
      const now = Date.now();
      const secondsAgo = Math.floor((now - lastUpdated) / 1000);
      
      // Format the time ago text
      if (secondsAgo < 60) {
        setTimeAgo(`${secondsAgo}s ago`);
      } else {
        const minutesAgo = Math.floor(secondsAgo / 60);
        setTimeAgo(`${minutesAgo}m ago`);
      }
      
      // Calculate progress (100% when just updated, 0% when next update is due)
      const elapsedMs = now - lastUpdated;
      const remainingPercent = Math.max(0, 100 - (elapsedMs / pollingInterval) * 100);
      setProgress(remainingPercent);
      
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [lastUpdated, pollingInterval]);
  
  return (
    <div className={`flex items-center ${className}`}>
      <Clock size={14} className="mr-1 text-gray-500" />
      <div className="text-xs text-gray-500">
        Updated {timeAgo}
      </div>
      <div className="ml-2 w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-neo-accent transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default RefreshTimer;
