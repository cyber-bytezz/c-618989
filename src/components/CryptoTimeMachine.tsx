
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AssetData } from '../types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, subHours, startOfHour, addHours } from 'date-fns';
import { motion } from 'framer-motion';

// Sample historical price data (in a real app, this would come from an API)
const generateSampleHistoricalData = (days: number, volatility: number) => {
  const data = [];
  const startDate = subDays(new Date(), days);
  let price = 50000 + (Math.random() * 10000);
  
  for (let i = 0; i < days * 24; i++) {
    const date = addHours(startDate, i);
    // More dramatic price changes for certain periods to simulate crashes/rallies
    const priceMovePercent = (Math.random() - 0.5) * volatility * 
      (i % 72 < 12 ? 3 : i % 48 < 8 ? 2 : 1); // Periods of high volatility
    
    price = price * (1 + priceMovePercent / 100);
    
    if (price < 10000) price = 10000; // Floor
    
    data.push({
      timestamp: date.getTime(),
      date: format(date, 'MMM dd HH:mm'),
      price: price
    });
  }
  
  return data;
};

// Sample market events
const marketEvents = [
  {
    date: subDays(new Date(), 30),
    event: "Bitcoin ETF approval rumors caused a market rally"
  },
  {
    date: subDays(new Date(), 25),
    event: "Major exchange announced security breach, market dropped 12%"
  },
  {
    date: subDays(new Date(), 18),
    event: "Central bank announced crypto regulations, causing uncertainty"
  },
  {
    date: subDays(new Date(), 10),
    event: "Institutional investors increased positions, market stabilized"
  },
  {
    date: subDays(new Date(), 5),
    event: "Market correction after extended bull run"
  }
];

// Pre-defined scenarios
const scenarios = [
  { 
    id: 'btc-bull-2021', 
    name: 'Bitcoin 2021 Bull Run', 
    description: 'The historic rise to $64k and subsequent correction',
    volatility: 5
  },
  { 
    id: 'eth-merge', 
    name: 'Ethereum Merge', 
    description: 'Price action before and after the transition to PoS',
    volatility: 7
  },
  { 
    id: 'may-2021-crash', 
    name: 'May 2021 Crash', 
    description: 'The 50% market crash that shocked investors',
    volatility: 12
  },
  { 
    id: 'defi-summer', 
    name: 'DeFi Summer 2020', 
    description: 'The explosive growth of DeFi tokens',
    volatility: 15
  }
];

