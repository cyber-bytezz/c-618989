
import { useState, useEffect } from 'react';
import { MessageCircle, Users, TrendingUp, TrendingDown, Plus, Send, Clock } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface Message {
  id: string;
  username: string;
  avatar: string;
  content: string;
  timestamp: number;
  prediction?: {
    direction: 'up' | 'down';
    asset: string;
    target: number;
  };
  likes: number;
  userHasLiked: boolean;
}

interface Room {
  id: string;
  name: string;
  asset: string;
  memberCount: number;
  description: string;
  isLive: boolean;
  tags: string[];
}

const MOCK_ROOMS: Room[] = [
  {
    id: 'bitcoin-room',
    name: 'Bitcoin Strategy Room',
    asset: 'BTC',
    memberCount: 158,
    description: 'Discuss Bitcoin trends, technical analysis and investment strategies.',
    isLive: true,
    tags: ['trending', 'technical-analysis', 'long-term']
  },
  {
    id: 'ethereum-room',
    name: 'Ethereum Bulls',
    asset: 'ETH',
    memberCount: 87,
    description: 'ETH price predictions and latest development updates.',
    isLive: true,
    tags: ['defi', 'nfts', 'development']
  },
  {
    id: 'altcoin-room',
    name: 'Altcoin Opportunities',
    asset: 'ALT',
    memberCount: 42,
    description: 'Finding the next 100x gems in the altcoin space.',
    isLive: false,
    tags: ['high-risk', 'research', 'small-caps']
  }
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    username: 'CryptoWhale',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=crypto-whale',
    content: 'I think we\'re seeing a classic double bottom on the 4-hour chart. Bullish signal!',
    timestamp: Date.now() - 1000 * 60 * 15,
    likes: 12,
    userHasLiked: false
  },
  {
    id: '2',
    username: 'TradingMaster',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=trading-master',
    content: 'Volume is picking up nicely. If we break the 27k resistance, next stop could be 30k.',
    timestamp: Date.now() - 1000 * 60 * 10,
    prediction: {
      direction: 'up',
      asset: 'BTC',
      target: 30000
    },
    likes: 8,
    userHasLiked: true
  },
  {
    id: '3',
    username: 'CryptoCat',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=crypto-cat',
    content: 'Just saw a large wallet move 500 BTC to an exchange. Could be selling pressure incoming.',
    timestamp: Date.now() - 1000 * 60 * 5,
    likes: 3,
    userHasLiked: false
  }
];

