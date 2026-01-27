import { Settings as SettingsIcon, Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your practice settings and preferences
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <SettingsIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Settings Module</h2>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            This module will include practice information, business hours,
            service pricing, notification templates, and system configuration.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Construction className="h-4 w-4" />
            Coming soon with Cloud integration
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
