
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, BarChart2, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Market event type
interface MarketEvent {
  id: string;
  title: string;
  description: string;
  probability: number;
  impact: 'high' | 'medium' | 'low';
  type: 'bullish' | 'bearish' | 'neutral';
  deadline: Date;
  votes: number;
}

// User prediction type
interface UserPrediction {
  eventId: string;
  prediction: 'agree' | 'disagree';
  timestamp: Date;
}

const CryptoStorm = () => {
  const { toast } = useToast();
  const [volatilityIndex, setVolatilityIndex] = useState(65);
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [userPredictions, setUserPredictions] = useState<UserPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock market events
  useEffect(() => {
    const mockEvents: MarketEvent[] = [
      {
        id: '1',
        title: 'Bitcoin breaks $100k',
        description: 'BTC could break through the $100,000 resistance level by the end of the month.',
        probability: 35,
        impact: 'high',
        type: 'bullish',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        votes: 142
      },
      {
        id: '2',
        title: 'Ethereum major correction',
        description: 'ETH may see a 20% correction following the recent rally.',
        probability: 68,
        impact: 'medium',
        type: 'bearish',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        votes: 98
      },
      {
        id: '3',
        title: 'DeFi market consolidation',
        description: 'Major DeFi tokens likely to consolidate after recent volatility.',
        probability: 82,
        impact: 'low',
        type: 'neutral',
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        votes: 56
      }
    ];
    
    setMarketEvents(mockEvents);
    setIsLoading(false);
    
    // Simulate volatility changes
    const interval = setInterval(() => {
      setVolatilityIndex(prev => {
        const change = Math.random() > 0.5 ? 
          Math.random() * 5 : 
          -Math.random() * 5;
        return Math.min(Math.max(prev + change, 10), 95);
      });
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle user predictions
  const handlePrediction = (eventId: string, prediction: 'agree' | 'disagree') => {
    // Check if user already made a prediction for this event
    const existingPrediction = userPredictions.find(p => p.eventId === eventId);
    
    if (existingPrediction) {
      toast({
        title: "Prediction already made",
        description: "You've already made a prediction for this event.",
        variant: "default",
      });
      return;
    }
    
    // Add the new prediction
    const newPrediction: UserPrediction = {
      eventId,
      prediction,
      timestamp: new Date()
    };
    
    setUserPredictions(prev => [...prev, newPrediction]);
    
    // Update the event votes
    setMarketEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, votes: event.votes + 1, probability: prediction === 'agree' ? Math.min(event.probability + 2, 99) : Math.max(event.probability - 2, 1) } 
          : event
      )
    );
    
    toast({
      title: "Prediction recorded!",
      description: `You've ${prediction === 'agree' ? 'agreed with' : 'disagreed with'} the prediction.`,
      variant: "default",
    });
  };
  
  // Get volatility status and styling
  const getVolatilityStatus = () => {
    if (volatilityIndex < 30) return { text: 'Low', color: 'text-green-500' };
    if (volatilityIndex < 70) return { text: 'Moderate', color: 'text-yellow-500' };
    return { text: 'High', color: 'text-red-500' };
  };
  
  const volatilityStatus = getVolatilityStatus();
  
  // Format deadline to readable format
  const formatDeadline = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  };
  
  return (
    <Card className="shadow-md overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="h-5 w-5" /> 
            CryptoStorm Predictor
          </CardTitle>
          <Badge variant={volatilityIndex > 70 ? "destructive" : volatilityIndex > 30 ? "default" : "outline"}>
            {volatilityStatus.text} Volatility
          </Badge>
        </div>
        <CardDescription>
          Predict upcoming market events and earn points
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-3">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Market Volatility Index</span>
            <span className={volatilityStatus.color}>{volatilityIndex.toFixed(1)}</span>
          </div>
          <Progress 
            value={volatilityIndex} 
            className="h-2"
          />
        </div>
        
        <h3 className="font-medium mb-3">Active Predictions</h3>
        
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>
            <div className="h-20 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-md"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {marketEvents.map(event => (
              <div key={event.id} className="border rounded-lg p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium flex items-center gap-1.5">
                      {event.type === 'bullish' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : event.type === 'bearish' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <BarChart2 className="h-4 w-4 text-blue-500" />
                      )}
                      {event.title}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {event.description}
                    </p>
                  </div>
                  <Badge variant={
                    event.impact === 'high' ? 'destructive' : 
                    event.impact === 'medium' ? 'default' : 
                    'secondary'
                  }>
                    {event.impact}
                  </Badge>
                </div>
                
                <div className="mt-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Community confidence</span>
                    <span>{event.probability}%</span>
                  </div>
                  <Progress 
                    value={event.probability} 
                    className="h-2"
                  />
                </div>
                
                <div className="flex items-center justify-between mt-3">
                  <div className="text-xs text-gray-500 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Closes in {formatDeadline(event.deadline)}
                  </div>
                  
                  <div className="flex gap-2">
                    {userPredictions.find(p => p.eventId === event.id) ? (
                      <Badge variant="outline" className="px-3">
                        Predicted
                      </Badge>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handlePrediction(event.id, 'disagree')}
                        >
                          Disagree
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => handlePrediction(event.id, 'agree')}
                        >
                          Agree
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-2">
                  {event.votes} community votes
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-3">
        <Button variant="outline" size="sm" className="w-full">
          View All Predictions
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CryptoStorm;
