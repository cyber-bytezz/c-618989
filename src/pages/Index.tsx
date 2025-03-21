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

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content - 2/3 width on medium screens and above */}
          <div className="md:col-span-2 space-y-6">
            {/* Top section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MarketSentiment />
              <PanicMeter />
            </div>
            
            {/* Asset list */}
            <AssetList />
            
            {/* Middle section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <HODLSentiment />
              <MostWatchedAssets />
            </div>
            
            {/* New Fortune Teller component */}
            <CryptoFortuneTeller />
            
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
              <PerformanceComparison />
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
            <ProfitLossCalculator />
            
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
