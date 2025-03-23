
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchAsset, fetchAssetHistory, formatPrice, formatPercent, formatMarketCap, calculateVolatility } from '@/lib/api';
import { ArrowLeft, TrendingUp, TrendingDown, ExternalLink, Layers, Activity } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { TimeFrame } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PriceChart from '@/components/PriceChart';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import PerformanceComparison from '@/components/PerformanceComparison';
import HODLSentiment from '@/components/HODLSentiment';
import CryptoWhisper from '@/components/CryptoWhisper';
import ProfitLossCalculator from '@/components/ProfitLossCalculator';

// Define the URL parameters
interface AssetDetailParams {
  assetId: string;
}

const AssetDetail = () => {
  const { assetId = '' } = useParams<AssetDetailParams>();
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('d1');
  const [tab, setTab] = useState('price');
  
  // Fetch asset details
  const { data: assetData, isLoading: assetLoading } = useQuery({
    queryKey: ['asset', assetId],
    queryFn: () => fetchAsset(assetId),
    refetchInterval: 60000, // Refetch every minute
  });
  
  // Fetch price history based on selected time frame
  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ['assetHistory', assetId, timeFrame],
    queryFn: () => fetchAssetHistory(assetId, timeFrame),
  });
  
  // Format price history for chart
  const formatPriceHistory = () => {
    if (!historyData?.data) return [];
    
    return historyData.data.map(point => ({
      date: new Date(point.time),
      value: parseFloat(point.priceUsd)
    }));
  };
  
  // Calculate volatility
  const volatility = historyData?.data ? calculateVolatility(historyData.data) : 0;
  
  // Handle time frame change
  const handleTimeFrameChange = (value: string) => {
    setTimeFrame(value as TimeFrame);
  };
  
  const priceChangePercent = assetData?.data ? parseFloat(assetData.data.changePercent24Hr) : 0;
  const isPriceUp = priceChangePercent >= 0;
  
  // For SEO and social sharing
  const assetName = assetData?.data?.name || assetId;
  const assetSymbol = assetData?.data?.symbol || '';
  const assetPrice = assetData?.data?.priceUsd ? formatPrice(assetData.data.priceUsd) : '$0.00';
  
  return (
    <>
      <Helmet>
        <title>{assetName} ({assetSymbol}) Price - CryptoNeo</title>
        <meta name="description" content={`${assetName} (${assetSymbol}) live price, charts, market cap, and latest news. Get the latest ${assetName} information on CryptoNeo.`} />
      </Helmet>
      
      <div className="container mx-auto p-4">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </Link>
        
        {assetLoading ? (
          <LoadingSkeleton />
        ) : assetData ? (
          <div className="space-y-6">
            {/* Asset header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{assetData.data.name}</h1>
                  <Badge variant="outline" className="text-xs font-semibold">
                    {assetData.data.symbol}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    Rank #{assetData.data.rank}
                  </Badge>
                </div>
                
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold">
                    {formatPrice(assetData.data.priceUsd)}
                  </span>
                  <span className={`text-sm font-medium ${isPriceUp ? 'text-green-500' : 'text-red-500'}`}>
                    {isPriceUp ? <TrendingUp size={16} className="inline mr-1" /> : <TrendingDown size={16} className="inline mr-1" />}
                    {formatPercent(assetData.data.changePercent24Hr)}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Market Cap</div>
                  <div className="font-semibold">{formatMarketCap(assetData.data.marketCapUsd)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Volume (24h)</div>
                  <div className="font-semibold">{formatMarketCap(assetData.data.volumeUsd24Hr)}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Volatility</div>
                  <div className="font-semibold">{volatility.toFixed(2)}%</div>
                </div>
              </div>
            </div>
            
            {/* Tabs for different content sections */}
            <Tabs defaultValue="price" value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="price">Price Chart</TabsTrigger>
                <TabsTrigger value="comparison">Performance</TabsTrigger>
                <TabsTrigger value="sentiment">Sentiment</TabsTrigger>
                <TabsTrigger value="tools">Tools</TabsTrigger>
              </TabsList>
              
              <TabsContent value="price" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>Price Chart</CardTitle>
                      <Select 
                        value={timeFrame} 
                        onValueChange={handleTimeFrameChange}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="h1">1 Hour</SelectItem>
                          <SelectItem value="h12">12 Hours</SelectItem>
                          <SelectItem value="d1">1 Day</SelectItem>
                          <SelectItem value="w1">1 Week</SelectItem>
                          <SelectItem value="m1">1 Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <CardDescription>
                      Price history for {assetData.data.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {historyLoading ? (
                      <div className="h-80 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <div className="h-80">
                        <PriceChart 
                          data={formatPriceHistory()} 
                          height={320} 
                          mainLabel={assetData.data.name}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Supply</div>
                        <div className="font-semibold">{formatMarketCap(assetData.data.supply)}</div>
                      </div>
                      {assetData.data.maxSupply && (
                        <div>
                          <div className="text-sm text-gray-500 mb-1">Max Supply</div>
                          <div className="font-semibold">{formatMarketCap(assetData.data.maxSupply)}</div>
                        </div>
                      )}
                      <div>
                        <div className="text-sm text-gray-500 mb-1">VWAP (24h)</div>
                        <div className="font-semibold">{formatPrice(assetData.data.vwap24Hr)}</div>
                      </div>
                    </div>
                    
                    {assetData.data.explorer && (
                      <div className="mt-4 pt-4 border-t">
                        <a 
                          href={assetData.data.explorer} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                        >
                          <ExternalLink size={14} className="mr-1" />
                          View on Explorer
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comparison" className="mt-4">
                <PerformanceComparison 
                  assetId={assetId} 
                  timeFrame={timeFrame}
                  onTimeFrameChange={handleTimeFrameChange}
                />
              </TabsContent>
              
              <TabsContent value="sentiment" className="space-y-4 mt-4">
                <HODLSentiment assetId={assetId} />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Community Insights</CardTitle>
                    <CardDescription>What others are saying about {assetData.data.name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CryptoWhisper assetId={assetId} />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="tools" className="space-y-4 mt-4">
                <ProfitLossCalculator assetId={assetId} currentPrice={parseFloat(assetData.data.priceUsd)} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">Asset not found</h2>
            <p className="text-gray-500 mt-2">The asset you're looking for doesn't exist or couldn't be loaded.</p>
            <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-800">
              Return to Dashboard
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default AssetDetail;
