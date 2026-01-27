import { useState } from "react";
import { FileText, Plus, Search, History, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/store";

interface ClinicalRecord {
  id: string;
  patient: string;
  procedure: string;
  date: string;
  doctor: string;
  status: string;
  notes?: string;
}

const ClinicalRecords = () => {
  const { patients, clinicalNotes, addClinicalNote } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newRecord, setNewRecord] = useState({
    patientId: "",
    procedure: "",
    doctor: "",
    status: "Scheduled" as any,
    notes: "",
  });

  const resetForm = () => {
    setNewRecord({
      patientId: "",
      procedure: "",
      doctor: "",
      status: "Scheduled",
      notes: "",
    });
  };

  const handleAddRecord = () => {
    const selectedPatient = patients.find(p => p.id === newRecord.patientId);
    const note: any = {
      id: crypto.randomUUID(),
      patientId: newRecord.patientId,
      practitionerId: "1", // Default practitioner or current user
      appointmentId: "",
      content: newRecord.notes,
      type: "clinical-note",
      tags: [newRecord.procedure],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      diagnosis: "",
      treatmentPlan: {
        procedures: [],
        estimatedCost: 0,
        estimatedDuration: "",
      },
      notes: newRecord.notes,
      teethStatus: [],
      attachments: [],
      // Adding extra fields for the UI display in this page
      procedure: newRecord.procedure,
      doctor: newRecord.doctor,
      status: newRecord.status,
      patientName: selectedPatient ? `${selectedPatient.firstName} ${selectedPatient.lastName}` : "Unknown Patient"
    };
    addClinicalNote(note);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const closeAddDialog = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) resetForm();
  };

  const filteredRecords = clinicalNotes.filter((record: any) => {
    const query = searchQuery.toLowerCase();
    const patientName = record.patientName || "";
    return (
      patientName.toLowerCase().includes(query) ||
      (record.procedure || "").toLowerCase().includes(query) ||
      (record.doctor || "").toLowerCase().includes(query) ||
      record.id.toLowerCase().includes(query)
    );
  });

  const activeCount = clinicalNotes.filter((r: any) => r.status === "In Progress").length;
  const completedCount = clinicalNotes.filter((r: any) => r.status === "Completed").length;
  const scheduledCount = clinicalNotes.filter((r: any) => r.status === "Scheduled").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clinical Records</h1>
          <p className="text-muted-foreground">
            Manage patient clinical history, notes, and treatment plans
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsAddDialogOpen(true)}>
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
            <div className="text-2xl font-bold">{activeCount}</div>
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
            <div className="text-2xl font-bold">{completedCount}</div>
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
            <div className="text-2xl font-bold">{scheduledCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Search patient records, procedures, or notes..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs">{record.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{record.patientName}</TableCell>
                    <TableCell>{record.procedure}</TableCell>
                    <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={closeAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Clinical Note</DialogTitle>
            <DialogDescription>
              Create a new clinical record or treatment note.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <Select
                value={newRecord.patientId}
                onValueChange={(value) => setNewRecord({ ...newRecord, patientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="procedure">Procedure / Note Type</Label>
              <Input
                id="procedure"
                placeholder="e.g., Root Canal, Check-up, Treatment Note"
                value={newRecord.procedure}
                onChange={(e) => setNewRecord({ ...newRecord, procedure: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Input
                id="doctor"
                placeholder="e.g., Dr. Smith"
                value={newRecord.doctor}
                onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newRecord.status}
                onValueChange={(value: "Scheduled" | "In Progress" | "Completed") => setNewRecord({ ...newRecord, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Clinical Notes</Label>
              <Textarea
                id="notes"
                placeholder="Enter detailed clinical notes..."
                rows={4}
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddRecord}
              disabled={!newRecord.patientId || !newRecord.procedure || !newRecord.doctor}
            >
              Add Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicalRecords;