import { Pill, Plus, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Prescriptions = () => {
  const recentPrescriptions = [
    { id: "RX-1001", patient: "Sarah Johnson", medication: "Amoxicillin", dosage: "500mg", date: "2024-05-15", status: "Active" },
    { id: "RX-1002", patient: "Michael Chen", medication: "Ibuprofen", dosage: "600mg", date: "2024-05-14", status: "Completed" },
    { id: "RX-1003", patient: "Emma Wilson", medication: "Chlorhexidine", dosage: "0.12%", date: "2024-05-12", status: "Active" },
    { id: "RX-1004", patient: "David Miller", medication: "Paracetamol", dosage: "500mg", date: "2024-05-10", status: "Expired" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescriptions</h1>
          <p className="text-muted-foreground">
            Manage patient medications and prescription history
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Prescription
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search prescriptions or patients..." className="pl-10" />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Prescriptions</CardTitle>
          <CardDescription>A list of recently issued prescriptions across the practice.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>RX ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Dosage</TableHead>
                <TableHead>Date Issued</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentPrescriptions.map((rx) => (
                <TableRow key={rx.id}>
                  <TableCell className="font-mono text-xs">{rx.id}</TableCell>
                  <TableCell className="font-medium">{rx.patient}</TableCell>
                  <TableCell>{rx.medication}</TableCell>
                  <TableCell>{rx.dosage}</TableCell>
                  <TableCell>{rx.date}</TableCell>
                  <TableCell>
                    <Badge variant={rx.status === "Active" ? "default" : rx.status === "Completed" ? "secondary" : "outline"}>
                      {rx.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <FileText className="h-4 w-4" />
                    </Button>
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

export default Prescriptions;