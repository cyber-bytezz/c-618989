
import { MarketSentiment as SentimentType } from "../types";
import { 
  Thermometer, 
  ThermometerSun, 
  Snowflake,
  BarChartHorizontal, 
  TrendingUp,
  Gauge
} from "lucide-react";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";

interface MarketSentimentProps {
  sentiment: SentimentType;
  className?: string;
}

const MarketSentiment = ({ sentiment = "neutral", className = "" }: MarketSentimentProps) => {
  const { isDark } = useTheme();
  const [animateValue, setAnimateValue] = useState(0);
  
  const config = {
    extreme_fear: {
      icon: Snowflake,
      label: "Extreme Fear",
      color: "text-red-600",
      bg: "bg-red-100 dark:bg-red-900/30",
      description: "Market in panic mode",
      value: 10
    },
    fear: {
      icon: Snowflake,
      label: "Fear",
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-800/20",
      description: "High risk aversion",
      value: 30
    },
    neutral: {
      icon: Gauge,
      label: "Neutral",
      color: "text-gray-600 dark:text-gray-300",
      bg: "bg-gray-100 dark:bg-gray-800/40",
      description: "Market stability",
      value: 50
    },
    positive: {
      icon: ThermometerSun,
      label: "Positive",
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-800/20",
      description: "Growing confidence",
      value: 70
    },
    greed: {
      icon: BarChartHorizontal,
      label: "Greed",
      color: "text-green-600", 
      bg: "bg-green-100 dark:bg-green-900/30",
      description: "Strong buying pressure",
      value: 85
    },
    extreme_greed: {
      icon: TrendingUp,
      label: "Extreme Greed",
      color: "text-green-700",
      bg: "bg-green-100 dark:bg-green-900/40",
      description: "Potential market top",
      value: 95
    }
  };

  useEffect(() => {
    const currentConfig = config[sentiment];
    if (currentConfig) {
      const targetValue = currentConfig.value;
      let start = 0;
      const animateDuration = 1500;
      const increment = 1000 / 60; // 60fps
      const steps = animateDuration / increment;
      const incrementValue = targetValue / steps;
      
      let timer: number;
      const animate = () => {
        if (start < targetValue) {
          const next = Math.min(start + incrementValue, targetValue);
          setAnimateValue(next);
          start = next;
          timer = window.setTimeout(animate, increment);
        } else {
          setAnimateValue(targetValue);
        }
      };
      
      animate();
      
      return () => clearTimeout(timer);
    }
  }, [sentiment]);

  const currentConfig = config[sentiment];
  if (!currentConfig) {
    return null; // Fallback if sentiment is not valid
  }

  const { icon: Icon, label, color, bg, description, value } = currentConfig;
  
  return (
    <div className={`neo-brutalist-sm p-4 rounded-xl ${bg} ${className} transition-all duration-300`}>
      <div className="flex items-center mb-3">
        <Icon size={24} className={`${color} mr-3`} />
        <div>
          <div className={`font-semibold ${color}`}>{label}</div>
          <div className="text-xs text-gray-600 dark:text-gray-300">{description}</div>
        </div>
      </div>
      
      {/* Interactive sentiment gauge */}
      <div className="mt-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-1">
          <div 
            className={`h-2.5 rounded-full ${sentiment.includes('fear') ? 'bg-red-500' : sentiment === 'neutral' ? 'bg-yellow-400' : 'bg-green-500'}`}
            style={{ width: `${animateValue}%`, transition: 'width 1s ease-in-out' }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Extreme Fear</span>
          <span>Extreme Greed</span>
        </div>
      </div>
    </div>
  );
};

export default MarketSentiment;
