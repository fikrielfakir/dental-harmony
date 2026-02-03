import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
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
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
  addYears,
  subYears,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  isSameMonth,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
  LayoutGrid,
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

type ViewMode = 'day' | 'week' | 'month' | 'year';

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
  const { t } = useTranslation();
  const { appointments, patients, staff, addAppointment, updateAppointment, deleteAppointment } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('week');
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

  const handleNavigate = (direction: 'prev' | 'next') => {
    let d = new Date(currentDate);
    switch (viewMode) {
      case 'day':
        d.setDate(direction === 'prev' ? d.getDate() - 1 : d.getDate() + 1);
        break;
      case 'week':
        d = direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1);
        break;
      case 'month':
        d = direction === 'prev' ? subMonths(d, 1) : addMonths(d, 1);
        break;
      case 'year':
        d = direction === 'prev' ? subYears(d, 1) : addYears(d, 1);
        break;
    }
    setCurrentDate(d);
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

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDay(currentDate);
    const isToday = isSameDay(currentDate, new Date());

    return (
      <div className="flex h-full bg-background/50 backdrop-blur-xl">
        {/* Time Sidebar */}
        <div className="w-24 flex-shrink-0 border-r border-border/20 bg-muted/10">
          <div className="h-20 border-b border-border/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-primary/50" />
          </div>
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="h-[80px] border-b border-border/5 px-4 flex flex-col justify-start pt-3">
                <span className="text-[11px] font-bold text-muted-foreground/40 uppercase tracking-tighter leading-none">
                  {format(setHours(new Date(), hour), "h a")}
                </span>
                <span className="text-[9px] font-medium text-muted-foreground/20 mt-1">
                  :30
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Area */}
        <ScrollArea className="flex-1">
          <div className="relative min-h-[960px]">
            {/* Header Overlay (Floating effect) */}
            <div className="sticky top-0 z-20 h-20 bg-background/80 backdrop-blur-md border-b border-border/20 flex items-center px-8 justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner border border-border/30",
                  isToday ? "bg-primary text-primary-foreground shadow-primary/20" : "bg-muted/30"
                )}>
                  <span className="text-xl font-bold">{format(currentDate, "d")}</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold tracking-tight">{format(currentDate, "EEEE")}</h3>
                  <p className="text-xs text-muted-foreground font-medium">{format(currentDate, "MMMM yyyy")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1 bg-background/50 border-border/30">
                  {dayAppointments.length} {t('appointments.appointmentsCount')}
                </Badge>
              </div>
            </div>

            {/* Background grid lines */}
            <div className="absolute inset-0 top-0">
              {HOURS.map((hour) => (
                <div key={hour} className="h-[80px] border-b border-border/5 relative group">
                  <div className="absolute top-1/2 left-0 right-0 h-px border-t border-border/5 border-dashed" />
                  <div className="absolute inset-0 bg-primary/[0.01] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ))}
            </div>
            
            <div className="relative top-0 px-6 h-full pb-20">
              {dayAppointments.map((appointment) => {
                const start = parseISO(appointment.startTime);
                const end = parseISO(appointment.endTime);
                const startHour = start.getHours() + start.getMinutes() / 60;
                
                // Adjust for 80px per hour
                const startMinutes = start.getHours() * 60 + start.getMinutes();
                const calendarStartMinutes = 8 * 60; // 8 AM
                const pixelsPerMinute = 80 / 60;
                
                const top = (startMinutes - calendarStartMinutes) * pixelsPerMinute;
                const durationMinutes = (end.getHours() * 60 + end.getMinutes()) - (start.getHours() * 60 + start.getMinutes());
                const height = durationMinutes * pixelsPerMinute;
                
                const patient = getPatient(appointment.patientId);
                const practitioner = getPractitioner(appointment.practitionerId);
                const type = appointmentTypes.find(t => t.value === appointment.appointmentType);

                if (startHour < 8 || startHour >= 20) return null;

                const isCompleted = appointment.status === 'completed';
                const completedColor = "#10b981"; // Emerald-500 for a positive "Done" feel

                return (
                  <div
                    key={appointment.id}
                    className={cn(
                      "absolute left-4 right-4 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.01] group border-l-[6px] mica-card overflow-hidden",
                      appointment.status === 'confirmed' ? "ring-1 ring-primary/30" : "border-border/10 shadow-lg shadow-black/5",
                      isCompleted && "bg-emerald-50/10 border-emerald-500/50 shadow-none hover:scale-100 ring-1 ring-emerald-500/20"
                    )}
                    style={{
                      top: `${top}px`,
                      height: `${Math.max(height, 72)}px`,
                      borderColor: isCompleted ? completedColor : practitioner?.color,
                      background: isCompleted 
                        ? `linear-gradient(135deg, ${completedColor}10 0%, ${completedColor}05 100%)`
                        : `linear-gradient(135deg, ${practitioner?.color}15 0%, ${practitioner?.color}05 100%)`,
                    }}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    {/* Glass Shine Effect */}
                    <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/5 pointer-events-none" />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={cn(
                            "font-extrabold text-base tracking-tight leading-none text-foreground/90",
                            isCompleted && "text-emerald-950 dark:text-emerald-100"
                          )}>
                            {patient?.firstName} {patient?.lastName}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className={cn(
                              "text-[10px] font-bold h-5 px-2 bg-background/40 border-border/20 uppercase tracking-tighter",
                              isCompleted && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            )}>
                              {type?.label}
                            </Badge>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {format(start, "h:mm")} - {format(end, "h:mm a")}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Avatar className={cn(
                            "h-8 w-8 ring-2 ring-background shadow-sm border border-border/20",
                            isCompleted && "ring-emerald-500/20"
                          )}>
                            <AvatarFallback 
                              className="text-[10px] font-extrabold text-white drop-shadow-sm"
                              style={{ backgroundColor: isCompleted ? completedColor : practitioner?.color }}
                            >
                              {practitioner?.firstName.charAt(0)}{practitioner?.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {appointment.status === 'confirmed' && (
                            <div className="bg-primary/20 p-1 rounded-full text-primary">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                          )}
                          {isCompleted && (
                            <div className="bg-emerald-500/20 p-1 rounded-full text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>
                      </div>

                      {height > 100 && (
                        <div className="mt-auto flex items-center justify-between">
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            isCompleted ? "text-emerald-600/70" : "text-muted-foreground"
                          )}>
                            {practitioner?.firstName} {practitioner?.lastName}
                          </p>
                          <div className="flex gap-1 items-center">
                            {isCompleted ? (
                              <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wide bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                                {t('appointments.completed')}
                              </span>
                            ) : (
                              <>
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Background Icon Watermark */}
                    <CalendarIcon className={cn(
                      "absolute -bottom-4 -right-4 w-20 h-20 opacity-[0.03] text-foreground pointer-events-none group-hover:opacity-[0.06] transition-opacity",
                      isCompleted && "text-emerald-500 opacity-[0.05]"
                    )} />
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-7 border-b border-border/30">
          {[t('days.monday'), t('days.tuesday'), t('days.wednesday'), t('days.thursday'), t('days.friday'), t('days.saturday'), t('days.sunday')].map(day => (
            <div key={day} className="h-10 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {day.substring(0, 3)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 flex-1">
          {calendarDays.map((day, i) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            return (
              <div 
                key={i} 
                className={cn(
                  "min-h-[120px] border-b border-r border-border/20 p-2 transition-colors hover:bg-muted/5 flex flex-col last:border-r-0 cursor-pointer",
                  !isCurrentMonth && "opacity-30"
                )}
                onClick={() => {
                  setCurrentDate(day);
                  setViewMode('day');
                }}
              >
                <p className={cn("text-xs font-bold mb-1", isSameDay(day, new Date()) && "text-primary bg-primary/10 w-6 h-6 flex items-center justify-center rounded-full")}>{format(day, "d")}</p>
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayAppointments.slice(0, 3).map(apt => (
                    <div 
                      key={apt.id} 
                      className="text-[9px] p-1 rounded bg-primary/10 text-primary truncate border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setSelectedAppointment(apt); 
                      }}
                    >
                      {getPatient(apt.patientId)?.lastName}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && <p className="text-[8px] text-muted-foreground font-medium">+{dayAppointments.length - 3} more</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(currentDate);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <ScrollArea className="h-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {months.map((month, i) => {
            const monthAppointments = appointments.filter(apt => isSameMonth(parseISO(apt.startTime), month));
            return (
              <Card key={i} className="mica-card border-border/30 overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-lg group" onClick={() => { setViewMode('month'); setCurrentDate(month); }}>
                <div className="p-3 border-b border-border/30 bg-muted/30 group-hover:bg-primary/5 transition-colors">
                  <h3 className="font-bold text-sm flex items-center justify-between">
                    {format(month, "MMMM")}
                    <span className="text-[10px] text-muted-foreground font-normal">{format(month, "yyyy")}</span>
                  </h3>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{monthAppointments.length}</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">{t('appointments.appointmentsCount')}</p>
                  </div>
                  <div className="h-10 w-px bg-border/30" />
                  <div className="text-right">
                    <p className="text-xs font-bold text-foreground/80">
                      {monthAppointments.length > 20 ? t('common.highVolume', 'Volume Élevé') : monthAppointments.length > 10 ? t('common.moderate', 'Modéré') : t('common.lowVolume', 'Faible Volume')}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">{t('common.clickToExpand', 'Cliquer pour agrandir')}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-1">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('appointments.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('appointments.subtitle')}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-muted/50 p-1 rounded-xl border border-border/30 shadow-inner">
            {[
              { id: 'day', icon: Clock, label: t('appointments.day') },
              { id: 'week', icon: CalendarRange, label: t('appointments.week') },
              { id: 'month', icon: CalendarDays, label: t('appointments.month') },
              { id: 'year', icon: LayoutGrid, label: t('appointments.year') },
            ].map((view) => (
              <Button
                key={view.id}
                variant={viewMode === view.id ? "default" : "ghost"}
                size="sm"
                className={cn(
                  "rounded-lg px-3 h-8 text-xs font-semibold transition-all duration-300",
                  viewMode === view.id ? "shadow-md" : "hover:bg-background/80"
                )}
                onClick={() => setViewMode(view.id as ViewMode)}
              >
                <view.icon className="h-3.5 w-3.5 mr-1.5" />
                {view.label}
              </Button>
            ))}
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
            <Plus className="h-4 w-4 mr-2" />
            {t('appointments.addNew')}
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mica-card p-3 rounded-xl border border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex bg-muted/50 p-1 rounded-lg border border-border/30">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background"
              onClick={() => handleNavigate('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-background"
              onClick={() => handleNavigate('next')}
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
          {viewMode === 'day' && format(currentDate, "MMMM d, yyyy")}
          {viewMode === 'week' && `${format(weekStart, "MMMM d")} - ${format(weekEnd, "d, yyyy")}`}
          {viewMode === 'month' && format(currentDate, "MMMM yyyy")}
          {viewMode === 'year' && format(currentDate, "yyyy")}
        </h2>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1 overflow-hidden border-border/40 shadow-xl shadow-black/5 rounded-2xl mica-card">
        <CardContent className="p-0 h-full">
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'year' && renderYearView()}
          {viewMode === 'week' && (
            <div className="flex h-full">
              {/* Time column */}
              <div className="w-20 flex-shrink-0 border-r border-border/30 bg-muted/5">
                <div className="h-14 border-b border-border/30" />
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
                            {t(`days.${format(day, "eeee").toLowerCase()}`)}
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
          )}
        </CardContent>
      </Card>

      {/* Appointment Detail Dialog */}
      <Dialog open={!!selectedAppointment} onOpenChange={() => setSelectedAppointment(null)}>
        <DialogContent className="mica-card border-border/50 rounded-2xl max-w-md">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold tracking-tight">{t('appointments.viewDetails')}</DialogTitle>
                <DialogDescription>
                  {t('appointments.subtitle')}
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
                      Patient actif
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 p-3 rounded-xl border border-border/30 bg-background/50">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('appointments.date')}</Label>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CalendarIcon className="h-4 w-4 text-primary" />
                      {format(parseISO(selectedAppointment.startTime), "d MMM yyyy")}
                    </div>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl border border-border/30 bg-background/50">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('appointments.time')}</Label>
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-primary" />
                      {format(parseISO(selectedAppointment.startTime), "HH:mm")}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">{t('appointments.practitioner')}</Label>
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
                      <p className="text-xs text-muted-foreground">Spécialiste Dentaire</p>
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
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">{t('appointments.notes')}</p>
                    <p className="text-sm leading-relaxed text-foreground/80 italic">
                      "{selectedAppointment.notes}"
                    </p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-2">
                <Button variant="ghost" className="rounded-xl flex-1" onClick={() => setSelectedAppointment(null)}>
                  {t('common.cancel')}
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
                      {t('common.confirm')}
                    </Button>
                    <Button variant="destructive" className="flex-1 rounded-xl shadow-lg shadow-destructive/10" onClick={handleCancelAppointment}>
                      {t('common.delete')}
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
        <DialogContent className="mica-card border-border/50 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold tracking-tight">{t('appointments.addNew')}</DialogTitle>
            <DialogDescription>
              {t('appointments.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('appointments.patient')}</Label>
              <Select
                value={newAppointment.patientId}
                onValueChange={(value) =>
                  setNewAppointment({ ...newAppointment, patientId: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t('appointments.selectPatient')} />
                </SelectTrigger>
                <SelectContent className="mica-card rounded-xl">
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id} className="rounded-lg">
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('appointments.practitioner')}</Label>
              <Select
                value={newAppointment.practitionerId}
                onValueChange={(value) =>
                  setNewAppointment({ ...newAppointment, practitionerId: value })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t('appointments.selectPractitioner')} />
                </SelectTrigger>
                <SelectContent className="mica-card rounded-xl">
                  {practitioners.map((p) => (
                    <SelectItem key={p.id} value={p.id} className="rounded-lg">
                      {p.firstName} {p.lastName} - {p.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('appointments.type')}</Label>
              <Select
                value={newAppointment.appointmentType}
                onValueChange={(value) =>
                  setNewAppointment({
                    ...newAppointment,
                    appointmentType: value as AppointmentType,
                  })
                }
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder={t('appointments.selectType')} />
                </SelectTrigger>
                <SelectContent className="mica-card rounded-xl">
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value} className="rounded-lg">
                      {type.label} ({type.duration} min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t('appointments.date')}</Label>
                <Input
                  type="date"
                  className="rounded-xl"
                  value={newAppointment.date}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, date: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  className="rounded-xl"
                  value={newAppointment.time}
                  onChange={(e) =>
                    setNewAppointment({ ...newAppointment, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notes</Label>
              <Textarea
                className="rounded-xl min-h-[100px]"
                value={newAppointment.notes}
                onChange={(e) =>
                  setNewAppointment({ ...newAppointment, notes: e.target.value })
                }
                placeholder="Any additional notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" className="rounded-xl" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="rounded-xl shadow-lg shadow-primary/20 px-8"
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