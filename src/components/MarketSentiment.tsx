
import { MarketSentiment as SentimentType } from "../types";
import { 
  ThermometerSnow, 
  Thermometer, 
  ThermometerSun, 
  BarChartHorizontal, 
  TrendingUp 
} from "lucide-react";

interface MarketSentimentProps {
  sentiment: SentimentType;
  className?: string;
}

const MarketSentiment = ({ sentiment, className = "" }: MarketSentimentProps) => {
  const config = {
    extreme_fear: {
      icon: ThermometerSnow,
      label: "Extreme Fear",
      color: "text-red-600",
      bg: "bg-red-100",
      description: "Market in panic mode",
    },
    fear: {
      icon: ThermometerSnow,
      label: "Fear",
      color: "text-red-500",
      bg: "bg-red-50",
      description: "High risk aversion",
    },
    neutral: {
      icon: Thermometer,
      label: "Neutral",
      color: "text-gray-600",
      bg: "bg-gray-100",
      description: "Market stability",
    },
    positive: {
      icon: ThermometerSun,
      label: "Positive",
      color: "text-green-500",
      bg: "bg-green-50",
      description: "Growing confidence",
    },
    greed: {
      icon: BarChartHorizontal,
      label: "Greed",
      color: "text-green-600",
      bg: "bg-green-100",
      description: "Strong buying pressure",
    },
    extreme_greed: {
      icon: TrendingUp,
      label: "Extreme Greed",
      color: "text-green-700",
      bg: "bg-green-100",
      description: "Potential market top",
    },
  };

  const { icon: Icon, label, color, bg, description } = config[sentiment];

  return (
    <div className={`neo-brutalist-sm flex items-center p-3 ${bg} ${className}`}>
      <Icon size={24} className={`${color} mr-3`} />
      <div>
        <div className={`font-semibold ${color}`}>{label}</div>
        <div className="text-xs text-gray-600">{description}</div>
      </div>
    </div>
  );
};

export default MarketSentiment;
