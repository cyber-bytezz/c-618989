
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, RefreshCw, BookOpen, History, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { HistoricalMarketEvent, MarketScenario } from '../types';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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
  }
];

const CryptoTimeMachine: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [selectedScenario, setSelectedScenario] = useState<string>('bull-2021');
  const [activeTab, setActiveTab] = useState<string>('events');
  const [eventsPage, setEventsPage] = useState(0);
  const eventsPerPage = 3;
  
  // Filter events by selected year
  const filteredEvents = historicalEvents.filter(event => 
    event.date.getFullYear() === parseInt(selectedYear)
  );
  
  // Get events for current page
  const currentEvents = filteredEvents.slice(
    eventsPage * eventsPerPage, 
    (eventsPage * eventsPerPage) + eventsPerPage
  );
  
  // Get selected scenario details
  const selectedScenarioDetails = marketScenarios.find(scenario => scenario.id === selectedScenario);
  
  const handlePrevPage = () => {
    if (eventsPage > 0) setEventsPage(prev => prev - 1);
  };
  
  const handleNextPage = () => {
    if ((eventsPage + 1) * eventsPerPage < filteredEvents.length) {
      setEventsPage(prev => prev + 1);
    }
  };
  
  // Years for selection dropdown (from 2009 Bitcoin genesis to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2008 }, (_, i) => (2009 + i).toString());
  
  return (
    <div className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800' : 'bg-white'} p-4 rounded-xl overflow-hidden`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Clock size={18} className="text-purple-500 mr-2" />
          <h3 className="text-lg font-bold">Crypto Time Machine</h3>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar size={14} />
          <span>Travel through market history</span>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="events">Historical Events</TabsTrigger>
          <TabsTrigger value="scenarios">Market Scenarios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="events" className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-600 dark:text-gray-400">Select Year</label>
            <Select 
              value={selectedYear} 
              onValueChange={setSelectedYear}
            >
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.reverse().map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3 min-h-[250px]">
            {currentEvents.length > 0 ? (
              currentEvents.map((event, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    event.impact === 'positive' 
                      ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-800/30' 
                      : 'border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">{event.event}</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {event.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No major events found for {selectedYear}</p>
                <p className="text-xs mt-1">Try selecting a different year</p>
              </div>
            )}
          </div>
          
          {filteredEvents.length > eventsPerPage && (
            <div className="flex justify-between items-center pt-2">
              <button 
                onClick={handlePrevPage}
                disabled={eventsPage === 0}
                className={`p-1 rounded-full ${
                  eventsPage === 0 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Page {eventsPage + 1} of {Math.ceil(filteredEvents.length / eventsPerPage)}
              </span>
              <button 
                onClick={handleNextPage}
                disabled={(eventsPage + 1) * eventsPerPage >= filteredEvents.length}
                className={`p-1 rounded-full ${
                  (eventsPage + 1) * eventsPerPage >= filteredEvents.length
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-gray-600 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
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
                <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                  <RefreshCw size={14} className="inline mr-1" />
                  Simulate This Market
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  See how your current portfolio would have performed
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
      </Tabs>
    </div>
  );
};

export default CryptoTimeMachine;
