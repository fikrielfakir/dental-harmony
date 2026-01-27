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
  CheckCircle2,
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
  confirmed: "bg-primary text-primary-foreground",
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-1">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Appointments
          </h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage patient visits with ease.
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mica-card p-3 rounded-xl border border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border/30">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background"
              onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background"
              onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg font-medium"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
        <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          {format(weekStart, "MMMM yyyy")}
          <span className="text-muted-foreground font-normal ml-1">
            ({format(weekStart, "d")} - {format(weekEnd, "d")})
          </span>
        </h2>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1 overflow-hidden border-border/40 shadow-xl shadow-black/5 rounded-2xl mica-card">
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Time column */}
            <div className="w-20 flex-shrink-0 border-r border-border/30 bg-muted/5">
              <div className="h-14 border-b border-border/30" /> {/* Header spacer */}
              <div className="relative">
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="h-[60px] border-b border-border/10 px-3 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/60 flex items-start pt-2"
                  >
                    {format(setHours(new Date(), hour), "h a")}
                  </div>
                ))}
              </div>
            </div>

            {/* Days columns */}
            <ScrollArea className="flex-1 scrollbar-thin">
              <div className="flex min-w-[840px] h-full">
                {weekDays.map((day) => {
                  const dayAppointments = getAppointmentsForDay(day);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <div key={day.toISOString()} className="flex-1 border-r border-border/30 last:border-r-0 group">
                      {/* Day header */}
                      <div
                        className={cn(
                          "h-14 border-b border-border/30 p-2 text-center flex flex-col justify-center transition-colors",
                          isToday && "bg-primary/5 border-b-primary/30"
                        )}
                      >
                        <p className={cn(
                          "text-[10px] font-bold uppercase tracking-widest mb-0.5",
                          isToday ? "text-primary" : "text-muted-foreground/70"
                        )}>
                          {format(day, "EEE")}
                        </p>
                        <p
                          className={cn(
                            "text-xl font-bold leading-none",
                            isToday ? "text-primary scale-110" : "text-foreground"
                          )}
                        >
                          {format(day, "d")}
                        </p>
                      </div>

                      {/* Time slots */}
                      <div className="relative min-h-[720px] bg-background/20 group-hover:bg-background/40 transition-colors">
                        {HOURS.map((hour) => (
                          <div
                            key={hour}
                            className="h-[60px] border-b border-border/5"
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
                                "absolute left-1 right-1 rounded-xl p-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between border-l-4",
                                appointment.status === 'confirmed' ? "ring-1 ring-primary/20" : ""
                              )}
                              style={{
                                top: `${top}px`,
                                height: `${Math.max(height, 48)}px`,
                                backgroundColor: `${practitioner?.color}15` || "#3b82f615",
                                borderColor: practitioner?.color || "#3b82f6",
                                color: practitioner?.color || "#3b82f6",
                              }}
                              onClick={() => setSelectedAppointment(appointment)}
                            >
                              <div className="relative z-10">
                                <p className="text-xs font-bold truncate">
                                  {patient?.firstName} {patient?.lastName}
                                </p>
                                {height >= 60 && (
                                  <p className="text-[10px] font-medium opacity-80 truncate mt-0.5">
                                    {appointmentTypes.find((t) => t.value === appointment.appointmentType)?.label}
                                  </p>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between mt-auto pt-1 border-t border-current/10">
                                <div className="flex items-center gap-1 opacity-80">
                                  <Clock className="h-2.5 w-2.5" />
                                  <span className="text-[9px] font-bold">
                                    {format(parseISO(appointment.startTime), "h:mm")}
                                  </span>
                                </div>
                                <div className={cn(
                                  "rounded-full p-0.5",
                                  appointment.status === 'confirmed' && "bg-primary text-white shadow-sm"
                                )}>
                                  {appointment.status === 'confirmed' && <CheckCircle2 className="h-2.5 w-2.5" />}
                                </div>
                              </div>
                              
                              {/* Background Pattern */}
                              <div className="absolute top-0 right-0 w-12 h-12 opacity-[0.03] -mr-4 -mt-4 pointer-events-none">
                                <CalendarIcon className="w-full h-full" />
                              </div>
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
        <DialogContent className="mica-card border-border/50 rounded-2xl max-w-md">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">Appointment Info</DialogTitle>
                <DialogDescription>
                  Detailed view of the scheduled visit.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border/50">
                  <Avatar className="h-14 w-14 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {getPatient(selectedAppointment.patientId)?.firstName.charAt(0)}
                      {getPatient(selectedAppointment.patientId)?.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-lg font-bold">
                      {getPatient(selectedAppointment.patientId)?.firstName}{" "}
                      {getPatient(selectedAppointment.patientId)?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-0.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-success" />
                      Active Patient
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 p-3 rounded-xl border border-border/30 bg-background/50">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Date</Label>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {format(parseISO(selectedAppointment.startTime), "MMM d, yyyy")}
                    </div>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl border border-border/30 bg-background/50">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Time</Label>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-primary" />
                      {format(parseISO(selectedAppointment.startTime), "h:mm a")}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Practitioner</Label>
                    <Badge variant="outline" className="text-[10px] font-bold px-2 py-0.5 rounded-full border-primary/20 bg-primary/5 text-primary">
                      {getPractitioner(selectedAppointment.practitionerId)?.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-border/30 bg-background/50">
                    <div 
                      className="w-1.5 h-10 rounded-full" 
                      style={{ backgroundColor: getPractitioner(selectedAppointment.practitionerId)?.color }}
                    />
                    <div>
                      <p className="text-sm font-bold">
                        Dr. {getPractitioner(selectedAppointment.practitionerId)?.firstName}{" "}
                        {getPractitioner(selectedAppointment.practitionerId)?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">Dental Specialist</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors py-1 px-3 rounded-lg flex items-center gap-1.5">
                    {appointmentTypes.find((t) => t.value === selectedAppointment.appointmentType)?.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("capitalize py-1 px-3 rounded-lg flex items-center gap-1.5 border-border/50", statusColors[selectedAppointment.status])}
                  >
                    {selectedAppointment.status === 'confirmed' && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {selectedAppointment.status.replace("-", " ")}
                  </Badge>
                </div>

                {selectedAppointment.notes && (
                  <div className="p-4 rounded-2xl bg-muted/20 border border-border/30">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">Notes</p>
                    <p className="text-sm leading-relaxed text-foreground/80 italic">
                      "{selectedAppointment.notes}"
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button variant="ghost" className="rounded-xl flex-1" onClick={() => setSelectedAppointment(null)}>
                  Close
                </Button>
                {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'confirmed' && (
                  <div className="flex gap-2 flex-[2]">
                    <Button 
                      className="flex-1 bg-success hover:bg-success/90 text-success-foreground rounded-xl shadow-lg shadow-success/10"
                      onClick={() => {
                        updateAppointment(selectedAppointment.id, { status: 'completed' });
                        setSelectedAppointment(null);
                      }}
                    >
                      Complete
                    </Button>
                    <Button variant="destructive" className="flex-1 rounded-xl shadow-lg shadow-destructive/10" onClick={handleCancelAppointment}>
                      Cancel
                    </Button>
                  </div>
                )}
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
