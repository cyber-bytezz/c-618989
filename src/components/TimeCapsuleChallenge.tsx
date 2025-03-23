
import React, { useState } from 'react';
import { 
  Award, 
  Calendar, 
  Clock, 
  Hourglass, 
  RefreshCw, 
  TrendingDown, 
  TrendingUp, 
  Trophy, 
  Users 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { MarketScenario, HistoricalMarketEvent } from '@/types';
import { toast } from './ui/use-toast';

interface TimeCapsuleChallengeProps {
  scenarios: MarketScenario[];
  selectedEvent?: HistoricalMarketEvent;
  onSelectScenario: (scenario: MarketScenario) => void;
}

// Mock challenge data
interface Challenge {
  id: string;
  name: string;
  description: string;
  scenarioId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  participants: number;
  reward: number;
  daysRemaining: number;
  isCompleted?: boolean;
  userPerformance?: number;
}

const challenges: Challenge[] = [
  {
    id: 'challenge-1',
    name: '2017 Bull Run Master',
    description: 'Achieve 50% portfolio growth during the 2017 bull run period',
    scenarioId: 'bull-2017',
    difficulty: 'medium',
    participants: 1245,
    reward: 500,
    daysRemaining: 5
  },
  {
    id: 'challenge-2',
    name: 'Bear Market Survivor',
    description: 'Keep your portfolio above initial value during the 2018 crypto winter',
    scenarioId: 'bear-2018',
    difficulty: 'hard',
    participants: 892,
    reward: 750,
    daysRemaining: 3
  },
  {
    id: 'challenge-3',
    name: 'COVID Crash Navigator',
    description: 'Make a 20% profit during the March 2020 market crash',
    scenarioId: 'covid-crash',
    difficulty: 'hard',
    participants: 1566,
    reward: 1000,
    daysRemaining: 7
  },
  {
    id: 'challenge-4',
    name: 'ETF Approval Trader',
    description: 'Maximize profits during the Bitcoin ETF approval period',
    scenarioId: 'etf-approval',
    difficulty: 'easy',
    participants: 2145,
    reward: 300,
    daysRemaining: 2
  }
];

// Mock leaderboard data
interface LeaderboardEntry {
  rank: number;
  username: string;
  performance: number;
  challengesCompleted: number;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: 'CryptoWhale', performance: 186.4, challengesCompleted: 8 },
  { rank: 2, username: 'SatoshiDisciple', performance: 154.2, challengesCompleted: 12 },
  { rank: 3, username: 'HODLer4Life', performance: 128.7, challengesCompleted: 6 },
  { rank: 4, username: 'TradingQueen', performance: 116.5, challengesCompleted: 10 },
  { rank: 5, username: 'BTCmaximal', performance: 98.3, challengesCompleted: 7 }
];

const TimeCapsuleChallenge: React.FC<TimeCapsuleChallengeProps> = ({
  scenarios,
  selectedEvent,
  onSelectScenario
}) => {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [userChallenges, setUserChallenges] = useState<Challenge[]>(challenges);
  
  const handleJoinChallenge = (challenge: Challenge) => {
    toast({
      title: "Challenge Accepted!",
      description: `You've joined the "${challenge.name}" challenge. Complete it before it expires in ${challenge.daysRemaining} days.`,
      duration: 5000,
    });
    
    // Find the corresponding scenario
    const scenario = scenarios.find(s => s.id === challenge.scenarioId);
    if (scenario) {
      onSelectScenario(scenario);
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'hard': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
  };
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Hourglass className="h-4 w-4 mr-2" />
            Time Capsule Challenges
          </CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant={activeTab === 'challenges' ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setActiveTab('challenges')}
              className="h-8"
            >
              <Trophy className="h-4 w-4 mr-1" />
              Challenges
            </Button>
            <Button 
              variant={activeTab === 'leaderboard' ? "default" : "ghost"} 
              size="sm" 
              onClick={() => setActiveTab('leaderboard')}
              className="h-8"
            >
              <Users className="h-4 w-4 mr-1" />
              Leaderboard
            </Button>
          </div>
        </div>
        <CardDescription>
          Compete in historical trading challenges to earn rewards
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {activeTab === 'challenges' ? (
          <div className="space-y-4">
            {selectedEvent && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 mb-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800/40"
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">Create Custom Challenge</div>
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {selectedEvent.date.getFullYear()}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 mb-2">
                  Based on: {selectedEvent.event}
                </p>
                <div className="flex justify-end">
                  <Button size="sm" className="text-xs h-7">
                    Create Challenge
                  </Button>
                </div>
              </motion.div>
            )}
            
            <div className="space-y-3">
              {userChallenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 border rounded-md overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium flex items-center">
                        {challenge.name}
                        <Badge 
                          variant="outline" 
                          className={`ml-2 text-xs ${getDifficultyColor(challenge.difficulty)}`}
                        >
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {challenge.description}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 text-gray-500 mr-1" />
                          <span>{challenge.participants} participants</span>
                        </div>
                        <div className="flex items-center">
                          <Award className="h-3 w-3 text-gray-500 mr-1" />
                          <span>{challenge.reward} XP reward</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 text-gray-500 mr-1" />
                          <span>Expires in {challenge.daysRemaining} days</span>
                        </div>
                      </div>
                    </div>
                    
                    {challenge.isCompleted ? (
                      <div className="text-right">
                        <Badge variant="success" className="mb-2">Completed</Badge>
                        <div className="text-xs">
                          Your performance: 
                          <span className="font-bold ml-1 text-green-500">
                            +{challenge.userPerformance}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <Button 
                        size="sm" 
                        className="mt-1"
                        onClick={() => handleJoinChallenge(challenge)}
                      >
                        Join Challenge
                      </Button>
                    )}
                  </div>
                  
                  {challenge.isCompleted && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-500 flex justify-between mb-1">
                        <span>Your Progress</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-1" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-md overflow-hidden border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Rank</TableHead>
                    <TableHead>Trader</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                    <TableHead className="text-right">Challenges</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((entry) => (
                    <TableRow key={entry.rank}>
                      <TableCell className="font-medium">
                        {entry.rank === 1 ? (
                          <span className="flex items-center">
                            1 <Trophy className="h-3 w-3 text-yellow-500 ml-1" />
                          </span>
                        ) : entry.rank}
                      </TableCell>
                      <TableCell>{entry.username}</TableCell>
                      <TableCell className="text-right">
                        <span className="text-green-500 font-medium">+{entry.performance}%</span>
                      </TableCell>
                      <TableCell className="text-right">{entry.challengesCompleted}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            <div className="text-center py-2">
              <div className="text-gray-500 text-xs mb-2">Your current ranking: #42</div>
              <div className="flex justify-center">
                <Button size="sm" variant="outline" className="text-xs mr-2">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Refresh Rankings
                </Button>
                <Button size="sm" className="text-xs">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Improve Your Rank
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeCapsuleChallenge;
