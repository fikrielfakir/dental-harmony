import { useState } from "react";
import { FileText, Plus, Search, History, Activity, MoreVertical } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStore } from "@/store";
import { useTranslation } from "react-i18next";

const ClinicalRecords = () => {
  const { t } = useTranslation();
  const { patients, clinicalNotes, addClinicalNote, updateClinicalNote, deleteClinicalNote } = useStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [newRecord, setNewRecord] = useState({
    patientId: "",
    procedure: "",
    doctor: "",
    status: "Scheduled" as any,
    notes: "",
    cost: "",
  });

  const resetForm = () => {
    setNewRecord({
      patientId: "",
      procedure: "",
      doctor: "",
      status: "Scheduled",
      notes: "",
      cost: "",
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
        procedures: [{
          name: newRecord.procedure,
          priority: 'medium',
          status: 'planned'
        }],
        estimatedCost: parseFloat(newRecord.cost) || 0,
        estimatedDuration: "1 hour",
      },
      notes: newRecord.notes,
      teethStatus: [],
      attachments: [],
      // Adding extra fields for the UI display in this page
      procedure: newRecord.procedure,
      doctor: newRecord.doctor,
      status: newRecord.status,
      cost: parseFloat(newRecord.cost) || 0,
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Scheduled": return t("clinical.status.scheduled");
      case "In Progress": return t("clinical.status.inProgress");
      case "Completed": return t("clinical.status.completed");
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("clinical.title")}</h1>
          <p className="text-muted-foreground">
            {t("clinical.subtitle")}
          </p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("clinical.addNew")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              {t("clinical.activeTreatments")}
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
              {t("clinical.completedThisMonth")}
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
              {t("clinical.pendingPlans")}
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
            placeholder={t("clinical.searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">{t("clinical.advancedSearch")}</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("clinical.recentActivity")}</CardTitle>
          <CardDescription>{t("clinical.recentActivityDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("clinical.table.recordId")}</TableHead>
                <TableHead>{t("clinical.table.patient")}</TableHead>
                <TableHead>{t("clinical.table.procedure")}</TableHead>
                <TableHead>{t("clinical.table.cost")}</TableHead>
                <TableHead>{t("clinical.table.date")}</TableHead>
                <TableHead>{t("clinical.table.doctor")}</TableHead>
                <TableHead>{t("clinical.table.status")}</TableHead>
                <TableHead className="text-right">{t("clinical.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {t("clinical.noRecords")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record: any) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-mono text-xs">{record.id.slice(0, 8)}</TableCell>
                    <TableCell className="font-medium">{record.patientName}</TableCell>
                    <TableCell>{record.procedure}</TableCell>
                    <TableCell className="font-medium">€{(record.cost || 0).toLocaleString()}</TableCell>
                    <TableCell>{new Date(record.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{record.doctor}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "Completed" ? "default" : record.status === "In Progress" ? "secondary" : "outline"}>
                        {getStatusLabel(record.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateClinicalNote(record.id, { notes: record.notes })}>
                            {t("clinical.actions.viewNote")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateClinicalNote(record.id, { status: 'Completed' })}>
                            {t("clinical.actions.markCompleted")}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteClinicalNote(record.id)}>
                            {t("clinical.actions.deleteRecord")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
            <DialogTitle>{t("clinical.form.title")}</DialogTitle>
            <DialogDescription>
              {t("clinical.form.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="patient">{t("clinical.form.patient")}</Label>
              <Select
                value={newRecord.patientId}
                onValueChange={(value) => setNewRecord({ ...newRecord, patientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("clinical.form.selectPatient")} />
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
              <Label htmlFor="procedure">{t("clinical.form.procedure")}</Label>
              <Input
                id="procedure"
                placeholder={t("clinical.form.procedurePlaceholder")}
                value={newRecord.procedure}
                onChange={(e) => setNewRecord({ ...newRecord, procedure: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctor">{t("clinical.form.doctor")}</Label>
              <Input
                id="doctor"
                placeholder={t("clinical.form.doctorPlaceholder")}
                value={newRecord.doctor}
                onChange={(e) => setNewRecord({ ...newRecord, doctor: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">{t("clinical.form.cost")}</Label>
              <Input
                id="cost"
                type="number"
                placeholder="0.00"
                value={newRecord.cost}
                onChange={(e) => setNewRecord({ ...newRecord, cost: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t("clinical.form.status")}</Label>
              <Select
                value={newRecord.status}
                onValueChange={(value: "Scheduled" | "In Progress" | "Completed") => setNewRecord({ ...newRecord, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("clinical.form.selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Scheduled">{t("clinical.status.scheduled")}</SelectItem>
                  <SelectItem value="In Progress">{t("clinical.status.inProgress")}</SelectItem>
                  <SelectItem value="Completed">{t("clinical.status.completed")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("clinical.form.notes")}</Label>
              <Textarea
                id="notes"
                placeholder={t("clinical.form.notesPlaceholder")}
                rows={4}
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleAddRecord}
              disabled={!newRecord.patientId || !newRecord.procedure || !newRecord.doctor}
            >
              {t("clinical.form.addRecord")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClinicalRecords;