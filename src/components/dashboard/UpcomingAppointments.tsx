import { format, parseISO } from "date-fns";
import { Clock, User, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "@/store";
import { cn } from "@/lib/utils";
import { AppointmentStatus, AppointmentType } from "@/types";
import { useTranslation } from "react-i18next";

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: "bg-info/10 text-info border-info/20",
  confirmed: "bg-primary/10 text-primary border-primary/20",
  "in-progress": "bg-warning/10 text-warning border-warning/20",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  "no-show": "bg-destructive/10 text-destructive border-destructive/20",
};

const typeLabels: Record<AppointmentType, string> = {
  consultation: "Consultation",
  cleaning: "Cleaning",
  filling: "Filling",
  extraction: "Extraction",
  "root-canal": "Root Canal",
  crown: "Crown",
  checkup: "Checkup",
  emergency: "Emergency",
  whitening: "Whitening",
  other: "Other",
};

export function UpcomingAppointments() {
  const { t } = useTranslation();
  const { appointments, patients, staff } = useStore();

  // Get today's appointments sorted by time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = appointments
    .filter((apt) => {
      const aptDate = parseISO(apt.startTime);
      return aptDate >= today && aptDate < tomorrow && apt.status !== "cancelled";
    })
    .sort((a, b) => parseISO(a.startTime).getTime() - parseISO(b.startTime).getTime());

  const getPatient = (patientId: string) =>
    patients.find((p) => p.id === patientId);

  const getPractitioner = (practitionerId: string) =>
    staff.find((s) => s.id === practitionerId);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          {t("dashboard.todayAppointments")}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="space-y-1 p-4 pt-0">
            {todayAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">{t("dashboard.noAppointments")}</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => {
                const patient = getPatient(appointment.patientId);
                const practitioner = getPractitioner(appointment.practitionerId);
                const startTime = format(parseISO(appointment.startTime), "h:mm a");
                const endTime = format(parseISO(appointment.endTime), "h:mm a");

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border"
                  >
                    <div className="text-center min-w-[60px]">
                      <p className="text-sm font-semibold">{startTime}</p>
                      <p className="text-xs text-muted-foreground">{endTime}</p>
                    </div>

                    <div
                      className="w-1 h-12 rounded-full"
                      style={{ backgroundColor: practitioner?.color || "#3b82f6" }}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-secondary">
                            {patient?.firstName.charAt(0)}
                            {patient?.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <p className="font-medium text-sm truncate">
                          {patient?.firstName} {patient?.lastName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[appointment.appointmentType]}
                        </span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {practitioner?.firstName} {practitioner?.lastName}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={cn("capitalize text-xs flex items-center gap-1", statusColors[appointment.status])}
                    >
                      {appointment.status === 'confirmed' && <CheckCircle2 className="h-3 w-3" />}
                      {appointment.status.replace("-", " ")}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
