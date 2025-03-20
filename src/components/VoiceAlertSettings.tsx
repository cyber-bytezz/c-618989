
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, AlertCircle, Settings, Plus, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AlertSettings } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from 'sonner';

const VoiceAlertSettings: React.FC = () => {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState<AlertSettings>({
    enabled: true,
    voiceEnabled: true,
    priceChangeThreshold: 5,
    assets: ['bitcoin', 'ethereum'],
    customAlerts: [
      { assetId: 'bitcoin', condition: 'above', price: 70000 },
      { assetId: 'ethereum', condition: 'below', price: 2400 },
    ]
  });
  
  const [newAlertAsset, setNewAlertAsset] = useState('bitcoin');
  const [newAlertCondition, setNewAlertCondition] = useState<'above' | 'below'>('above');
  const [newAlertPrice, setNewAlertPrice] = useState('');
  const [showAddAlert, setShowAddAlert] = useState(false);
  
  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);
  
  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('alertSettings', JSON.stringify(settings));
  }, [settings]);
  
  const toggleAlerts = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    toast.success(settings.enabled ? "Alerts disabled" : "Alerts enabled");
  };
  
  const toggleVoiceAlerts = () => {
    setSettings(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
    toast.success(settings.voiceEnabled ? "Voice alerts disabled" : "Voice alerts enabled");
    
    // If enabling voice alerts, play a test alert
    if (!settings.voiceEnabled) {
      const msg = new SpeechSynthesisUtterance("Voice alerts are now enabled");
      msg.volume = 1;
      window.speechSynthesis.speak(msg);
    }
  };
  
  const handleThresholdChange = (value: string) => {
    setSettings(prev => ({ ...prev, priceChangeThreshold: parseInt(value) }));
  };
  
  const handleAssetToggle = (assetId: string) => {
    setSettings(prev => {
      if (prev.assets.includes(assetId)) {
        return { ...prev, assets: prev.assets.filter(a => a !== assetId) };
      } else {
        return { ...prev, assets: [...prev.assets, assetId] };
      }
    });
  };
  
  const addCustomAlert = () => {
    if (!newAlertPrice || isNaN(parseFloat(newAlertPrice))) {
      toast.error("Please enter a valid price");
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      customAlerts: [
        ...prev.customAlerts,
        {
          assetId: newAlertAsset,
          condition: newAlertCondition,
          price: parseFloat(newAlertPrice)
        }
      ]
    }));
    
    setNewAlertAsset('bitcoin');
    setNewAlertCondition('above');
    setNewAlertPrice('');
    setShowAddAlert(false);
    
    toast.success("Custom alert added");
  };
  
  const removeCustomAlert = (index: number) => {
    setSettings(prev => ({
      ...prev,
      customAlerts: prev.customAlerts.filter((_, i) => i !== index)
    }));
    
    toast.success("Custom alert removed");
  };
  
  return (
    <div className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800' : 'bg-white'} p-4 rounded-xl`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {settings.voiceEnabled ? (
            <Volume2 size={18} className="text-blue-500 mr-2" />
          ) : (
            <VolumeX size={18} className="text-gray-500 mr-2" />
          )}
          <h3 className="text-lg font-bold">Voice Alerts</h3>
        </div>
        <div className="relative">
          <Switch 
            checked={settings.enabled}
            onCheckedChange={toggleAlerts}
            className="data-[state=checked]:bg-blue-500"
          />
          {settings.enabled && settings.voiceEnabled && (
            <div className="absolute w-2 h-2 rounded-full bg-green-500 -top-1 -right-1"></div>
          )}
        </div>
      </div>
      
      {settings.enabled && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center">
              <AlertCircle size={14} className="mr-1" /> 
              Price change threshold
            </label>
            <Select 
              value={settings.priceChangeThreshold.toString()} 
              onValueChange={handleThresholdChange}
            >
              <SelectTrigger className="w-24 h-8 text-xs">
                <SelectValue placeholder="Threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2%</SelectItem>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm flex items-center">
              <Volume2 size={14} className="mr-1" /> 
              Voice notifications
            </label>
            <Switch 
              checked={settings.voiceEnabled}
              onCheckedChange={toggleVoiceAlerts}
              className="data-[state=checked]:bg-blue-500"
            />
          </div>
          
          <div>
            <label className="text-sm flex items-center mb-2">
              <Settings size={14} className="mr-1" /> 
              Monitored assets
            </label>
            <div className="flex flex-wrap gap-2">
              {['bitcoin', 'ethereum', 'solana', 'cardano', 'ripple'].map(asset => (
                <button
                  key={asset}
                  onClick={() => handleAssetToggle(asset)}
                  className={`px-2 py-1 text-xs rounded-full ${
                    settings.assets.includes(asset)
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {asset.charAt(0).toUpperCase() + asset.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm flex items-center">
                <AlertCircle size={14} className="mr-1" /> 
                Custom price alerts
              </label>
              <button
                onClick={() => setShowAddAlert(!showAddAlert)}
                className="text-xs flex items-center text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                {showAddAlert ? (
                  <><X size={12} className="mr-1" /> Cancel</>
                ) : (
                  <><Plus size={12} className="mr-1" /> Add</>
                )}
              </button>
            </div>
            
            {showAddAlert && (
              <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg mb-3 flex flex-col space-y-2">
                <div className="grid grid-cols-3 gap-2">
                  <Select value={newAlertAsset} onValueChange={setNewAlertAsset}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bitcoin">Bitcoin</SelectItem>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="cardano">Cardano</SelectItem>
                      <SelectItem value="ripple">XRP</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select 
                    value={newAlertCondition} 
                    onValueChange={(value) => setNewAlertCondition(value as 'above' | 'below')}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="above">Above</SelectItem>
                      <SelectItem value="below">Below</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <input
                    type="number"
                    placeholder="Price"
                    value={newAlertPrice}
                    onChange={(e) => setNewAlertPrice(e.target.value)}
                    className="modern-input text-xs h-8"
                  />
                </div>
                
                <button
                  onClick={addCustomAlert}
                  className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
                >
                  Add Alert
                </button>
              </div>
            )}
            
            <div className="space-y-2">
              {settings.customAlerts.map((alert, index) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-xs">
                  <span className="capitalize">
                    {alert.assetId} {alert.condition} ${alert.price.toLocaleString()}
                  </span>
                  <button
                    onClick={() => removeCustomAlert(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {settings.customAlerts.length === 0 && (
                <div className="text-center text-xs text-gray-500 py-2">
                  No custom alerts set
                </div>
              )}
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
            {settings.voiceEnabled ? (
              <>Voice alerts active for {settings.assets.length} assets</>
            ) : (
              <>Voice alerts disabled</>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAlertSettings;
