
import AssetList from "@/components/AssetList";
import CryptoBattleArena from "@/components/CryptoBattleArena";
import CryptoTimeMachine from "@/components/CryptoTimeMachine";
import CryptoWhisper from "@/components/CryptoWhisper";
import HODLvsSellLeaderboard from "@/components/HODLvsSellLeaderboard";
import HODLSentiment from "@/components/HODLSentiment";
import Header from "@/components/Header";
import MarketPredictions from "@/components/MarketPredictions";
import MarketSentiment from "@/components/MarketSentiment";
import MarketShiftDetector from "@/components/MarketShiftDetector";
import MostWatchedAssets from "@/components/MostWatchedAssets";
import PanicMeter from "@/components/PanicMeter";
import PerformanceComparison from "@/components/PerformanceComparison";
import ProfitLossCalculator from "@/components/ProfitLossCalculator";
import ThemeCustomizer from "@/components/ThemeCustomizer";
import UserXPSystem from "@/components/UserXPSystem";
import VoiceAlertSettings from "@/components/VoiceAlertSettings";
import WhaleWatch from "@/components/WhaleWatch";
import CryptoFortuneTeller from '../components/CryptoFortuneTeller';
import LiveMarketPulse from '@/components/LiveMarketPulse';
import TradingSimulator from '@/components/TradingSimulator';
import AIAdvisor from '@/components/AIAdvisor';
import CryptoCollaborationZone from '@/components/CryptoCollaborationZone';
import { useState, useEffect } from 'react';
import { AssetData, TimeFrame } from '@/types';
import { fetchAssets } from '@/lib/api';
import { useThemeCustomization } from '@/contexts/ThemeCustomizationContext';
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  // State for required props
  const [marketSentiment, setMarketSentiment] = useState<'extreme_fear' | 'fear' | 'neutral' | 'positive' | 'greed' | 'extreme_greed'>('neutral');
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('d1');
  const { themeClass } = useThemeCustomization();

  // Simulated market data fetch for the realistic sentiment analysis
  useEffect(() => {
    // Periodically update market sentiment based on simulated market conditions
    const sentimentValues: ('extreme_fear' | 'fear' | 'neutral' | 'positive' | 'greed' | 'extreme_greed')[] = [
      'fear', 'neutral', 'positive', 'greed', 'neutral', 'positive'
    ];
    
    const interval = setInterval(() => {
      const randomSentiment = sentimentValues[Math.floor(Math.random() * sentimentValues.length)];
      setMarketSentiment(randomSentiment);
    }, 15000); // Change sentiment every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Fetch a default asset for components that need asset data
  useEffect(() => {
    const fetchDefaultAsset = async () => {
      try {
        const response = await fetchAssets(1);
        if (response.data && response.data.length > 0) {
          setSelectedAsset(response.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch default asset:", error);
      }
    };

    fetchDefaultAsset();
  }, []);

  // Handle asset selection from asset list
  const handleAssetSelect = (asset: AssetData) => {
    setSelectedAsset(asset);
  };

  // Handle timeframe change
  const handleTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setTimeFrame(newTimeFrame);
  };

  return (
    <div className={`min-h-screen ${themeClass}`}>
      <Header />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on medium screens and above */}
          <div className="md:col-span-2 space-y-6">
            {/* Top section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MarketSentiment sentiment={marketSentiment} />
              <PanicMeter />
            </div>
            
            {/* New AI Advisor component */}
            {selectedAsset && (
              <AIAdvisor asset={selectedAsset} />
            )}
            
            {/* New Live Market Pulse component */}
            <LiveMarketPulse />
            
            {/* New Crypto Collaboration Zone component */}
            <CryptoCollaborationZone />
            
            {/* Asset list with proper prop */}
            <div>
              {/* We need to pass the onAssetSelect prop */}
              <AssetList onAssetSelect={handleAssetSelect} />
            </div>
            
            {/* Middle section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HODLSentiment />
              <MostWatchedAssets />
            </div>
            
            {/* New Fortune Teller component */}
            <CryptoFortuneTeller />
            
            {/* New Trading Simulator component */}
            {selectedAsset && <TradingSimulator asset={selectedAsset} />}
            
            {/* Battle Arena and Whale Watch section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CryptoBattleArena />
              <WhaleWatch />
            </div>
            
            {/* Market predictions and Time Machine section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MarketPredictions />
              <CryptoTimeMachine />
            </div>
            
            {/* Comparison and Shift Detector section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedAsset && (
                <PerformanceComparison 
                  assetId={selectedAsset.id} 
                  timeFrame={timeFrame}
                  onTimeFrameChange={handleTimeFrameChange}
                />
              )}
              <MarketShiftDetector />
            </div>
          </div>
          
          {/* Sidebar - 1/3 width on medium screens and above */}
          <div className="space-y-6">
            {/* Crypto Whisper component */}
            <CryptoWhisper />
            
            {/* HODLvsSellLeaderboard component */}
            <HODLvsSellLeaderboard />
            
            {/* User XP System */}
            <UserXPSystem />
            
            {/* Profit/Loss Calculator */}
            {selectedAsset && (
              <ProfitLossCalculator asset={selectedAsset} />
            )}
            
            {/* Voice Alert Settings */}
            <VoiceAlertSettings />
            
            {/* Theme Customizer */}
            <ThemeCustomizer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
