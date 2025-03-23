
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { RiskProfile } from '@/types';
import { Brain, Shield, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface AISettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  riskProfile: RiskProfile;
  onRiskProfileChange: (profile: RiskProfile) => void;
  isAutomatedMode: boolean;
  onAutomatedModeChange: (enabled: boolean) => void;
}

const AISettingsModal = ({
  open,
  onOpenChange,
  riskProfile,
  onRiskProfileChange,
  isAutomatedMode,
  onAutomatedModeChange
}: AISettingsModalProps) => {
  const [localRiskProfile, setLocalRiskProfile] = useState<RiskProfile>(riskProfile);
  const [localAutomatedMode, setLocalAutomatedMode] = useState(isAutomatedMode);
  const [rebalanceFrequency, setRebalanceFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maxAllocationPerAsset, setMaxAllocationPerAsset] = useState(40);
  
  // Save changes
  const handleSave = () => {
    onRiskProfileChange(localRiskProfile);
    onAutomatedModeChange(localAutomatedMode);
    toast.success("AI settings updated successfully");
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Brain className="h-5 w-5 text-indigo-500 mr-2" />
            AI Portfolio Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Risk Profile</h3>
            <RadioGroup 
              value={localRiskProfile} 
              onValueChange={(value) => setLocalRiskProfile(value as RiskProfile)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="conservative" id="conservative" />
                <Label htmlFor="conservative" className="flex items-center cursor-pointer">
                  <Shield className="h-4 w-4 text-blue-500 mr-2" />
                  Conservative
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="moderate" id="moderate" />
                <Label htmlFor="moderate" className="flex items-center cursor-pointer">
                  <TrendingUp className="h-4 w-4 text-indigo-500 mr-2" />
                  Moderate
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="aggressive" id="aggressive" />
                <Label htmlFor="aggressive" className="flex items-center cursor-pointer">
                  <Zap className="h-4 w-4 text-purple-500 mr-2" />
                  Aggressive
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <RadioGroupItem value="very_aggressive" id="very_aggressive" />
                <Label htmlFor="very_aggressive" className="flex items-center cursor-pointer">
                  <Zap className="h-4 w-4 text-red-500 mr-2" />
                  Very Aggressive
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Automated Rebalancing</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="automated-mode" className="flex items-center">
                <span>Enable automated rebalancing</span>
              </Label>
              <Switch 
                id="automated-mode"
                checked={localAutomatedMode}
                onCheckedChange={setLocalAutomatedMode}
              />
            </div>
            
            {localAutomatedMode && (
              <div className="pl-4 border-l-2 border-indigo-100 dark:border-indigo-800 space-y-3 mt-2">
                <div>
                  <Label htmlFor="rebalance-frequency" className="text-sm">Rebalancing Frequency</Label>
                  <RadioGroup 
                    value={rebalanceFrequency} 
                    onValueChange={(value) => setRebalanceFrequency(value as 'daily' | 'weekly' | 'monthly')}
                    className="flex space-x-4 mt-1"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily" className="text-sm cursor-pointer">Daily</Label>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly" className="text-sm cursor-pointer">Weekly</Label>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly" className="text-sm cursor-pointer">Monthly</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications" className="text-sm">
                    Rebalancing notifications
                  </Label>
                  <Switch 
                    id="notifications"
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max-allocation" className="text-sm block mb-1">
                    Maximum allocation per asset
                  </Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="10"
                      max="80"
                      step="5"
                      value={maxAllocationPerAsset}
                      onChange={(e) => setMaxAllocationPerAsset(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-sm font-medium w-8">{maxAllocationPerAsset}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AISettingsModal;