const CryptoCollaborationZone = () => {
  const { isDark } = useTheme();
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [isJoined, setIsJoined] = useState(false);
  
  // Load messages when room changes
  useEffect(() => {
    if (activeRoom) {
      // In a real app, we would fetch room-specific messages
      setMessages(MOCK_MESSAGES);
      // Check if user is already a member
      const joined = Math.random() > 0.5; // Simulate random join status for demo
      setIsJoined(joined);
    }
  }, [activeRoom]);
  
  // Handle joining a room
  const handleJoinRoom = () => {
    if (!activeRoom) return;
    
    setIsJoined(true);
    toast.success(`Joined ${activeRoom.name}! You can now participate in discussions.`);
    
    // Update member count (in a real app, this would be handled by the backend)
    setRooms(prev => 
      prev.map(room => 
        room.id === activeRoom.id 
          ? { ...room, memberCount: room.memberCount + 1 } 
          : room
      )
    );
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!message.trim() || !activeRoom || !isJoined) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      username: 'You', // In a real app, this would be the current user
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=you',
      content: message,
      timestamp: Date.now(),
      likes: 0,
      userHasLiked: false
    };
    
    setMessages(prev => [newMessage, ...prev]);
    setMessage('');
  };
  
  // Handle liking a message
  const handleLikeMessage = (messageId: string) => {
    setMessages(prev => 
      prev.map(msg => {
        if (msg.id === messageId) {
          const liked = !msg.userHasLiked;
          return {
            ...msg,
            likes: liked ? msg.likes + 1 : msg.likes - 1,
            userHasLiked: liked
          };
        }
        return msg;
      })
    );
  };
  
  // Format timestamp to relative time
  const formatRelativeTime = (timestamp: number): string => {
    const now = Date.now();
    const diffSeconds = Math.floor((now - timestamp) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
  };
  
  return (
    <div className={`neo-brutalist-sm rounded-xl p-4 ${isDark ? 'dark:bg-gray-800 dark:text-white' : 'bg-white'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-indigo-500" />
          <h3 className="font-bold text-lg">Crypto Collaboration Zone</h3>
        </div>
      </div>
      
      <Tabs defaultValue="rooms" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="rooms">Strategy Rooms</TabsTrigger>
          <TabsTrigger value="chat" disabled={!activeRoom}>Live Chat</TabsTrigger>
          <TabsTrigger value="predictions" disabled={!activeRoom}>Predictions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="rooms">
          <div className="space-y-3">
            {rooms.map(room => (
              <div 
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`p-3 rounded-lg border transition-all cursor-pointer
                  ${activeRoom?.id === room.id 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{room.name}</span>
                      {room.isLive && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{room.description}</p>
                  </div>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users size={12} />
                    <span>{room.memberCount}</span>
                  </Badge>
                </div>
                
                <div className="flex gap-2 mt-2">
                  {room.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
            
            <Button variant="outline" className="w-full mt-2 flex items-center gap-2">
              <Plus size={16} />
              <span>Create New Room</span>
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="chat">
          {activeRoom && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h4 className="font-semibold">{activeRoom.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Users size={14} />
                    <span>{activeRoom.memberCount} members</span>
                  </div>
                </div>
                
                {!isJoined && (
                  <Button onClick={handleJoinRoom} size="sm">
                    Join Room
                  </Button>
                )}
              </div>
              
              <Separator className="mb-4" />
              
              {/* Messages area */}
              <div className="h-[300px] overflow-y-auto mb-4 space-y-4">
                {messages.length > 0 ? (
                  messages.map(msg => (
                    <div key={msg.id} className="flex gap-3">
                      <Avatar>
                        <img src={msg.avatar} alt={msg.username} />
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{msg.username}</span>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(msg.timestamp)}
                          </span>
                        </div>
                        
                        <p className="mt-1 text-sm">{msg.content}</p>
                        
                        {msg.prediction && (
                          <div className={`mt-2 p-2 rounded-md text-sm ${
                            msg.prediction.direction === 'up' 
                              ? 'bg-green-50 dark:bg-green-900/20' 
                              : 'bg-red-50 dark:bg-red-900/20'
                          }`}>
                            <div className="flex items-center gap-1">
                              {msg.prediction.direction === 'up' ? (
                                <TrendingUp size={14} className="text-green-600" />
                              ) : (
                                <TrendingDown size={14} className="text-red-600" />
                              )}
                              <span className="font-medium">
                                {msg.prediction.asset} {msg.prediction.direction === 'up' ? 'to' : 'down to'} ${msg.prediction.target.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleLikeMessage(msg.id)}
                            className={`text-xs py-1 px-2 h-auto ${
                              msg.userHasLiked ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500'
                            }`}
                          >
                            {msg.userHasLiked ? '❤️' : '🤍'} {msg.likes}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    No messages yet. Be the first to share your insights!
                  </div>
                )}
              </div>
              
              {/* Message input */}
              {isJoined ? (
                <div className="flex gap-2">
                  <Input 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Share your analysis or predictions..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button onClick={handleSendMessage}>
                    <Send size={16} />
                  </Button>
                </div>
              ) : (
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                  Join this room to participate in the discussion
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="predictions">
          {activeRoom && (
            <div>
              <h4 className="font-semibold mb-3">Community Predictions</h4>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={16} className="text-green-600" />
                    <span className="font-medium">Bullish</span>
                  </div>
                  <div className="text-2xl font-bold">68%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">42 members</div>
                </div>
                
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown size={16} className="text-red-600" />
                    <span className="font-medium">Bearish</span>
                  </div>
                  <div className="text-2xl font-bold">32%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">20 members</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h5 className="text-sm font-medium">Recent Price Targets</h5>
                
                {[
                  { username: 'CryptoWhale', target: 28500, direction: 'up', timeframe: '1 week' },
                  { username: 'TradingMaster', target: 30000, direction: 'up', timeframe: '1 month' },
                  { username: 'CryptoCat', target: 25000, direction: 'down', timeframe: '3 days' }
                ].map((prediction, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/30 p-2 rounded-md">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{prediction.username}</span>
                      <div className={`flex items-center ${
                        prediction.direction === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {prediction.direction === 'up' ? (
                          <TrendingUp size={14} />
                        ) : (
                          <TrendingDown size={14} />
                        )}
                        <span className="ml-1">${prediction.target.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={12} className="mr-1" />
                      <span>{prediction.timeframe}</span>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full mt-2">
                  Add Your Prediction
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CryptoCollaborationZone;
