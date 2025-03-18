
import { useEffect, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AssetHistoryData, TimeFrame, TimeFrameOption } from '../types';
import { formatPrice } from '../lib/api';

interface PriceChartProps {
  data: AssetHistoryData[];
  color?: string;
  timeFrame: TimeFrame;
}

const PriceChart = ({ data, color = "#0071e3", timeFrame }: PriceChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    if (data && data.length > 0) {
      const formattedData = data.map(item => ({
        date: new Date(item.time).toLocaleDateString(),
        price: parseFloat(item.priceUsd),
        timestamp: item.time,
      }));
      setChartData(formattedData);
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-xl neo-brutalist-sm">
        <p className="text-gray-400">No chart data available</p>
      </div>
    );
  }

  const formatXAxisDate = (value: string) => {
    const date = new Date(value);
    switch (timeFrame) {
      case 'h1':
      case 'h12':
        return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
      case 'd1':
        return `${date.getMonth() + 1}/${date.getDate()}`;
      case 'w1':
      case 'm1':
        return `${date.getMonth() + 1}/${date.getDate()}`;
      default:
        return value;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="neo-brutalist-sm bg-white p-3 rounded-lg">
          <p className="text-sm font-medium">{new Date(payload[0].payload.timestamp).toLocaleString()}</p>
          <p className="text-sm font-mono font-semibold">{formatPrice(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full neo-brutalist-sm bg-white p-4 rounded-xl">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={formatXAxisDate}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (value >= 1000) return `$${Math.round(value / 1000)}k`;
              return `$${value}`;
            }}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="price" 
            stroke={color} 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TIME_FRAME_OPTIONS: TimeFrameOption[] = [
  { value: 'h1', label: '1H' },
  { value: 'h12', label: '12H' },
  { value: 'd1', label: '1D' },
  { value: 'w1', label: '7D' },
  { value: 'm1', label: '30D' },
];

export default PriceChart;
