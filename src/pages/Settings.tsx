import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building2, Clock, DollarSign, Bell, Shield, Save, Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language } from "@/types";
import { useStore } from "@/store";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useStore();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    i18n.changeLanguage(settings.language);
    document.documentElement.dir = settings.language === 'ar' ? 'rtl' : 'ltr';
  }, [settings.language, i18n]);

  const handleSave = () => {
    updateSettings(localSettings);
    i18n.changeLanguage(localSettings.language);
    document.documentElement.dir = localSettings.language === 'ar' ? 'rtl' : 'ltr';
    toast({
      title: t('toast.settingsUpdated'),
      description: t('toast.settingsUpdatedDesc'),
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

  const getDayTranslation = (day: string) => {
    const dayKey = day.toLowerCase() as keyof typeof t;
    return t(`days.${dayKey}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
          <p className="text-muted-foreground">
            {t('settings.subtitle')}
          </p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" /> {t('settings.saveAll')}
        </Button>
      </div>

      <Tabs defaultValue="practice" className="space-y-4">
        <TabsList>
          <TabsTrigger value="practice">{t('settings.tabs.practiceInfo')}</TabsTrigger>
          <TabsTrigger value="business">{t('settings.tabs.businessHours')}</TabsTrigger>
          <TabsTrigger value="billing">{t('settings.tabs.pricingBilling')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="language">{t('settings.tabs.language')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
        </TabsList>

        <TabsContent value="practice">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {t('settings.practice.title')}
              </CardTitle>
              <CardDescription>{t('settings.practice.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="practice-name">{t('settings.practice.name')}</Label>
                  <Input 
                    id="practice-name" 
                    value={localSettings.name} 
                    onChange={(e) => setLocalSettings({...localSettings, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-id">{t('settings.practice.taxId')}</Label>
                  <Input 
                    id="tax-id" 
                    value={localSettings.taxId} 
                    onChange={(e) => setLocalSettings({...localSettings, taxId: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('settings.practice.address')}</Label>
                <Input 
                  id="address" 
                  value={localSettings.address} 
                  onChange={(e) => setLocalSettings({...localSettings, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t('settings.practice.email')}</Label>
                  <Input 
                    id="email" 
                    value={localSettings.email} 
                    onChange={(e) => setLocalSettings({...localSettings, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{t('settings.practice.phone')}</Label>
                  <Input 
                    id="phone" 
                    value={localSettings.phone} 
                    onChange={(e) => setLocalSettings({...localSettings, phone: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleSave}>{t('settings.practice.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {t('settings.hours.title')}
              </CardTitle>
              <CardDescription>{t('settings.hours.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {localSettings.businessHours.map((hour, index) => (
                <div key={hour.day} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="font-medium w-24">{getDayTranslation(hour.day)}</span>
                  <div className="flex items-center gap-4">
                    <Input 
                      className="w-24" 
                      type="time"
                      value={hour.open} 
                      onChange={(e) => handleHourChange(index, 'open', e.target.value)}
                      disabled={!hour.isOpen}
                    />
                    <span>{t('settings.hours.to')}</span>
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
              <Button className="mt-4" onClick={handleSave}>{t('settings.hours.update')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {t('settings.billing.title')}
              </CardTitle>
              <CardDescription>{t('settings.billing.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.billing.currency')}</Label>
                <Select 
                  value={localSettings.billing.currency} 
                  onValueChange={(value) => setLocalSettings({
                    ...localSettings, 
                    billing: { ...localSettings.billing, currency: value }
                  })}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="CAD">CAD ($)</SelectItem>
                    <SelectItem value="AUD">AUD ($)</SelectItem>
                    <SelectItem value="JPY">JPY (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('settings.billing.autoInvoicing')}</Label>
                  <p className="text-sm text-muted-foreground">{t('settings.billing.autoInvoicingDesc')}</p>
                </div>
                <Switch 
                  checked={localSettings.billing.automaticInvoicing} 
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    billing: { ...localSettings.billing, automaticInvoicing: checked }
                  })}
                />
              </div>
              <Button onClick={handleSave}>{t('settings.billing.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('settings.notifications.title')}
              </CardTitle>
              <CardDescription>{t('settings.notifications.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t('settings.notifications.reminders')}</Label>
                  <p className="text-sm text-muted-foreground">{t('settings.notifications.remindersDesc')}</p>
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
                  <Label>{t('settings.notifications.followUp')}</Label>
                  <p className="text-sm text-muted-foreground">{t('settings.notifications.followUpDesc')}</p>
                </div>
                <Switch 
                  checked={localSettings.notifications.followUpEmails} 
                  onCheckedChange={(checked) => setLocalSettings({
                    ...localSettings,
                    notifications: { ...localSettings.notifications, followUpEmails: checked }
                  })}
                />
              </div>
              <Button onClick={handleSave}>{t('settings.notifications.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('settings.language.title')}
              </CardTitle>
              <CardDescription>{t('settings.language.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('settings.language.select')}</Label>
                <Select 
                  value={localSettings.language} 
                  onValueChange={(value: Language) => setLocalSettings({...localSettings, language: value})}
                >
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('settings.language.english')}</SelectItem>
                    <SelectItem value="fr">{t('settings.language.french')} (Français)</SelectItem>
                    <SelectItem value="ar">{t('settings.language.arabic')} (العربية)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {t('settings.language.selectDesc')}
                </p>
              </div>
              <Button onClick={handleSave}>{t('settings.language.save')}</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('settings.security.title')}
              </CardTitle>
              <CardDescription>{t('settings.security.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start">{t('settings.security.twoFactor')}</Button>
                <Button variant="outline" className="justify-start">{t('settings.security.apiKeys')}</Button>
                <Button variant="destructive" className="justify-start">{t('settings.security.purgeCache')}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
