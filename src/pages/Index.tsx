
import { Helmet } from 'react-helmet-async';
import AssetList from '@/components/AssetList';
import MarketSentiment from '@/components/MarketSentiment';
import { useEffect, useState } from 'react';
import { fetchAssets, calculateMarketSentiment } from '@/lib/api';
import { AssetsResponse, MarketSentiment as SentimentType } from '@/types';
import { useTheme } from '@/contexts/ThemeContext';
import CryptoBattleArena from '@/components/CryptoBattleArena';
import MarketPredictions from '@/components/MarketPredictions';
import UserXPSystem from '@/components/UserXPSystem';
import CryptoStorm from '../components/CryptoStorm';
import CryptoTimeMachine from '@/components/CryptoTimeMachine';
import AIPortfolioRebalancer from '@/components/AIPortfolioRebalancer';

export default function Home() {
  const [assets, setAssets] = useState<AssetsResponse | null>(null);
  const [marketSentiment, setMarketSentiment] = useState<SentimentType>("neutral");
  const { isDark } = useTheme();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const assetsData = await fetchAssets();
        setAssets(assetsData);
        
        // Calculate market sentiment
        const sentiment = calculateMarketSentiment(assetsData);
        setMarketSentiment(sentiment);
      } catch (error) {
        console.error("Failed to fetch assets:", error);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <>
      <Helmet>
        <title>CryptoNeo</title>
        <meta name="description" content="Advanced crypto tracking platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Helmet>
      <main className={`${isDark ? 'dark' : ''}`}>
        <div className="container mx-auto p-4">
          <h1 className="text-2xl font-bold mb-4">
            Welcome to CryptoNeo
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <CryptoStorm />
            <MarketSentiment sentiment={marketSentiment} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
            <AIPortfolioRebalancer assets={assets?.data} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
            <CryptoTimeMachine />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <CryptoBattleArena />
            <MarketPredictions />
            <UserXPSystem />
          </div>
          
          <AssetList />
        </div>
      </main>
    </>
  );
}
