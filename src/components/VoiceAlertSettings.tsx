import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, AlertCircle, Settings, Plus, X, History, User, Volume1, VolumeIcon } from 'lucide-react';
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
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';

interface VoiceAlert {
  message: string;
  timestamp: number;
  type: 'price' | 'custom' | 'market';
  assetId?: string;
}

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
  const [alertVolume, setAlertVolume] = useState(80);
  const [voiceStyle, setVoiceStyle] = useState('female');
  const [alertHistory, setAlertHistory] = useState<VoiceAlert[]>([
    { message: "Bitcoin surged past $60,000!", timestamp: Date.now() - 3600000, type: 'price', assetId: 'bitcoin' },
    { message: "Ethereum dropped 5% in the last hour", timestamp: Date.now() - 7200000, type: 'price', assetId: 'ethereum' },
    { message: "Custom alert: Bitcoin above $60,000", timestamp: Date.now() - 14400000, type: 'custom', assetId: 'bitcoin' },
  ]);
  
  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const savedVolume = localStorage.getItem('alertVolume');
    if (savedVolume) {
      setAlertVolume(parseInt(savedVolume));
    }
    
    const savedVoiceStyle = localStorage.getItem('voiceStyle');
    if (savedVoiceStyle) {
      setVoiceStyle(savedVoiceStyle);
    }
    
    const savedHistory = localStorage.getItem('alertHistory');
    if (savedHistory) {
      setAlertHistory(JSON.parse(savedHistory));
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('alertSettings', JSON.stringify(settings));
    localStorage.setItem('alertVolume', alertVolume.toString());
    localStorage.setItem('voiceStyle', voiceStyle);
    localStorage.setItem('alertHistory', JSON.stringify(alertHistory));
  }, [settings, alertVolume, voiceStyle, alertHistory]);
  
  const playTestVoice = () => {
    if (!settings.voiceEnabled) return;
    
    const msg = new SpeechSynthesisUtterance("This is a test alert for Crypto Tracker");
    msg.volume = alertVolume / 100;
    
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice;
    
    if (voiceStyle === 'female') {
      selectedVoice = voices.find(voice => voice.name.includes('Female') || voice.name.includes('Google US English Female'));
    } else if (voiceStyle === 'male') {
      selectedVoice = voices.find(voice => voice.name.includes('Male') || voice.name.includes('Google US English Male'));
    } else if (voiceStyle === 'robotic') {
      msg.pitch = 0.5;
      msg.rate = 0.8;
    }
    
    if (selectedVoice) {
      msg.voice = selectedVoice;
    }
    
    window.speechSynthesis.speak(msg);
    
    const newAlert: VoiceAlert = {
      message: "Test alert message",
      timestamp: Date.now(),
      type: 'custom'
    };
    
    setAlertHistory(prev => [newAlert, ...prev.slice(0, 9)]);
    
    toast.success("Test alert played");
  };
  
  const toggleAlerts = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    toast.success(settings.enabled ? "Alerts disabled" : "Alerts enabled");
  };
  
  const toggleVoiceAlerts = () => {
    setSettings(prev => ({ ...prev, voiceEnabled: !prev.voiceEnabled }));
    toast.success(settings.voiceEnabled ? "Voice alerts disabled" : "Voice alerts enabled");
    
    if (!settings.voiceEnabled) {
      playTestVoice();
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
  
  const clearAlertHistory = () => {
    setAlertHistory([]);
    toast.success("Alert history cleared");
  };
  
  const formatAlertTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={`neo-brutalist-sm ${isDark ? 'dark:bg-gray-800' : 'bg-white'} p-4 rounded-xl overflow-hidden`}>
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
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">Alert History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4">
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
            
            {settings.voiceEnabled && (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm flex items-center">
                      <User size={14} className="mr-1" /> 
                      Voice style
                    </label>
                    <Select 
                      value={voiceStyle} 
                      onValueChange={setVoiceStyle}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs">
                        <SelectValue placeholder="Voice" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="robotic">Robotic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-sm flex items-center">
                        <Volume1 size={14} className="mr-1" /> 
                        Volume
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{alertVolume}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <VolumeIcon size={14} className="text-gray-500 dark:text-gray-400" />
                      <Slider
                        value={[alertVolume]}
                        onValueChange={(values) => setAlertVolume(values[0])}
                        max={100}
                        step={5}
                        className="flex-1"
                      />
                      <Volume2 size={14} className="text-gray-500 dark:text-gray-400" />
                    </div>
                    <button
                      onClick={playTestVoice}
                      className="w-full text-xs mt-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 py-1 px-2 rounded hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                    >
                      Test voice
                    </button>
                  </div>
                </div>
              </>
            )}
            
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
          </TabsContent>
          
          <TabsContent value="history" className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium flex items-center">
                <History size={14} className="mr-1" />
                Recent Alerts
              </h4>
              
              <button
                onClick={clearAlertHistory}
                className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Clear history
              </button>
            </div>
            
            {alertHistory.length === 0 ? (
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
                No alerts in history
              </div>
            ) : (
              <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                {alertHistory.map((alert, index) => (
                  <div 
                    key={index}
                    className={`text-xs p-2 rounded ${
                      alert.type === 'price' 
                        ? 'bg-blue-50 dark:bg-blue-900/20' 
                        : alert.type === 'custom'
                          ? 'bg-purple-50 dark:bg-purple-900/20'
                          : 'bg-gray-50 dark:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{alert.message}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 shrink-0">
                        {formatAlertTime(alert.timestamp)}
                      </span>
                    </div>
                    {alert.assetId && (
                      <div className="text-gray-500 dark:text-gray-400 capitalize">
                        {alert.assetId}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default VoiceAlertSettings;