const CryptoTimeMachine: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedScenario, setSelectedScenario] = useState(scenarios[0]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date>(subDays(new Date(), 30));
  const [visibleData, setVisibleData] = useState<any[]>([]);
  const [currentEvent, setCurrentEvent] = useState<{date: Date, event: string} | null>(null);
  
  // Generate data when scenario changes
  useEffect(() => {
    const newData = generateSampleHistoricalData(30, selectedScenario.volatility);
    setHistoricalData(newData);
    setCurrentIndex(0);
    setVisibleData(newData.slice(0, 24)); // Show first day initially
  }, [selectedScenario]);
  
  // Handle playback
  useEffect(() => {
    if (!isPlaying || !historicalData.length) return;
    
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const next = prev + 1;
        if (next >= historicalData.length) {
          setIsPlaying(false);
          return prev;
        }
        
        // Update visible data window (24 points)
        setVisibleData(historicalData.slice(
          Math.max(0, next - 23),
          next + 1
        ));
        
        // Check if there's a market event around this time
        const currentTimestamp = historicalData[next].timestamp;
        const currentHour = startOfHour(new Date(currentTimestamp));
        
        const matchingEvent = marketEvents.find(event => {
          const eventHour = startOfHour(event.date);
          // Check if we're within 2 hours of the event
          return Math.abs(eventHour.getTime() - currentHour.getTime()) <= 2 * 60 * 60 * 1000;
        });
        
        if (matchingEvent && (!currentEvent || currentEvent.event !== matchingEvent.event)) {
          setCurrentEvent(matchingEvent);
        } else if (currentEvent && Math.abs(currentHour.getTime() - startOfHour(currentEvent.date).getTime()) > 4 * 60 * 60 * 1000) {
          // Clear event if we're more than 4 hours past it
          setCurrentEvent(null);
        }
        
        // Update selected date based on current data point
        setSelectedDate(new Date(currentTimestamp));
        
        return next;
      });
    }, 1000 / playbackSpeed);
    
    return () => clearInterval(interval);
  }, [isPlaying, historicalData, currentIndex, playbackSpeed, currentEvent]);
  
  const handlePlay = () => {
    if (currentIndex >= historicalData.length - 1) {
      // Restart if at the end
      setCurrentIndex(0);
      setVisibleData(historicalData.slice(0, 24));
    }
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setVisibleData(historicalData.slice(0, 24));
    setSelectedDate(subDays(new Date(), 30));
    setCurrentEvent(null);
  };
  
  const handleForward = () => {
    const newIndex = Math.min(historicalData.length - 1, currentIndex + 24); // Forward 1 day
    setCurrentIndex(newIndex);
    setVisibleData(historicalData.slice(
      Math.max(0, newIndex - 23),
      newIndex + 1
    ));
    setSelectedDate(new Date(historicalData[newIndex].timestamp));
  };
  
  const handleBack = () => {
    const newIndex = Math.max(0, currentIndex - 24); // Back 1 day
    setCurrentIndex(newIndex);
    setVisibleData(historicalData.slice(
      Math.max(0, newIndex - 23),
      newIndex + 1
    ));
    setSelectedDate(new Date(historicalData[newIndex].timestamp));
  };
  
  // Calculate price change in visible data
  const calculatePriceChange = () => {
    if (visibleData.length < 2) return 0;
    const startPrice = visibleData[0].price;
    const endPrice = visibleData[visibleData.length - 1].price;
    return ((endPrice - startPrice) / startPrice) * 100;
  };
  
  const priceChange = calculatePriceChange();
  
  return (
    <motion.div 
      className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800' : 'bg-white'} p-4 rounded-xl`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock size={18} className="text-purple-500 mr-2" />
          <h3 className="text-lg font-bold">Crypto Time Machine</h3>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
          <Calendar size={14} className="mr-1" />
          Replay market history
        </div>
      </div>
      
      {/* Scenario selection */}
      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Select Market Scenario:</div>
        <div className="grid grid-cols-2 gap-2">
          {scenarios.map(scenario => (
            <button
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              className={`text-xs p-2 rounded text-left transition-colors ${
                selectedScenario.id === scenario.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/30'
                  : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700/80 border border-transparent'
              }`}
            >
              <div className="font-medium">{scenario.name}</div>
              <div className="text-gray-500 dark:text-gray-400 text-xs truncate">
                {scenario.description}
              </div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Price chart */}
      <div className="mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm font-medium">
            {selectedScenario.name} ({format(selectedDate, 'MMM dd, yyyy')})
          </div>
          <div className={`text-xs font-medium px-2 py-0.5 rounded ${
            priceChange > 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {priceChange > 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
        </div>
        
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={visibleData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 10}} 
                interval="preserveStartEnd"
                stroke={isDark ? "#666" : "#999"}
              />
              <YAxis 
                domain={['dataMin - 1000', 'dataMax + 1000']} 
                tick={{fontSize: 10}}
                stroke={isDark ? "#666" : "#999"}
              />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString(undefined, {maximumFractionDigits: 0})}`, 'Price']}
                labelFormatter={(label) => `${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#3b82f6" 
                dot={false} 
                strokeWidth={2}
                animationDuration={300}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Playback controls */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleBack}
          disabled={currentIndex === 0}
          className={`p-1 rounded ${
            currentIndex === 0 
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="p-1 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <RotateCcw size={18} />
          </button>
          
          <button
            onClick={handlePlay}
            className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
          
          <select 
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            className="text-xs bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded p-1"
          >
            <option value="0.5">0.5x</option>
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
          </select>
        </div>
        
        <button
          onClick={handleForward}
          disabled={currentIndex >= historicalData.length - 1}
          className={`p-1 rounded ${
            currentIndex >= historicalData.length - 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      {/* Market event */}
      <AnimatePresence>
        {currentEvent && (
          <motion.div 
            className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-lg p-3 text-sm"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="font-medium mb-1 flex items-center">
              <AlertTriangle size={14} className="text-yellow-500 mr-1" />
              Market Event: {format(currentEvent.date, 'MMM dd, yyyy')}
            </div>
            <div className="text-gray-600 dark:text-gray-300 text-xs">
              {currentEvent.event}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CryptoTimeMachine;
