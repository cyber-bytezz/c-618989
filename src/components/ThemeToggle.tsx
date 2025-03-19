
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Switch } from "@/components/ui/switch";

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle = ({ className = "" }: ThemeToggleProps) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Sun 
        size={18} 
        className={`${isDark ? 'text-gray-400' : 'text-yellow-500'}`}
      />
      <Switch 
        checked={isDark}
        onCheckedChange={toggleTheme}
        aria-label="Toggle dark mode"
      />
      <Moon 
        size={18} 
        className={`${isDark ? 'text-blue-400' : 'text-gray-400'}`}
      />
    </div>
  );
};

export default ThemeToggle;
