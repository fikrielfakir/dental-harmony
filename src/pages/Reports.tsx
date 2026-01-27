import { BarChart3, Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Reports = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          View practice analytics and generate reports
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center mb-4">
            <BarChart3 className="h-8 w-8 text-warning" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Reports Module</h2>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            This module will include revenue analytics, appointment statistics,
            patient demographics, and custom report generation.
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

export default Reports;
