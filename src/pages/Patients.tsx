import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Pill,
  ChevronRight,
  FileText,
  User,
  Hash,
  MapPin,
  ShieldAlert
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Odontogram } from "@/components/dental/Odontogram";
import { Patient } from "@/types";
import { useTranslation } from "react-i18next";

import { DeleteConfirmationDialog } from "@/components/modals/DeleteConfirmationDialog";

const Patients = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { patients, addPatient, updatePatient, deletePatient, dentalChart } = useStore();

  const getLatestTreatment = (patientId: string) => {
    const patientEntries = dentalChart.filter(e => e.patientId === patientId);
    if (patientEntries.length === 0) return null;
    return patientEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);
  const [filterHasAllergies, setFilterHasAllergies] = useState<boolean | null>(null);
  const [filterHasInsurance, setFilterHasInsurance] = useState<boolean | null>(null);

  const [newPatient, setNewPatient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    insuranceProvider: "",
    policyNumber: "",
  });

  const filteredPatients = patients.filter((patient) => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      fullName.includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      patient.phone.includes(query);
    
    const matchesAllergiesFilter =
      filterHasAllergies === null ||
      (filterHasAllergies === true && patient.allergies.length > 0) ||
      (filterHasAllergies === false && patient.allergies.length === 0);
    
    const matchesInsuranceFilter =
      filterHasInsurance === null ||
      (filterHasInsurance === true && !!patient.insuranceProvider) ||
      (filterHasInsurance === false && !patient.insuranceProvider);
    
    return matchesSearch && matchesAllergiesFilter && matchesInsuranceFilter;
  });

  const activeFilterCount = [filterHasAllergies, filterHasInsurance].filter(f => f !== null).length;

  const clearFilters = () => {
    setFilterHasAllergies(null);
    setFilterHasInsurance(null);
  };

  const resetForm = () => {
    setNewPatient({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      address: "",
      insuranceProvider: "",
      policyNumber: "",
    });
  };

  const handleEditPatient = () => {
    if (!selectedPatient) return;
    updatePatient(selectedPatient.id, { ...newPatient });
    setIsEditDialogOpen(false);
    setSelectedPatient(null);
    resetForm();
  };

  const handleAddPatient = () => {
    const patient: Patient = {
      id: crypto.randomUUID(),
      ...newPatient,
      medicalHistory: {
        conditions: [],
        surgeries: [],
        familyHistory: [],
      },
      allergies: [],
      medications: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addPatient(patient);
    setIsAddDialogOpen(false);
    resetForm();
  };

  const closeAddDialog = (open: boolean) => {
    setIsAddDialogOpen(open);
    if (!open) resetForm();
  };

  const closeEditDialog = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setSelectedPatient(null);
      resetForm();
    }
  };

  const handleDeletePatient = (id: string) => {
    setPatientToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeletePatient = () => {
    if (patientToDelete) {
      deletePatient(patientToDelete);
      setPatientToDelete(null);
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const openViewDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsViewDialogOpen(true);
  };

  const closeViewDialog = (open: boolean) => {
    setIsViewDialogOpen(open);
    if (!open) setSelectedPatient(null);
  };

  const openEditDialog = (patient: Patient) => {
    setSelectedPatient(patient);
    setNewPatient({
      firstName: patient.firstName,
      lastName: patient.lastName,
      email: patient.email,
      phone: patient.phone,
      dateOfBirth: patient.dateOfBirth,
      address: patient.address,
      insuranceProvider: patient.insuranceProvider || "",
      policyNumber: patient.policyNumber || "",
    });
    setIsEditDialogOpen(true);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = parseISO(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("patients.title")}</h1>
          <p className="text-muted-foreground">
            {t("patients.subtitle")}
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t("patients.addNew")}
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("patients.searchPlaceholder")}
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative">
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => setFilterHasAllergies(filterHasAllergies === true ? null : true)}
              className={filterHasAllergies === true ? "bg-accent" : ""}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t("patients.hasAllergies")}
              {filterHasAllergies === true && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterHasAllergies(filterHasAllergies === false ? null : false)}
              className={filterHasAllergies === false ? "bg-accent" : ""}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              {t("patients.noAllergiesFilter")}
              {filterHasAllergies === false && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterHasInsurance(filterHasInsurance === true ? null : true)}
              className={filterHasInsurance === true ? "bg-accent" : ""}
            >
              {t("patients.hasInsurance")}
              {filterHasInsurance === true && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterHasInsurance(filterHasInsurance === false ? null : false)}
              className={filterHasInsurance === false ? "bg-accent" : ""}
            >
              {t("patients.noInsurance")}
              {filterHasInsurance === false && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            {activeFilterCount > 0 && (
              <DropdownMenuItem onClick={clearFilters} className="text-destructive font-bold">
                {t("patients.clearFilters")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Patient List */}
      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium">{t("patients.noPatients")}</p>
              <p className="text-muted-foreground">
                {searchQuery
                  ? t("common.tryDifferentSearch", "Try a different search term")
                  : t("common.addFirstPatient", "Add your first patient to get started")}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card
              key={patient.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => openViewDialog(patient)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {patient.firstName.charAt(0)}
                      {patient.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      {patient.allergies.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {t("patients.allergies")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {calculateAge(patient.dateOfBirth)} {t("patients.yearsOld")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        {patient.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        {patient.email}
                      </span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2">
                    {(() => {
                      const latestTreatment = getLatestTreatment(patient.id);
                      if (latestTreatment) {
                        return (
                          <Badge 
                            variant="outline" 
                            className="text-xs capitalize"
                            style={{ 
                              borderColor: latestTreatment.color, 
                              color: latestTreatment.color === '#000000' ? '#000' : latestTreatment.color,
                              backgroundColor: `${latestTreatment.color}10`
                            }}
                          >
                            {latestTreatment.treatmentType}
                          </Badge>
                        );
                      }
                      return null;
                    })()}
                    {patient.insuranceProvider && (
                      <Badge variant="secondary" className="text-xs">
                        {patient.insuranceProvider}
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => openViewDialog(patient)}>{t("common.view")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/appointments")}>{t("appointments.addNew")}</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(patient)}>{t("common.edit")}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePatient(patient.id)}>
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground sm:hidden" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Patient Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={closeViewDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
          {selectedPatient && (
            <>
              <DialogHeader className="p-4 pb-1">
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {selectedPatient.firstName.charAt(0)}
                      {selectedPatient.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-base font-bold">{selectedPatient.firstName} {selectedPatient.lastName}</span>
                    <p className="text-[11px] font-normal text-muted-foreground">
                      {t("patients.patientDetails.patientSince")} {format(parseISO(selectedPatient.createdAt), "MMMM yyyy")}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="profile" className="flex-1 flex flex-col min-h-0">
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1">
                    <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("patients.patientDetails.tabs.profile")}</TabsTrigger>
                    <TabsTrigger value="appointments" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("patients.patientDetails.tabs.appointments")}</TabsTrigger>
                    <TabsTrigger value="notes" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("patients.patientDetails.tabs.notes")}</TabsTrigger>
                    <TabsTrigger value="chart" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">{t("patients.patientDetails.tabs.chart")}</TabsTrigger>
                  </TabsList>
                </div>

                <ScrollArea className="flex-1 min-h-0">
                  <div className="p-4">
                    <TabsContent value="profile" className="m-0 focus-visible:outline-none px-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Info */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t("patients.form.fullName")}</p>
                              <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t("patients.form.dateOfBirth")}</p>
                              <p className="font-medium">{selectedPatient.dateOfBirth}</p>
                            </div>
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Phone className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t("patients.form.phone")}</p>
                              <p className="font-medium">{selectedPatient.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <Mail className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{t("patients.form.email")}</p>
                              <p className="font-medium">{selectedPatient.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Allergies & Medications */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t">
                          <h4 className="font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-destructive" />
                            {t("patients.allergies")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.allergies.length > 0 ? (
                              selectedPatient.allergies.map((allergy, i) => (
                                <Badge key={i} variant="destructive">{allergy}</Badge>
                              ))
                            ) : (
                              <span className="text-sm text-muted-foreground">{t("common.none", "None")}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="appointments" className="m-0 focus-visible:outline-none">
                      <div className="space-y-4 py-2">
                        {(() => {
                          const { appointments } = useStore();
                          const patientAppointments = appointments
                            .filter(a => a.patientId === selectedPatient.id)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                          
                          if (patientAppointments.length === 0) {
                            return (
                              <div className="p-8 text-center border-2 border-dashed rounded-xl bg-slate-50/50 border-slate-200">
                                <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-medium text-slate-500">{t("appointments.noAppointments")}</p>
                                <Button 
                                  variant="link" 
                                  className="mt-2 text-primary"
                                  onClick={() => navigate("/appointments")}
                                >
                                  {t("appointments.addNew")}
                                </Button>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-3">
                              {patientAppointments.map((app) => (
                                <div 
                                  key={app.id} 
                                  className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white shadow-sm hover:border-primary/20 transition-colors"
                                >
                                  <div className="flex items-center gap-4">
                                    <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-slate-50 border border-slate-100">
                                      <span className="text-[10px] font-bold uppercase text-slate-400">
                                        {format(parseISO(app.date), "MMM")}
                                      </span>
                                      <span className="text-lg font-bold text-slate-700 leading-none">
                                        {format(parseISO(app.date), "dd")}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-bold text-sm text-slate-900">{app.type}</p>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-xs text-slate-500 font-medium">{app.time}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="text-xs text-slate-500 font-medium">{app.practitioner}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <Badge 
                                    className={`
                                      text-[10px] font-bold uppercase tracking-wider px-2 py-0.5
                                      ${app.status === 'completed' ? 'bg-green-50 text-green-600 border-green-100' : 
                                        app.status === 'pending' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                                        'bg-slate-50 text-slate-600 border-slate-100'}
                                    `}
                                    variant="outline"
                                  >
                                    {t(`appointments.status.${app.status}`, app.status)}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </TabsContent>

                    <TabsContent value="notes" className="m-0 focus-visible:outline-none">
                      <div className="space-y-4 py-2">
                        {(() => {
                          const { dentalChart } = useStore();
                          const procedureNotes = dentalChart
                            .filter(e => e.patientId === selectedPatient.id && e.notes)
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                          
                          if (procedureNotes.length === 0) {
                            return (
                              <div className="p-8 text-center border-2 border-dashed rounded-xl bg-slate-50/50 border-slate-200">
                                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-medium text-slate-500">{t("common.noData")}</p>
                              </div>
                            );
                          }

                          return (
                            <div className="space-y-4">
                              {procedureNotes.map((note) => (
                                <div key={note.id} className="relative pl-4 border-l-2 border-slate-100 space-y-2 py-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 border-slate-200 font-bold bg-white">
                                        #{note.toothNumber}
                                      </Badge>
                                      <span className="text-xs font-bold text-slate-900 uppercase">
                                        {t(`patients.dentalChart.status.${note.treatmentType.toLowerCase().replace(" ", "-")}`, note.treatmentType)}
                                      </span>
                                    </div>
                                    <time className="text-[10px] font-bold text-slate-400">
                                      {format(parseISO(note.date), "MMM dd, yyyy")}
                                    </time>
                                  </div>
                                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-600 leading-relaxed italic">
                                      "{note.notes}"
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </TabsContent>

                    <TabsContent value="chart" className="m-0 focus-visible:outline-none">
                      <Odontogram patientId={selectedPatient.id} />
                    </TabsContent>
                  </div>
                </ScrollArea>
              </Tabs>

              <DialogFooter className="p-4 pt-2 border-t bg-muted/5 shadow-[0_-1px_0_rgba(0,0,0,0.05)]">
                <Button variant="outline" size="sm" onClick={() => setIsViewDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
                <Button size="sm" onClick={() => navigate("/appointments")}>{t("appointments.addNew")}</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={closeAddDialog}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("patients.addNew")}</DialogTitle>
            <DialogDescription className="text-xs">
              {t("patients.addPatientDesc", "Fill in the essential details to register a new patient.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold">{t("patients.firstName", "First Name")}</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  className="h-8 text-sm"
                  value={newPatient.firstName}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs font-semibold">{t("patients.lastName")}</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  className="h-8 text-sm"
                  value={newPatient.lastName}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth" className="text-xs font-semibold">{t("patients.dateOfBirth")}</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  className="h-8 text-sm"
                  value={newPatient.dateOfBirth}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">{t("patients.phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="h-8 text-sm"
                  value={newPatient.phone}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold">{t("patients.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                className="h-8 text-sm"
                value={newPatient.email}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold">{t("settings.practice.address")}</Label>
              <Input
                id="address"
                placeholder="123 Street Name, City"
                className="h-8 text-sm"
                value={newPatient.address}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="insuranceProvider" className="text-xs font-semibold">{t("settings.tabs.pricingBilling")}</Label>
                <Input
                  id="insuranceProvider"
                  placeholder="Provider"
                  className="h-8 text-sm"
                  value={newPatient.insuranceProvider}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      insuranceProvider: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="policyNumber" className="text-xs font-semibold">{t("patients.policyNumber", "Policy #")}</Label>
                <Input
                  id="policyNumber"
                  placeholder="Number"
                  className="h-8 text-sm"
                  value={newPatient.policyNumber}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, policyNumber: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button variant="secondary" className="h-8 text-xs" onClick={() => setIsAddDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              className="h-8 text-xs"
              onClick={handleAddPatient}
              disabled={!newPatient.firstName || !newPatient.lastName}
            >
              {t("common.add")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{t("patients.editPatient")}</DialogTitle>
            <DialogDescription className="text-xs">
              {t("patients.editPatientDesc", "Update the patient's information.")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-firstName" className="text-xs font-semibold">{t("patients.firstName", "First Name")}</Label>
                <Input
                  id="edit-firstName"
                  className="h-8 text-sm"
                  value={newPatient.firstName}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-lastName" className="text-xs font-semibold">{t("patients.lastName")}</Label>
                <Input
                  id="edit-lastName"
                  className="h-8 text-sm"
                  value={newPatient.lastName}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-dateOfBirth" className="text-xs font-semibold">{t("patients.dateOfBirth")}</Label>
                <Input
                  id="edit-dateOfBirth"
                  type="date"
                  className="h-8 text-sm"
                  value={newPatient.dateOfBirth}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, dateOfBirth: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-phone" className="text-xs font-semibold">{t("patients.phone")}</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  className="h-8 text-sm"
                  value={newPatient.phone}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-xs font-semibold">{t("patients.email")}</Label>
              <Input
                id="edit-email"
                type="email"
                className="h-8 text-sm"
                value={newPatient.email}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-address" className="text-xs font-semibold">{t("settings.practice.address")}</Label>
              <Input
                id="edit-address"
                className="h-8 text-sm"
                value={newPatient.address}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-insurance" className="text-xs font-semibold">{t("settings.tabs.pricingBilling")}</Label>
                <Input
                  id="edit-insurance"
                  className="h-8 text-sm"
                  value={newPatient.insuranceProvider}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      insuranceProvider: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-policy" className="text-xs font-semibold">{t("patients.policyNumber", "Policy #")}</Label>
                <Input
                  id="edit-policy"
                  className="h-8 text-sm"
                  value={newPatient.policyNumber}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, policyNumber: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button variant="secondary" className="h-8 text-xs" onClick={() => setIsEditDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              className="h-8 text-xs"
              onClick={handleEditPatient}
              disabled={!newPatient.firstName || !newPatient.lastName}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeletePatient}
        title="Delete Patient"
        description="Are you sure you want to delete this patient? This record will be permanently removed."
      />
    </div>
  );
};

export default Patients;
