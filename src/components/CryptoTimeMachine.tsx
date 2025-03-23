
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, RefreshCw, BookOpen, History, ChevronLeft, ChevronRight, Zap, TrendingUp, TrendingDown, Trophy, Users, Medal, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { HistoricalMarketEvent, MarketScenario } from '../types';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { toast } from './ui/use-toast';
import HistoricalMarketEvents from './HistoricalMarketEvents';
import TimeCapsuleChallenge from './TimeCapsuleChallenge';

// Mock historical events data
const historicalEvents: HistoricalMarketEvent[] = [
  {
    date: new Date('2017-12-17'),
    event: "Bitcoin reaches all-time high of nearly $20,000",
    impact: "positive"
  },
  {
    date: new Date('2018-01-16'),
    event: "Crypto market crash begins, Bitcoin falls below $10,000",
    impact: "negative"
  },
  {
    date: new Date('2020-03-12'),
    event: "Black Thursday crash, Bitcoin drops 50% in a day",
    impact: "negative"
  },
  {
    date: new Date('2021-04-14'),
    event: "Coinbase goes public, Bitcoin hits new high above $64,000",
    impact: "positive"
  },
  {
    date: new Date('2021-05-12'),
    event: "Tesla announces it will no longer accept Bitcoin as payment",
    impact: "negative"
  },
  {
    date: new Date('2021-09-07'),
    event: "El Salvador adopts Bitcoin as legal tender",
    impact: "positive"
  },
  {
    date: new Date('2022-05-07'),
    event: "Terra LUNA collapse begins, stablecoin UST loses its peg",
    impact: "negative"
  },
  {
    date: new Date('2022-11-11'),
    event: "FTX cryptocurrency exchange files for bankruptcy",
    impact: "negative"
  },
  {
    date: new Date('2023-01-21'),
    event: "Bitcoin recovers above $20,000 after 2022 bear market",
    impact: "positive"
  },
  {
    date: new Date('2023-03-10'),
    event: "Silicon Valley Bank collapse triggers market uncertainty",
    impact: "negative"
  },
  {
    date: new Date('2023-06-15'),
    event: "BlackRock files for spot Bitcoin ETF",
    impact: "positive"
  },
  {
    date: new Date('2024-01-10'),
    event: "SEC approves Bitcoin Spot ETFs",
    impact: "positive"
  },
  // Additional historical events for a richer library
  {
    date: new Date('2013-04-10'),
    event: "Bitcoin price crashes from $260 to $50 in a day",
    impact: "negative"
  },
  {
    date: new Date('2014-02-24'),
    event: "Mt. Gox exchange files for bankruptcy after 850,000 BTC hack",
    impact: "negative"
  },
  {
    date: new Date('2015-07-30'),
    event: "Ethereum network goes live with Frontier release",
    impact: "positive"
  },
  {
    date: new Date('2016-06-17'),
    event: "The DAO hack occurs, Ethereum loses over 50% of value",
    impact: "negative"
  },
  {
    date: new Date('2017-08-01'),
    event: "Bitcoin Cash hard fork occurs from original Bitcoin",
    impact: "neutral"
  },
  {
    date: new Date('2019-06-18'),
    event: "Facebook announces Libra cryptocurrency project",
    impact: "positive"
  },
  {
    date: new Date('2020-05-11'),
    event: "Bitcoin's third halving reduces block reward to 6.25 BTC",
    impact: "positive"
  },
  {
    date: new Date('2020-12-16'),
    event: "Bitcoin breaks $20,000 for the first time",
    impact: "positive"
  },
  {
    date: new Date('2021-03-13'),
    event: "Bitcoin reaches $60,000 for the first time",
    impact: "positive"
  },
  {
    date: new Date('2021-11-10'),
    event: "Bitcoin reaches all-time high of $69,000",
    impact: "positive"
  },
  {
    date: new Date('2022-01-21'),
    event: "Bitcoin drops below $35,000, losing 50% from ATH",
    impact: "negative"
  },
  {
    date: new Date('2022-06-18'),
    event: "Bitcoin falls below $20,000 for first time since 2020",
    impact: "negative"
  },
  {
    date: new Date('2023-11-09'),
    event: "Bitcoin reclaims $37,000 level on BlackRock ETF speculation",
    impact: "positive"
  }
];

