import { FileText, Plus, Search, History, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const ClinicalRecords = () => {
  const clinicalRecords = [
    { id: "REC-101", patient: "Sarah Johnson", procedure: "Root Canal", date: "2024-05-15", doctor: "Dr. Smith", status: "Completed" },
    { id: "REC-102", patient: "Michael Chen", procedure: "Teeth Whitening", date: "2024-05-14", doctor: "Dr. Adams", status: "In Progress" },
    { id: "REC-103", patient: "Emma Wilson", procedure: "Dental Implant", date: "2024-05-12", doctor: "Dr. Smith", status: "Scheduled" },
    { id: "REC-104", patient: "David Miller", procedure: "Regular Check-up", date: "2024-05-10", doctor: "Dr. Adams", status: "Completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Records</h1>
          <p className="text-muted-foreground">
            Manage patient clinical history, notes, and treatment plans
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Clinical Note
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <History className="h-4 w-4" />
              Completed (This Month)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              Pending Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search patient records, procedures, or notes..." className="pl-10" />
        </div>
        <Button variant="outline">Advanced Search</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Clinical Activity</CardTitle>
          <CardDescription>A chronological view of recent patient treatments and notes.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Record ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Procedure / Note</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clinicalRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-mono text-xs">{record.id}</TableCell>
                  <TableCell className="font-medium">{record.patient}</TableCell>
                  <TableCell>{record.procedure}</TableCell>
                  <TableCell>{record.date}</TableCell>
                  <TableCell>{record.doctor}</TableCell>
                  <TableCell>
                    <Badge variant={record.status === "Completed" ? "default" : record.status === "In Progress" ? "secondary" : "outline"}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalRecords;