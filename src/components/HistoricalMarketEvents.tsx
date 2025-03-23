
import React, { useState } from 'react';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink, 
  PieChart, 
  TrendingDown, 
  TrendingUp 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { HistoricalMarketEvent } from '@/types';

interface HistoricalMarketEventsProps {
  selectedYear: string;
  onSelectEvent: (event: HistoricalMarketEvent) => void;
  onSelectYear: (year: string) => void;
  historicalEvents: HistoricalMarketEvent[];
}

const HistoricalMarketEvents: React.FC<HistoricalMarketEventsProps> = ({
  selectedYear,
  onSelectEvent,
  onSelectYear,
  historicalEvents
}) => {
  const [eventsPage, setEventsPage] = useState(0);
  const eventsPerPage = 3;
  const [activeTab, setActiveTab] = useState('famous');
  
  // Filter events by selected year
  const filteredEvents = historicalEvents.filter(event => 
    event.date.getFullYear() === parseInt(selectedYear)
  );
  
  // Get events for current page
  const currentEvents = filteredEvents.slice(
    eventsPage * eventsPerPage, 
    (eventsPage * eventsPerPage) + eventsPerPage
  );
  
  // Get years for selection (from 2009 Bitcoin genesis to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2008 }, (_, i) => (2009 + i).toString());
  
  const handlePrevPage = () => {
    if (eventsPage > 0) setEventsPage(prev => prev - 1);
  };
  
  const handleNextPage = () => {
    if ((eventsPage + 1) * eventsPerPage < filteredEvents.length) {
      setEventsPage(prev => prev + 1);
    }
  };
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            Historical Market Events
          </CardTitle>
          <div className="text-xs text-gray-500">
            {selectedYear}
          </div>
        </div>
        <CardDescription>
          Explore significant crypto market events
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="famous">Famous Events</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="famous" className="pt-4 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Notable Events in {selectedYear}</span>
              <div className="flex">
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={eventsPage === 0}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost" 
                  size="sm"
                  onClick={handleNextPage}
                  disabled={(eventsPage + 1) * eventsPerPage >= filteredEvents.length}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-3 min-h-[240px]">
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
                    onClick={() => onSelectEvent(event)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{event.event}</span>
                      <Badge variant={event.impact === 'positive' ? 'success' : 'destructive'} className="ml-1">
                        {event.impact === 'positive' ? 
                          <TrendingUp className="h-3 w-3 mr-1" /> : 
                          <TrendingDown className="h-3 w-3 mr-1" />
                        }
                        {event.impact.charAt(0).toUpperCase() + event.impact.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {event.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="mt-2 text-xs h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                    >
                      Simulate This Event
                    </Button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No major events found for {selectedYear}</p>
                  <p className="text-xs mt-1">Try selecting a different year</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="pt-4">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {years.slice().reverse().slice(0, 8).map(year => (
                <Button
                  key={year}
                  variant={year === selectedYear ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectYear(year)}
                  className="w-full"
                >
                  {year}
                </Button>
              ))}
            </div>
            
            <div className="relative border-l-2 border-gray-200 dark:border-gray-700 pl-4 ml-4 space-y-8 max-h-[300px] overflow-y-auto">
              {years.slice().reverse().map(year => {
                const yearEvents = historicalEvents.filter(event => 
                  event.date.getFullYear() === parseInt(year)
                ).slice(0, 1); // Show only first event for each year in timeline
                
                if (yearEvents.length === 0) return null;
                
                return (
                  <div key={year} className="relative">
                    <div className="absolute -left-6 mt-1.5 h-3 w-3 rounded-full border border-white bg-gray-300 dark:bg-gray-600"></div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{year}</div>
                    {yearEvents.map((event, idx) => (
                      <div key={idx} className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {event.event}
                        <Button
                          variant="link"
                          size="sm"
                          className="text-xs h-6 p-0 mt-1"
                          onClick={() => {
                            onSelectYear(year);
                            onSelectEvent(event);
                          }}
                        >
                          View <ChevronRight className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t pt-3 text-xs text-gray-500">
        <div className="flex justify-between w-full">
          <span>Data sourced from multiple crypto archives</span>
          <a href="#" className="text-blue-500 hover:text-blue-700 flex items-center">
            Learn more <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </div>
      </CardFooter>
    </Card>
  );
};

export default HistoricalMarketEvents;
