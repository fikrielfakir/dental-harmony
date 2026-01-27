import { FileText, Construction } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ClinicalRecords = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Clinical Records</h1>
        <p className="text-muted-foreground">
          View and manage patient clinical notes and treatment history
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Clinical Records Module</h2>
          <p className="text-muted-foreground text-center max-w-md mb-4">
            This module will include tooth charts, clinical notes, treatment plans,
            and diagnostic images management.
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

export default ClinicalRecords;
