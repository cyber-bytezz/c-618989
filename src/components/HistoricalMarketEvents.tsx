import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarClock, Lightbulb } from 'lucide-react';
import { HistoricalMarketEvent } from '@/types';
import { useTheme } from '../contexts/ThemeContext';

const HistoricalMarketEvents = () => {
  const { isDark } = useTheme();
  const [events, setEvents] = useState<HistoricalMarketEvent[]>([
    {
      date: new Date('2023-01-15'),
      event: 'Ethereum Shanghai Upgrade Announced',
      impact: 'positive',
    },
    {
      date: new Date('2023-03-10'),
      event: 'Silvergate Bank Collapse',
      impact: 'negative',
    },
    {
      date: new Date('2023-05-16'),
      event: 'Bitcoin Halving',
      impact: 'positive',
    },
    {
      date: new Date('2023-09-22'),
      event: 'SEC Delays Decision on Bitcoin ETFs',
      impact: 'negative',
    },
    {
      date: new Date('2024-02-01'),
      event: 'Bitcoin hits $40,000',
      impact: 'positive',
    },
  ]);
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-lg">Historical Market Events</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <ul className="space-y-3">
          {events.map((event, index) => (
            <li 
              key={index} 
              className={`flex items-center justify-between ${isDark ? 'dark:bg-gray-800 dark:border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-md p-3`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <CalendarClock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{event.event}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {event.date.toLocaleDateString()}
                </div>
              </div>
              
              {event.impact === 'positive' ? (
                <Badge variant="default" className="text-xs">Positive</Badge>
              ) : event.impact === 'negative' ? (
                <Badge variant="destructive" className="text-xs">Negative</Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Neutral</Badge>
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default HistoricalMarketEvents;
