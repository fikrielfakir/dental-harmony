import { useState, useMemo } from "react";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isSameDay,
  setHours,
  setMinutes,
  addDays,
  startOfDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
} from "lucide-react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Appointment, AppointmentType, AppointmentStatus } from "@/types";

import { DeleteConfirmationDialog } from "@/components/modals/DeleteConfirmationDialog";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

const appointmentTypes: { value: AppointmentType; label: string; duration: number }[] = [
  { value: "consultation", label: "Consultation", duration: 30 },
  { value: "checkup", label: "Checkup", duration: 30 },
  { value: "cleaning", label: "Cleaning", duration: 60 },
  { value: "filling", label: "Filling", duration: 45 },
  { value: "extraction", label: "Extraction", duration: 60 },
  { value: "root-canal", label: "Root Canal", duration: 90 },
  { value: "crown", label: "Crown", duration: 90 },
  { value: "whitening", label: "Whitening", duration: 90 },
  { value: "emergency", label: "Emergency", duration: 60 },
  { value: "other", label: "Other", duration: 30 },
];

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: "bg-info text-info-foreground",
  confirmed: "bg-success text-success-foreground",
  "in-progress": "bg-warning text-warning-foreground",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/50 text-destructive-foreground",
  "no-show": "bg-destructive text-destructive-foreground",
};

