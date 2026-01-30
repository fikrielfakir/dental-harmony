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
  FileText
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
              Has Allergies
              {filterHasAllergies === true && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterHasAllergies(filterHasAllergies === false ? null : false)}
              className={filterHasAllergies === false ? "bg-accent" : ""}
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              No Allergies
              {filterHasAllergies === false && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterHasInsurance(filterHasInsurance === true ? null : true)}
              className={filterHasInsurance === true ? "bg-accent" : ""}
            >
              Has Insurance
              {filterHasInsurance === true && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setFilterHasInsurance(filterHasInsurance === false ? null : false)}
              className={filterHasInsurance === false ? "bg-accent" : ""}
            >
              No Insurance
              {filterHasInsurance === false && <span className="ml-auto">✓</span>}
            </DropdownMenuItem>
            {activeFilterCount > 0 && (
              <DropdownMenuItem onClick={clearFilters} className="text-destructive">
                Clear Filters
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
              <p className="text-lg font-medium">No patients found</p>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term"
                  : "Add your first patient to get started"}
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
                        <DropdownMenuItem onClick={() => openViewDialog(patient)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/appointments")}>Book Appointment</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(patient)}>Edit Patient</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeletePatient(patient.id)}>
                          Delete Patient
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
        <DialogContent className="max-w-2xl max-h-[90vh]">
          {selectedPatient && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {selectedPatient.firstName.charAt(0)}
                      {selectedPatient.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {selectedPatient.firstName} {selectedPatient.lastName}
                    <p className="text-sm font-normal text-muted-foreground">
                      Patient since {format(parseISO(selectedPatient.createdAt), "MMMM yyyy")}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="appointments">Appointments</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="chart">Dental Chart</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-4">
                  <ScrollArea className="max-h-[50vh]">
                    <div className="space-y-6 pr-4">
                      {/* Contact Information */}
                      <div>
                        <h4 className="font-semibold mb-3">Contact Information</h4>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {selectedPatient.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {selectedPatient.phone}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedPatient.address}
                        </p>
                      </div>

                      <Separator />

                      {/* Insurance */}
                      {selectedPatient.insuranceProvider && (
                        <>
                          <div>
                            <h4 className="font-semibold mb-3">Insurance</h4>
                            <div className="grid gap-2 sm:grid-cols-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Provider: </span>
                                {selectedPatient.insuranceProvider}
                              </div>
                              <div>
                                <span className="text-muted-foreground">Policy #: </span>
                                {selectedPatient.policyNumber}
                              </div>
                            </div>
                          </div>
                          <Separator />
                        </>
                      )}

                      {/* Allergies & Medications */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-destructive" />
                            Allergies
                          </h4>
                          {selectedPatient.allergies.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedPatient.allergies.map((allergy, i) => (
                                <Badge key={i} variant="destructive">
                                  {allergy}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No known allergies
                            </p>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <Pill className="h-4 w-4 text-info" />
                            Medications
                          </h4>
                          {selectedPatient.medications.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {selectedPatient.medications.map((med, i) => (
                                <Badge key={i} variant="secondary">
                                  {med}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No current medications
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Medical History */}
                      <div>
                        <h4 className="font-semibold mb-3">Medical History</h4>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-muted-foreground">Conditions: </span>
                            {selectedPatient.medicalHistory.conditions.length > 0
                              ? selectedPatient.medicalHistory.conditions.join(", ")
                              : "None reported"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Past Surgeries: </span>
                            {selectedPatient.medicalHistory.surgeries.length > 0
                              ? selectedPatient.medicalHistory.surgeries.join(", ")
                              : "None reported"}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Family History: </span>
                            {selectedPatient.medicalHistory.familyHistory.length > 0
                              ? selectedPatient.medicalHistory.familyHistory.join(", ")
                              : "None reported"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="appointments" className="mt-4">
                  <div className="py-12 text-center text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Appointment history view coming soon.</p>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Clinical notes view coming soon.</p>
                  </div>
                </TabsContent>

                <TabsContent value="chart" className="mt-4">
                  <Odontogram patientId={selectedPatient.id} />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => navigate("/appointments")}>Book Appointment</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={closeAddDialog}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Add New Patient</DialogTitle>
            <DialogDescription className="text-xs">
              Fill in the essential details to register a new patient.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs font-semibold">First Name</Label>
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
                <Label htmlFor="lastName" className="text-xs font-semibold">Last Name</Label>
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
                <Label htmlFor="dateOfBirth" className="text-xs font-semibold">Date of Birth</Label>
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
                <Label htmlFor="phone" className="text-xs font-semibold">Phone</Label>
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
              <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
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
              <Label htmlFor="address" className="text-xs font-semibold">Home Address</Label>
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
                <Label htmlFor="insuranceProvider" className="text-xs font-semibold">Insurance</Label>
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
                <Label htmlFor="policyNumber" className="text-xs font-semibold">Policy #</Label>
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
              Cancel
            </Button>
            <Button
              className="h-8 text-xs"
              onClick={handleAddPatient}
              disabled={!newPatient.firstName || !newPatient.lastName}
            >
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Patient Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Edit Patient</DialogTitle>
            <DialogDescription className="text-xs">
              Update the patient's information.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-firstName" className="text-xs font-semibold">First Name</Label>
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
                <Label htmlFor="edit-lastName" className="text-xs font-semibold">Last Name</Label>
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
                <Label htmlFor="edit-dateOfBirth" className="text-xs font-semibold">Date of Birth</Label>
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
                <Label htmlFor="edit-phone" className="text-xs font-semibold">Phone</Label>
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
              <Label htmlFor="edit-email" className="text-xs font-semibold">Email Address</Label>
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
              <Label htmlFor="edit-address" className="text-xs font-semibold">Home Address</Label>
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
                <Label htmlFor="edit-insurance" className="text-xs font-semibold">Insurance</Label>
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
                <Label htmlFor="edit-policy" className="text-xs font-semibold">Policy #</Label>
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
              Cancel
            </Button>
            <Button
              className="h-8 text-xs"
              onClick={handleEditPatient}
              disabled={!newPatient.firstName || !newPatient.lastName}
            >
              Update Patient
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
