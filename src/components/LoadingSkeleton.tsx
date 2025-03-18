
import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
  count?: number;
  variant?: "card" | "chart" | "detail" | "text";
}

const LoadingSkeleton = ({ 
  className = "", 
  count = 1, 
  variant = "card" 
}: LoadingSkeletonProps) => {
  const getSkeletonClass = () => {
    switch (variant) {
      case "card":
        return "h-36 rounded-xl bg-gray-100";
      case "chart":
        return "h-64 rounded-xl bg-gray-100";
      case "detail":
        return "h-24 rounded-xl bg-gray-100";
      case "text":
        return "h-5 w-32 rounded bg-gray-100";
      default:
        return "h-36 rounded-xl bg-gray-100";
    }
  };

  const baseClass = cn(
    getSkeletonClass(),
    "animate-pulse-slow relative overflow-hidden",
    className
  );

  // Add shimmer effect
  const shimmerClass = 
    "after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r " +
    "after:from-transparent after:via-white/20 after:to-transparent " +
    "after:animate-shimmer";

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={`${baseClass} ${shimmerClass}`}></div>
      ))}
    </>
  );
};

export default LoadingSkeleton;
