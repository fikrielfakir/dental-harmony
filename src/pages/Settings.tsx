import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Building2, Clock, Banknote, Bell, Shield, Save, Globe, Database, Download, Upload, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Language } from "@/types";
import { useStore } from "@/store";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { settings, updateSettings } = useStore();
  const { toast } = useToast();
  const [localSettings, setLocalSettings] = useState(settings);
  const [backups, setBackups] = useState<any[]>([]);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    loadBackups();
  }, []);


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

  // Backup handlers
  const loadBackups = async () => {
    if (!window.electronAPI) return;
    
    setIsLoadingBackups(true);
    try {
      const result = await window.electronAPI.listBackups();
      if (result.success) {
        setBackups(result.backups);
      }
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.backupDatabase();
        if (result.success) {
          toast({
            title: "Backup Created",
            description: result.message || "Database backup created successfully",
          });
          await loadBackups();
          return;
        }
      }

      // Fallback for web environment or if electron fails
      const data = {
        settings,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `dentalcare-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup Downloaded",
        description: "Your settings backup has been downloaded to your computer.",
      });

    } catch (error: any) {
      toast({
        title: "Backup Failed",
        description: error.message || "An error occurred while creating backup",
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestoreBackup = async (backupPath: string) => {
    if (!window.electronAPI) return;

    try {
      const result = await window.electronAPI.restoreBackup(backupPath);
      if (result.success) {
        toast({
          title: "Backup Restored",
          description: result.message,
        });
      } else {
        toast({
          title: "Restore Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Restore Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteBackup = async (backupName: string) => {
    if (!window.electronAPI) return;

    try {
      const result = await window.electronAPI.deleteBackup(backupName);
      if (result.success) {
        toast({
          title: "Backup Deleted",
          description: result.message,
        });
        await loadBackups();
      } else {
        toast({
          title: "Delete Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleExportBackup = async (backupPath: string) => {
    if (!window.electronAPI) return;

    try {
      const result = await window.electronAPI.exportBackup(backupPath);
      if (result.success) {
        toast({
          title: "Backup Exported",
          description: result.message,
        });
      } else if (!result.message.includes('cancelled')) {
        toast({
          title: "Export Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleImportDatabase = async () => {
    if (!window.electronAPI) {
      toast({
        title: "Feature Unavailable",
        description: "Database import is only available in the desktop application.",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await window.electronAPI.importDatabase();
      if (result.success) {
        toast({
          title: "Database Imported",
          description: result.message,
        });
        await loadBackups();
      } else if (!result.message.includes('cancelled')) {
        toast({
          title: "Import Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Import Failed",
        description: error.message,
        variant: "destructive"
      });
    }
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
          <TabsTrigger value="backup">Database Backup</TabsTrigger>
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
                <Banknote className="h-5 w-5" />
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
                    <SelectItem value="MAD">MAD (DH)</SelectItem>
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

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Backup
              </CardTitle>
              <CardDescription>Create and manage database backups for data security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Create Backup</h3>
                  <p className="text-sm text-muted-foreground">
                    Manually create a backup of your database
                  </p>
                </div>
                <Button onClick={handleCreateBackup} disabled={isBackingUp} className="gap-2">
                  <Download className="h-4 w-4" />
                  {isBackingUp ? 'Creating...' : 'Create Backup'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Import Database</h3>
                  <p className="text-sm text-muted-foreground">
                    Import an existing database file (.db)
                  </p>
                </div>
                <Button onClick={handleImportDatabase} variant="outline" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Import Database
                </Button>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Backup History</h3>
                  <Button variant="outline" size="sm" onClick={loadBackups} disabled={isLoadingBackups}>
                    {isLoadingBackups ? 'Loading...' : 'Refresh'}
                  </Button>
                </div>

                {backups.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>File Size</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {backups.map((backup) => (
                          <TableRow key={backup.name}>
                            <TableCell className="font-medium">
                              {new Date(backup.date).toLocaleString()}
                            </TableCell>
                            <TableCell>{backup.formattedSize}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1">
                                      <Upload className="h-3 w-3" />
                                      Restore
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Restore Database?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will replace your current database with this backup. 
                                        A safety backup will be created automatically. 
                                        You'll need to restart the app after restore.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => handleRestoreBackup(backup.path)}>
                                        Restore
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>

                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="gap-1"
                                  onClick={() => handleExportBackup(backup.path)}
                                >
                                  <Download className="h-3 w-3" />
                                  Export
                                </Button>

                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="gap-1 text-destructive">
                                      <Trash2 className="h-3 w-3" />
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Backup?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete this backup file.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteBackup(backup.name)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-lg bg-muted/30">
                    <Database className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No backups found</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first backup to get started
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">📌 Important Notes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Backups are stored in your app data folder</li>
                  <li>• The system automatically keeps the last 10 backups</li>
                  <li>• Use "Export" to save backups to a custom location</li>
                  <li>• A safety backup is created before any restore operation</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">\
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