// Market scenario presets
const marketScenarios: MarketScenario[] = [
  {
    id: "bull-2017",
    name: "2017 Bull Run",
    description: "The iconic crypto bull market that took Bitcoin from $1,000 to nearly $20,000",
    volatility: 85,
    startDate: new Date('2017-01-01'),
    endDate: new Date('2017-12-31')
  },
  {
    id: "bear-2018",
    name: "2018 Crypto Winter",
    description: "The prolonged bear market that saw Bitcoin lose over 80% of its value",
    volatility: 65,
    startDate: new Date('2018-01-01'),
    endDate: new Date('2018-12-31')
  },
  {
    id: "covid-crash",
    name: "March 2020 Crash",
    description: "The rapid market collapse during the initial COVID-19 pandemic",
    volatility: 95,
    startDate: new Date('2020-03-01'),
    endDate: new Date('2020-03-31')
  },
  {
    id: "bull-2021",
    name: "2021 Bull Market",
    description: "The bull run that took Bitcoin to $69,000 and saw NFTs explode in popularity",
    volatility: 80,
    startDate: new Date('2021-01-01'),
    endDate: new Date('2021-11-30')
  },
  {
    id: "luna-crash",
    name: "LUNA/UST Collapse",
    description: "The Terra ecosystem implosion that wiped out billions in value",
    volatility: 100,
    startDate: new Date('2022-05-01'),
    endDate: new Date('2022-05-31')
  },
  {
    id: "ftx-collapse",
    name: "FTX Bankruptcy",
    description: "The sudden collapse of the FTX exchange and market aftermath",
    volatility: 90,
    startDate: new Date('2022-11-01'),
    endDate: new Date('2022-11-30')
  },
  {
    id: "etf-approval",
    name: "ETF Approval Rally",
    description: "The market rally following Bitcoin spot ETF approval",
    volatility: 70,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-31')
  },
  // Additional scenarios for variety
  {
    id: "dao-hack",
    name: "The DAO Hack",
    description: "The Ethereum DAO hack and subsequent fork controversy",
    volatility: 85,
    startDate: new Date('2016-06-15'),
    endDate: new Date('2016-07-15')
  },
  {
    id: "ico-boom",
    name: "ICO Boom Period",
    description: "The 2017 Initial Coin Offering craze that created thousands of new tokens",
    volatility: 75,
    startDate: new Date('2017-06-01'),
    endDate: new Date('2017-09-30')
  },
  {
    id: "defi-summer",
    name: "DeFi Summer 2020",
    description: "The explosion of decentralized finance projects and yield farming",
    volatility: 80,
    startDate: new Date('2020-06-01'),
    endDate: new Date('2020-09-30')
  },
  {
    id: "nft-mania",
    name: "NFT Mania",
    description: "The period when NFTs became mainstream and saw record-breaking sales",
    volatility: 75,
    startDate: new Date('2021-02-01'),
    endDate: new Date('2021-05-31')
  }
];

// Sample portfolio structure
interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
}

interface SimulationState {
  portfolio: PortfolioAsset[];
  cash: number;
  portfolioValue: number;
  startDate: Date;
  currentDate: Date;
  endDate: Date;
  scenario: string;
  day: number;
  totalDays: number;
  isRunning: boolean;
  speed: 'slow' | 'medium' | 'fast';
  historicalPerformance: { date: Date; value: number }[];
  tradesHistory: { date: Date; action: string; asset: string; amount: number; price: number }[];
}