const Appointments = () => {
  const { appointments, patients, staff, addAppointment, updateAppointment, deleteAppointment } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    patientId: "",
    practitionerId: "",
    appointmentType: "checkup" as AppointmentType,
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    notes: "",
  });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const practitioners = staff.filter(
    (s) => s.role === "dentist" || s.role === "hygienist"
  );

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = parseISO(apt.startTime);
      return isSameDay(aptDate, date);
    });
  };

  const getAppointmentPosition = (appointment: Appointment) => {
    const start = parseISO(appointment.startTime);
    const end = parseISO(appointment.endTime);
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = (startHour - 8) * 60; // 60px per hour, starting at 8 AM
    const height = (endHour - startHour) * 60;
    return { top, height };
  };

  const handleAddAppointment = () => {
    const selectedType = appointmentTypes.find(
      (t) => t.value === newAppointment.appointmentType
    );
    const duration = selectedType?.duration || 30;

    const [hours, minutes] = newAppointment.time.split(":").map(Number);
    const startTime = setMinutes(
      setHours(parseISO(newAppointment.date), hours),
      minutes
    );
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      patientId: newAppointment.patientId,
      practitionerId: newAppointment.practitionerId,
      appointmentType: newAppointment.appointmentType,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      status: "scheduled",
      notes: newAppointment.notes,
      reminderSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addAppointment(appointment);
    setIsAddDialogOpen(false);
    setNewAppointment({
      patientId: "",
      practitionerId: "",
      appointmentType: "checkup",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      notes: "",
    });
  };

  const handleCancelAppointment = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmCancelAppointment = () => {
    if (selectedAppointment) {
      deleteAppointment(selectedAppointment.id);
      setSelectedAppointment(null);
      setIsDeleteDialogOpen(false);
    }
  };

  const getPatient = (id: string) => patients.find((p) => p.id === id);
  const getPractitioner = (id: string) => staff.find((s) => s.id === id);

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your practice schedule
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
        <h2 className="text-lg font-semibold">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </h2>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1 overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Time column */}
            <div className="w-16 flex-shrink-0 border-r border-border">
              <div className="h-12 border-b border-border" /> {/* Header spacer */}
              <div className="relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-border px-2 text-xs text-muted-foreground flex items-start pt-1"
                  >
                    {format(setHours(new Date(), hour), "h a")}
                  </div>
                ))}
              </div>
            </div>

            {/* Days columns */}
            <ScrollArea className="flex-1">
              <div className="flex min-w-[700px]">
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div key={day.toISOString()} className="flex-1 border-r border-border last:border-r-0">
                      {/* Day header */}
                      <div
                        className={cn(
                          "h-12 border-b border-border p-2 text-center",
                          isToday && "bg-primary/5"
                        )}
                      >
                        <p className="text-xs text-muted-foreground">
                          {format(day, "EEE")}
                        </p>
                        <p
                          className={cn(
                            "text-lg font-semibold",
                            isToday && "text-primary"
                          )}
                        >
                          {format(day, "d")}
                        </p>
                      </div>

                      {/* Time slots */}
                      <div className="relative">
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            className="h-[60px] border-b border-border border-dashed"
                          />
                        ))}

                        {/* Appointments */}
                        {dayAppointments.map((appointment) => {
                          const { top, height } = getAppointmentPosition(appointment);
                          const patient = getPatient(appointment.patientId);
                          const practitioner = getPractitioner(appointment.practitionerId);

                          if (top < 0 || top >= HOURS.length * 60) return null;

                          return (
                            <div
                              key={appointment.id}
                              className={cn(
                                "absolute left-1 right-1 rounded-md p-1.5 cursor-pointer transition-transform hover:scale-[1.02] overflow-hidden",
                                statusColors[appointment.status]
                              )}
                              style={{
                                top: `${top}px`,
                                height: `${Math.max(height, 24)}px`,
                                backgroundColor: practitioner?.color || undefined,
                              }}
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              <p className="text-xs font-medium truncate text-white">
                                {patient?.firstName} {patient?.lastName}
                              </p>
                              {height >= 40 && (
                                <p className="text-xs truncate text-white/80">
                                  {appointmentTypes.find((t) => t.value === appointment.appointmentType)?.label}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent>
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>Appointment Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getPatient(selectedAppointment.patientId)?.firstName.charAt(0)}
                      {getPatient(selectedAppointment.patientId)?.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">
                      {getPatient(selectedAppointment.patientId)?.firstName}{" "}
                      {getPatient(selectedAppointment.patientId)?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getPatient(selectedAppointment.patientId)?.phone}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {format(parseISO(selectedAppointment.startTime), "EEEE, MMMM d, yyyy")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {format(parseISO(selectedAppointment.startTime), "h:mm a")} -{" "}
                    {format(parseISO(selectedAppointment.endTime), "h:mm a")}
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {getPractitioner(selectedAppointment.practitionerId)?.firstName}{" "}
                    {getPractitioner(selectedAppointment.practitionerId)?.lastName}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge>
                    {appointmentTypes.find((t) => t.value === selectedAppointment.appointmentType)?.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("capitalize", statusColors[selectedAppointment.status])}
                  >
                    {selectedAppointment.status.replace("-", " ")}
                  </Badge>
                </div>

                {selectedAppointment.notes && (
                  <div>
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
                <Button variant="destructive" onClick={handleCancelAppointment}>Cancel Appointment</Button>
                <Button>Edit</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Appointment Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new appointment for a patient.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select
                value={newAppointment.patientId}
                onValueChange={(value) =>
                  setNewAppointment({ ...newAppointment, patientId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select patient" />
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
              <Label>Practitioner</Label>
              <Select
                value={newAppointment.practitionerId}
                onValueChange={(value) =>
                  setNewAppointment({ ...newAppointment, practitionerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select practitioner" />
                </SelectTrigger>
                <SelectContent>
                  {practitioners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} - {p.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <Select
                value={newAppointment.appointmentType}
                onValueChange={(value) =>
                  setNewAppointment({
                    ...newAppointment,
                    appointmentType: value as AppointmentType,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} ({type.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={newAppointment.notes}
                onChange={(e) =>
                  setNewAppointment({ ...newAppointment, notes: e.target.value })
                }
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddAppointment}
              disabled={!newAppointment.patientId || !newAppointment.practitionerId}
            >
              Schedule Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmCancelAppointment}
        title="Cancel Appointment"
        description="Are you sure you want to cancel this appointment? This action cannot be undone."
      />
    </div>
  );
};

export default Appointments;
