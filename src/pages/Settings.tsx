import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building2, Clock, DollarSign, Bell, Shield, Save } from "lucide-react";
import { useStore } from "@/store";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { settings, updateSettings } = useStore();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    toast({
      title: "Settings updated",
      description: "Your practice preferences have been saved successfully.",
    });
  };

  const handleHourChange = (dayIndex: number, field: 'open' | 'close', value: string) => {
    const newHours = [...localSettings.businessHours];
    newHours[dayIndex] = { ...newHours[dayIndex], [field]: value };
    setLocalSettings({ ...localSettings, businessHours: newHours });
  };

  const handleDayToggle = (dayIndex: number, isOpen: boolean) => {
    const newHours = [...localSettings.businessHours];
    newHours[dayIndex] = { ...newHours[dayIndex], isOpen };
    setLocalSettings({ ...localSettings, businessHours: newHours });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your practice settings and preferences
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="practice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="practice">Practice Info</TabsTrigger>
          <TabsTrigger value="business">Business Hours</TabsTrigger>
          <TabsTrigger value="billing">Pricing & Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Practice Information
              </CardTitle>
              <CardDescription>Update your practice details and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="practice-name">Practice Name</Label>
                  <Input 
                    id="practice-name" 
                    value={localSettings.name} 
                    onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">Tax ID / NPI</Label>
                  <Input 
                    id="tax-id" 
                    value={localSettings.taxId} 
                    onChange={(e) => setLocalSettings({...localSettings, taxId: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input 
                  id="address" 
                  value={localSettings.address} 
                  onChange={(e) => setLocalSettings({...localSettings, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Public Email</Label>
                  <Input 
                    id="email" 
                    value={localSettings.email} 
                    onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={localSettings.phone} 
                    onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleSave}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
              <CardDescription>Set when your practice is open for appointments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {localSettings.businessHours.map((hour, index) => (
                <div key={hour.day} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium w-24">{hour.day}</span>
                  <div className="flex items-center gap-4">
                    <Input 
                      className="w-24" 
                      type="time"
                      value={hour.open} 
                      onChange={(e) => handleHourChange(index, 'open', e.target.value)}
                      disabled={!hour.isOpen}
                    />
                    <span>to</span>
                    <Input 
                      className="w-24" 
                      type="time"
                      value={hour.close} 
                      onChange={(e) => handleHourChange(index, 'close', e.target.value)}
                      disabled={!hour.isOpen}
                    />
                    <Switch 
                      checked={hour.isOpen} 
                      onCheckedChange={(checked) => handleDayToggle(index, checked)}
                    />
                  </div>
                </div>
              ))}
              <Button className="mt-4" onClick={handleSave}>Update Hours</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Billing Configuration
              </CardTitle>
              <CardDescription>Manage your service pricing and payment methods.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input 
                  value={localSettings.billing.currency} 
                  onChange={(e) => setLocalSettings({
                    ...localSettings, 
                    billing: { ...localSettings.billing, currency: e.target.value }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Automatic Invoicing</Label>
                  <p className="text-sm text-muted-foreground">Generate invoices immediately after appointments.</p>
                </div>
                <Switch 
                  checked={localSettings.billing.automaticInvoicing} 
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    billing: { ...localSettings.billing, automaticInvoicing: checked }
                  })}
                />
              </div>
              <Button onClick={handleSave}>Save Billing Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Templates
              </CardTitle>
              <CardDescription>Configure patient reminders and staff alerts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Appointment Reminders</Label>
                  <p className="text-sm text-muted-foreground">Send SMS reminders 24 hours before.</p>
                </div>
                <Switch 
                  checked={localSettings.notifications.appointmentReminders} 
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, appointmentReminders: checked }
                  })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Follow-up Emails</Label>
                  <p className="text-sm text-muted-foreground">Send satisfaction surveys after procedures.</p>
                </div>
                <Switch 
                  checked={localSettings.notifications.followUpEmails} 
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, followUpEmails: checked }
                  })}
                />
              </div>
              <Button onClick={handleSave}>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Access
              </CardTitle>
              <CardDescription>Manage system access and data protection.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start">Two-Factor Authentication</Button>
                <Button variant="outline" className="justify-start">Manage API Keys</Button>
                <Button variant="destructive" className="justify-start">Purge Practice Cache</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;