const initialSimulation: SimulationState = {
  portfolio: [
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', amount: 0.5, buyPrice: 10000, currentPrice: 10000 },
    { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', amount: 5, buyPrice: 500, currentPrice: 500 }
  ],
  cash: 15000,
  portfolioValue: 20000,
  startDate: new Date('2020-01-01'),
  currentDate: new Date('2020-01-01'),
  endDate: new Date('2020-12-31'),
  scenario: 'covid-crash',
  day: 1,
  totalDays: 365,
  isRunning: false,
  speed: 'medium',
  historicalPerformance: [{ date: new Date('2020-01-01'), value: 20000 }],
  tradesHistory: []
};

// Mock historical prices - in a real app, these would come from an API
const getHistoricalPrice = (assetId: string, date: Date, scenarioId: string): number => {
  // This is a simplified mock function - in a real app, you'd fetch historical data
  const basePrice = assetId === 'bitcoin' ? 10000 : assetId === 'ethereum' ? 500 : 1;
  const scenario = marketScenarios.find(s => s.id === scenarioId);
  const volatility = scenario?.volatility || 50;
  
  // Generate some random price variations based on the scenario and date
  const daysSinceStart = Math.floor((date.getTime() - initialSimulation.startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Different patterns for different scenarios
  let modifier = 1;
  
  if (scenarioId === 'bull-2017' || scenarioId === 'bull-2021' || scenarioId === 'etf-approval') {
    // Bull runs trend upward with occasional dips
    modifier = 1 + (daysSinceStart / 100) + (Math.sin(daysSinceStart / 10) * 0.1);
  } else if (scenarioId === 'bear-2018') {
    // Bear markets trend downward with occasional rallies
    modifier = 1 - (daysSinceStart / 150) + (Math.sin(daysSinceStart / 15) * 0.05);
  } else if (scenarioId === 'covid-crash') {
    // Sudden crash followed by recovery
    if (daysSinceStart < 70) {
      modifier = 1 - (daysSinceStart / 30) * 0.5;
    } else {
      modifier = 0.5 + ((daysSinceStart - 70) / 100);
    }
  } else if (scenarioId === 'luna-crash' || scenarioId === 'ftx-collapse') {
    // Sharp crash with no immediate recovery
    modifier = Math.max(0.1, 1 - (daysSinceStart / 20) * 0.7);
  } else if (scenarioId === 'dao-hack') {
    // Sharp drop followed by slow recovery
    if (daysSinceStart < 15) {
      modifier = 1 - (daysSinceStart / 15) * 0.6;
    } else {
      modifier = 0.4 + ((daysSinceStart - 15) / 40) * 0.3;
    }
  } else if (scenarioId === 'ico-boom' || scenarioId === 'defi-summer' || scenarioId === 'nft-mania') {
    // Explosive growth followed by cooldown
    if (daysSinceStart < 60) {
      modifier = 1 + (daysSinceStart / 40) * 1.5;
    } else {
      modifier = 2.5 - ((daysSinceStart - 60) / 60) * 0.5;
    }
  }
  
  // Add random daily volatility
  const dailyVolatility = Math.sin(daysSinceStart) * (volatility / 100) * 0.2;
  
  return basePrice * modifier * (1 + dailyVolatility);
};

// Achievement system to gamify the experience
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  condition: (simulation: SimulationState) => boolean;
  isUnlocked: boolean;
  xpReward: number;
}

const achievementsList: Achievement[] = [
  {
    id: 'first-trade',
    title: 'First Steps',
    description: 'Complete your first trade in the time machine',
    icon: <Medal className="h-4 w-4" />,
    condition: (sim: SimulationState) => sim.tradesHistory.length > 0,
    isUnlocked: false,
    xpReward: 50
  },
  {
    id: 'profit-master',
    title: 'Profit Master',
    description: 'Achieve 50% portfolio growth in any scenario',
    icon: <TrendingUp className="h-4 w-4" />,
    condition: (sim: SimulationState) => {
      const initialValue = sim.historicalPerformance[0].value;
      const currentValue = sim.portfolioValue;
      return ((currentValue - initialValue) / initialValue) * 100 >= 50;
    },
    isUnlocked: false,
    xpReward: 100
  },
  {
    id: 'time-traveler',
    title: 'Time Traveler',
    description: 'Complete a full scenario simulation',
    icon: <Clock className="h-4 w-4" />,
    condition: (sim: SimulationState) => sim.day >= sim.totalDays,
    isUnlocked: false,
    xpReward: 75
  }
];

const CryptoTimeMachine: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [selectedScenario, setSelectedScenario] = useState<string>('bull-2021');
  const [activeTab, setActiveTab] = useState<string>('events');
  const [simulation, setSimulation] = useState<SimulationState>(initialSimulation);
  const [achievements, setAchievements] = useState<Achievement[]>(achievementsList);
  const [selectedEvent, setSelectedEvent] = useState<HistoricalMarketEvent | undefined>(undefined);
  
  // Get selected scenario details
  const selectedScenarioDetails = marketScenarios.find(scenario => scenario.id === selectedScenario);
  
  // Set up scenario simulation
  const startSimulation = () => {
    const scenario = marketScenarios.find(s => s.id === selectedScenario);
    if (!scenario) return;
    
    // Reset simulation with selected scenario
    const newSimulation: SimulationState = {
      ...initialSimulation,
      startDate: scenario.startDate || new Date(),
      currentDate: scenario.startDate || new Date(),
      endDate: scenario.endDate || new Date(),
      scenario: selectedScenario,
      totalDays: scenario.startDate && scenario.endDate ? 
        Math.ceil((scenario.endDate.getTime() - scenario.startDate.getTime()) / (1000 * 60 * 60 * 24)) : 
        365,
      day: 1,
      isRunning: true,
      historicalPerformance: [{ 
        date: scenario.startDate || new Date(), 
        value: initialSimulation.portfolioValue 
      }],
      tradesHistory: []
    };
    
    setSimulation(newSimulation);
    toast({
      title: "Simulation Started",
      description: `You've traveled back to ${scenario.name}. Let's see how your strategy performs!`,
      duration: 3000,
    });
    
    // Set active tab to simulator
    setActiveTab('simulator');
  };
  
  // Advance the simulation by one day
  const advanceDay = () => {
    if (!simulation.isRunning || simulation.day >= simulation.totalDays) return;
    
    setSimulation(prev => {
      // Calculate new date
      const newDate = new Date(prev.currentDate);
      newDate.setDate(newDate.getDate() + 1);
      
      // Update prices for assets in portfolio
      const updatedPortfolio = prev.portfolio.map(asset => {
        const newPrice = getHistoricalPrice(asset.id, newDate, prev.scenario);
        return {
          ...asset,
          currentPrice: newPrice
        };
      });
      
      // Calculate new portfolio value
      const newPortfolioValue = updatedPortfolio.reduce(
        (sum, asset) => sum + asset.amount * asset.currentPrice, 
        prev.cash
      );
      
      // Add new data point to historical performance
      const updatedHistory = [
        ...prev.historicalPerformance,
        { date: newDate, value: newPortfolioValue }
      ];
      
      return {
        ...prev,
        portfolio: updatedPortfolio,
        currentDate: newDate,
        day: prev.day + 1,
        portfolioValue: newPortfolioValue,
        historicalPerformance: updatedHistory,
        isRunning: prev.day + 1 < prev.totalDays
      };
    });
  };
  
  // Run simulation on interval based on selected speed
  useEffect(() => {
    if (!simulation.isRunning) return;
    
    const intervalTimes = {
      slow: 1000,
      medium: 500,
      fast: 100
    };
    
    const interval = setInterval(() => {
      advanceDay();
    }, intervalTimes[simulation.speed]);
    
    return () => clearInterval(interval);
  }, [simulation.isRunning, simulation.speed, simulation.day]);
  
  // Check for achievements in each simulation update
  useEffect(() => {
    const updatedAchievements = achievements.map(achievement => {
      if (!achievement.isUnlocked && achievement.condition(simulation)) {
        // Achievement just unlocked
        toast({
          title: "Achievement Unlocked!",
          description: `${achievement.title}: ${achievement.description} (+${achievement.xpReward} XP)`,
          duration: 5000,
        });
        return { ...achievement, isUnlocked: true };
      }
      return achievement;
    });
    
    setAchievements(updatedAchievements);
  }, [simulation]);
  
  // Play/pause simulation
  const toggleSimulation = () => {
    setSimulation(prev => ({
      ...prev,
      isRunning: !prev.isRunning
    }));
  };
  
  // Change simulation speed
  const setSimulationSpeed = (speed: 'slow' | 'medium' | 'fast') => {
    setSimulation(prev => ({
      ...prev,
      speed
    }));
  };
  
  // Execute a trade in the simulation
  const executeTrade = (action: 'buy' | 'sell', assetId: string, amount: number) => {
    setSimulation(prev => {
      const asset = prev.portfolio.find(a => a.id === assetId);
      if (!asset) return prev;
      
      const price = asset.currentPrice;
      const cost = price * amount;
      
      // Check if trade is valid
      if (action === 'buy' && cost > prev.cash) {
        toast({
          title: "Insufficient Funds",
          description: `You need $${cost.toFixed(2)} to buy ${amount} ${asset.symbol}`,
          variant: "destructive",
        });
        return prev;
      }
      
      if (action === 'sell' && amount > asset.amount) {
        toast({
          title: "Insufficient Assets",
          description: `You only have ${asset.amount} ${asset.symbol} to sell`,
          variant: "destructive",
        });
        return prev;
      }
      
      // Update portfolio
      const updatedPortfolio = prev.portfolio.map(a => {
        if (a.id !== assetId) return a;
        
        const newAmount = action === 'buy' 
          ? a.amount + amount 
          : a.amount - amount;
        
        // Calculate new average buy price (only for buys)
        const newBuyPrice = action === 'buy'
          ? ((a.buyPrice * a.amount) + (price * amount)) / newAmount
          : a.buyPrice;
        
        return {
          ...a,
          amount: newAmount,
          buyPrice: newBuyPrice
        };
      });
      
      // Update cash
      const newCash = action === 'buy'
        ? prev.cash - cost
        : prev.cash + cost;
      
      // Record trade in history
      const newTrade = {
        date: prev.currentDate,
        action: action === 'buy' ? 'Bought' : 'Sold',
        asset: asset.symbol,
        amount,
        price
      };
      
      // Show toast notification
      toast({
        title: action === 'buy' ? "Purchase Completed" : "Sale Completed",
        description: `${action === 'buy' ? 'Bought' : 'Sold'} ${amount} ${asset.symbol} at $${price.toFixed(2)}`,
      });
      
      return {
        ...prev,
        portfolio: updatedPortfolio,
        cash: newCash,
        tradesHistory: [...prev.tradesHistory, newTrade]
      };
    });
  };
  
  // Calculate the performance of the portfolio since the start
  const calculateTotalReturn = () => {
    if (simulation.historicalPerformance.length < 2) return 0;
    
    const initialValue = simulation.historicalPerformance[0].value;
    const currentValue = simulation.portfolioValue;
    
    return ((currentValue - initialValue) / initialValue) * 100;
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Handle selection of a historical event
  const handleSelectEvent = (event: HistoricalMarketEvent) => {
    setSelectedEvent(event);
    // Find a corresponding scenario or create a custom one
    const eventYear = event.date.getFullYear().toString();
    const matchingScenario = marketScenarios.find(
      s => s.startDate && s.startDate.getFullYear() === parseInt(eventYear)
    );
    
    if (matchingScenario) {
      setSelectedScenario(matchingScenario.id);
    }
    
    toast({
      title: "Event Selected",
      description: `You've selected: ${event.event}. You can now create a challenge or simulate this event.`,
      duration: 3000,
    });
  };
  
  // Handle scenario selection
  const handleSelectScenario = (scenario: MarketScenario) => {
    setSelectedScenario(scenario.id);
    setActiveTab('scenarios');
    
    toast({
      title: "Scenario Selected",
      description: `${scenario.name} selected. You can now start a simulation of this market period.`,
      duration: 3000,
    });
  };
  
  return (
    <div className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800' : 'bg-white'} p-4 rounded-xl overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock size={18} className="text-purple-500 mr-2" />
          <h3 className="text-lg font-bold">CryptoTimeMachine</h3>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={14} />
          <span>Travel through market history</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="events">Historical Events</TabsTrigger>
          <TabsTrigger value="scenarios">Market Scenarios</TabsTrigger>
          <TabsTrigger value="simulator">Time Simulator</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-4">
          <HistoricalMarketEvents 
            selectedYear={selectedYear}
            onSelectEvent={handleSelectEvent}
            onSelectYear={setSelectedYear}
            historicalEvents={historicalEvents}
          />
        </TabsContent>
        
        <TabsContent value="challenges" className="space-y-4">
          <TimeCapsuleChallenge 
            scenarios={marketScenarios}
            selectedEvent={selectedEvent}
            onSelectScenario={handleSelectScenario}
          />
        </TabsContent>
        
        <TabsContent value="scenarios" className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <label className="text-xs text-gray-600 dark:text-gray-400">Select Market Scenario</label>
            <Select 
              value={selectedScenario} 
              onValueChange={setSelectedScenario}
            >
              <SelectTrigger className="w-36 h-8 text-xs">
                <SelectValue placeholder="Scenario" />
              </SelectTrigger>
              <SelectContent>
                {marketScenarios.map(scenario => (
                  <SelectItem key={scenario.id} value={scenario.id}>{scenario.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedScenarioDetails && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="p-4 rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800/30">
                <h4 className="font-bold mb-1">{selectedScenarioDetails.name}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selectedScenarioDetails.description}</p>
                
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/30 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Time Period</div>
                    <div className="font-medium">
                      {selectedScenarioDetails.startDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} 
                      {' - '}
                      {selectedScenarioDetails.endDate?.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 dark:text-gray-400 mb-1">Volatility</div>
                    <div className="font-medium">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${selectedScenarioDetails.volatility}%` }}
                        ></div>
                      </div>
                      {selectedScenarioDetails.volatility}/100
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center text-sm">
                <Button 
                  onClick={startSimulation}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  <RefreshCw size={14} className="inline mr-1" />
                  Simulate This Market
                </Button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  See how your portfolio would have performed
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-xs">
                <div className="flex items-center mb-2">
                  <BookOpen size={14} className="text-gray-500 mr-1" />
                  <span className="font-medium">Key Lessons From This Period</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Market sentiment can shift dramatically in short periods</li>
                  <li>High volatility creates both opportunities and risks</li>
                  <li>External events often trigger major market movements</li>
                  <li>Historical patterns tend to repeat in different cycles</li>
                </ul>
              </div>
            </motion.div>
          )}
        </TabsContent>
        
        <TabsContent value="simulator" className="space-y-4">
          {simulation.day > 1 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Simulator control panel */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">Time Travel Simulation</h3>
                  <p className="text-xs text-gray-500">
                    {formatDate(simulation.startDate)} - {formatDate(simulation.endDate)}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant={simulation.speed === 'slow' ? 'default' : 'outline'}
                    onClick={() => setSimulationSpeed('slow')}
                  >
                    1x
                  </Button>
                  <Button
                    size="sm"
                    variant={simulation.speed === 'medium' ? 'default' : 'outline'}
                    onClick={() => setSimulationSpeed('medium')}
                  >
                    2x
                  </Button>
                  <Button
                    size="sm"
                    variant={simulation.speed === 'fast' ? 'default' : 'outline'}
                    onClick={() => setSimulationSpeed('fast')}
                  >
                    5x
                  </Button>
                  <Button
                    size="sm"
                    onClick={toggleSimulation}
                  >
                    {simulation.isRunning ? 'Pause' : 'Play'}
                  </Button>
                </div>
              </div>
              
              {/* Timeline progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Day {simulation.day} of {simulation.totalDays}</span>
                  <span>Current Date: {formatDate(simulation.currentDate)}</span>
                </div>
                <Progress value={(simulation.day / simulation.totalDays) * 100} className="h-2" />
              </div>
              
              {/* Portfolio performance */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Portfolio Performance</CardTitle>
                  <CardDescription className="text-xs">
                    Total Return: 
                    <span className={calculateTotalReturn() >= 0 ? "text-green-500 ml-1" : "text-red-500 ml-1"}>
                      {calculateTotalReturn() >= 0 ? "+" : ""}{calculateTotalReturn().toFixed(2)}%
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
                      <div className="text-xs text-gray-500 mb-1">Portfolio Value</div>
                      <div className="font-bold">${simulation.portfolioValue.toFixed(2)}</div>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                      <div className="text-xs text-gray-500 mb-1">Available Cash</div>
                      <div className="font-bold">${simulation.cash.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {/* Assets list */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-medium">Your Assets</h4>
                    {simulation.portfolio.map((asset, index) => {
                      const profit = (asset.currentPrice - asset.buyPrice) / asset.buyPrice * 100;
                      return (
                        <div key={index} className="flex justify-between border-b pb-2 last:border-0">
                          <div>
                            <div className="font-medium">{asset.amount.toFixed(4)} {asset.symbol}</div>
                            <div className="text-xs text-gray-500">
                              Avg. Buy: ${asset.buyPrice.toFixed(2)} | Current: ${asset.currentPrice.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span>${(asset.amount * asset.currentPrice).toFixed(2)}</span>
                            <span className={profit >= 0 ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                              {profit >= 0 ? "+" : ""}{profit.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-3">
                  {simulation.portfolio.map((asset, index) => (
                    <div key={index} className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => executeTrade('buy', asset.id, asset.id === 'bitcoin' ? 0.1 : 1)}
                      >
                        <TrendingUp size={12} className="mr-1" />
                        Buy {asset.symbol}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => executeTrade('sell', asset.id, asset.id === 'bitcoin' ? 0.1 : 1)}
                      >
                        <TrendingDown size={12} className="mr-1" />
                        Sell {asset.symbol}
                      </Button>
                    </div>
                  ))}
                </CardFooter>
              </Card>
              
              {/* Achievements */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Award size={14} className="mr-1" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {achievements.map(achievement => (
                      <div 
                        key={achievement.id} 
                        className={`p-2 rounded-md border flex justify-between items-center ${
                          achievement.isUnlocked 
                            ? 'border-green-200 bg-green-50 dark:bg-green-900/10' 
                            : 'border-gray-200 bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`p-1 rounded-full mr-2 ${
                            achievement.isUnlocked ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {achievement.icon}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{achievement.title}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{achievement.description}</div>
                          </div>
                        </div>
                        <div className="text-xs font-bold">
                          {achievement.isUnlocked ? (
                            <span className="text-green-600">+{achievement.xpReward} XP</span>
                          ) : (
                            <span className="text-gray-400">Locked</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent trades */}
              {simulation.tradesHistory.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recent Trades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {simulation.tradesHistory
                        .slice()
                        .reverse()
                        .slice(0, 5)
                        .map((trade, index) => (
                          <div key={index} className="text-xs flex justify-between border-b pb-2 last:border-0">
                            <div>
                              <span className={trade.action === 'Bought' ? "text-green-500" : "text-red-500"}>
                                {trade.action}
                              </span>
                              {' '}{trade.amount} {trade.asset} at ${trade.price.toFixed(2)}
                            </div>
                            <div className="text-gray-500">
                              {formatDate(trade.date)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Zap size={48} className="text-yellow-500 mb-4" />
              <h3 className="font-bold text-lg mb-2">Ready to Time Travel?</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md">
                Select a historic market scenario or event and hit "Simulate This Market" to see how your portfolio would have performed.
              </p>
              <div className="flex space-x-3">
                <Button onClick={() => setActiveTab('scenarios')}>
                  Choose a Scenario
                </Button>
                <Button variant="outline" onClick={() => setActiveTab('events')}>
                  Explore Events
                </Button>
              </div>
              
              <div className="mt-8 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-md border border-amber-200 dark:border-amber-800/40 max-w-md">
                <div className="flex items-center text-amber-800 dark:text-amber-400 font-medium mb-1">
                  <Trophy size={14} className="mr-1" /> 
                  Challenge Yourself
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Complete scenarios to earn achievements and XP. See how you rank on the global leaderboard and become a legendary trader!
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs w-full border-amber-300 dark:border-amber-700"
                  onClick={() => setActiveTab('challenges')}
                >
                  View Challenges
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoTimeMachine;
