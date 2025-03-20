
import React, { useState } from 'react';
import { useThemeCustomization } from '../contexts/ThemeCustomizationContext';
import { useTheme } from '../contexts/ThemeContext';
import { Palette, Check, Brush, Eye, EyeOff, Paintbrush, Tablet, Maximize, Layers } from 'lucide-react';

const themeOptions = [
  { id: 'neo-brutalist', label: 'Neo-Brutalist', icon: <Layers size={14} /> },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: <Maximize size={14} /> },
  { id: 'minimalist', label: 'Minimalist', icon: <Tablet size={14} /> },
  { id: 'custom', label: 'Custom', icon: <Paintbrush size={14} /> }
];

interface ColorOptionProps {
  color: string;
  selected: boolean;
  onClick: () => void;
}

const ColorOption: React.FC<ColorOptionProps> = ({ color, selected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-6 h-6 rounded-full flex items-center justify-center ${selected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
    style={{ backgroundColor: color }}
    aria-label={`Color ${color}`}
  >
    {selected && <Check size={12} className="text-white" />}
  </button>
);

const ThemeCustomizer: React.FC = () => {
  const { uiTheme, customization, setUITheme, updateCustomization, toggleHighContrast } = useThemeCustomization();
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const primaryColorOptions = ['#0071e3', '#ff3b30', '#34c759', '#ff9500', '#af52de', '#ff2d55', '#5856d6'];
  const fontOptions = [
    { value: 'system-ui, sans-serif', label: 'System' },
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'monospace', label: 'Monospace' },
    { value: '"Helvetica Neue", sans-serif', label: 'Helvetica' }
  ];
  const borderRadiusOptions = [
    { value: '0', label: 'None' },
    { value: '0.25rem', label: 'Small' },
    { value: '0.5rem', label: 'Medium' },
    { value: '1rem', label: 'Large' },
    { value: '9999px', label: 'Full' }
  ];
  
  return (
    <div className={`${isDark ? 'dark:bg-gray-800' : 'bg-white'} rounded-xl ${isOpen ? 'neo-brutalist-sm' : ''}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center p-3 rounded-xl justify-between ${
          isOpen ? '' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <div className="flex items-center">
          <Palette size={18} className="text-indigo-500 mr-2" />
          <h3 className="text-lg font-bold">UI Customization</h3>
        </div>
        <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
          {uiTheme.charAt(0).toUpperCase() + uiTheme.slice(1)} Theme
        </span>
      </button>
      
      {isOpen && (
        <div className="p-4 pt-0">
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Theme Style</p>
            <div className="grid grid-cols-2 gap-2">
              {themeOptions.map(theme => (
                <button
                  key={theme.id}
                  onClick={() => setUITheme(theme.id as any)}
                  className={`flex items-center justify-center p-2 rounded text-xs font-medium ${
                    uiTheme === theme.id
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {theme.icon}
                  <span className="ml-1.5">{theme.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Accessibility</p>
              <button
                onClick={toggleHighContrast}
                className={`flex items-center text-xs px-2 py-1 rounded ${
                  customization.highContrast
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {customization.highContrast ? (
                  <><Eye size={12} className="mr-1" /> High Contrast</>
                ) : (
                  <><EyeOff size={12} className="mr-1" /> Normal Contrast</>
                )}
              </button>
            </div>
          </div>
          
          {uiTheme === 'custom' && (
            <>
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Primary Color</p>
                <div className="flex space-x-2">
                  {primaryColorOptions.map(color => (
                    <ColorOption
                      key={color}
                      color={color}
                      selected={customization.primaryColor === color}
                      onClick={() => updateCustomization({ primaryColor: color })}
                    />
                  ))}
                  <input
                    type="color"
                    value={customization.primaryColor}
                    onChange={(e) => updateCustomization({ primaryColor: e.target.value })}
                    className="w-6 h-6 rounded cursor-pointer"
                    aria-label="Custom color picker"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Font Family</p>
                <select
                  value={customization.fontFamily}
                  onChange={(e) => updateCustomization({ fontFamily: e.target.value })}
                  className="w-full p-2 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                >
                  {fontOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Border Radius</p>
                <div className="grid grid-cols-5 gap-2">
                  {borderRadiusOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => updateCustomization({ borderRadius: option.value })}
                      className={`p-1 text-xs rounded ${
                        customization.borderRadius === option.value
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
          
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            Changes are saved automatically
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeCustomizer;
