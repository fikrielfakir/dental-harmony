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
} from "lucide-react";
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
import { Patient } from "@/types";

const Patients = () => {
  const { patients, addPatient } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
    return (
      fullName.includes(query) ||
      patient.email.toLowerCase().includes(query) ||
      patient.phone.includes(query)
    );
  });

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
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage your patient records and information
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
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
              onClick={() => setSelectedPatient(patient)}
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
                          Allergies
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {calculateAge(patient.dateOfBirth)} years old
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
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Book Appointment</DropdownMenuItem>
                        <DropdownMenuItem>Edit Patient</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
      <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
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

              <ScrollArea className="max-h-[60vh]">
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

                  {selectedPatient.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.notes}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                  Close
                </Button>
                <Button>Book Appointment</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Patient Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's basic information. You can add more details later.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={newPatient.firstName}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, firstName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newPatient.lastName}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, lastName: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={newPatient.dateOfBirth}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, dateOfBirth: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newPatient.email}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, email: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={newPatient.phone}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={newPatient.address}
                onChange={(e) =>
                  setNewPatient({ ...newPatient, address: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  value={newPatient.insuranceProvider}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      insuranceProvider: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  value={newPatient.policyNumber}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, policyNumber: e.target.value })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddPatient}
              disabled={!newPatient.firstName || !newPatient.lastName}
            >
              Add Patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Patients;
