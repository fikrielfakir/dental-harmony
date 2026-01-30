import { format, parseISO, startOfToday } from "date-fns";
import { Calendar, Users, Banknote, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ProcedureDistribution } from "@/components/dashboard/ProcedureDistribution";
import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { t } = useTranslation();
  const { appointments, patients, staff, invoices } = useStore();

  // Calculate today's stats
  const today = startOfToday();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayAppointments = appointments.filter((apt) => {
    const aptDate = parseISO(apt.startTime);
    return aptDate >= today && aptDate < tomorrow;
  });

  const completedToday = todayAppointments.filter(
    (apt) => apt.status === "completed"
  ).length;

  // Real financial data from store
  const pendingPayments = invoices.filter(
    (inv) => inv.paymentStatus === 'unpaid' || inv.paymentStatus === 'partial'
  ).length;

  const todayRevenue = invoices
    .flatMap(inv => inv.payments)
    .filter(p => {
      const pDate = parseISO(p.paymentDate);
      return pDate >= today && pDate < tomorrow;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const monthlyRevenue = invoices
    .flatMap(inv => inv.payments)
    .filter(p => {
      const pDate = parseISO(p.paymentDate);
      return pDate.getMonth() === today.getMonth() && pDate.getFullYear() === today.getFullYear();
    })
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("dashboard.title")}</h1>
        <p className="text-muted-foreground">
          {t("dashboard.welcomeBack")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={t("dashboard.todayAppointments")}
          value={todayAppointments.length}
          description={`${completedToday} ${t("dashboard.completed")}`}
          icon={Calendar}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title={t("dashboard.totalPatients")}
          value={patients.length}
          description={t("dashboard.activePatients")}
          icon={Users}
          trend={{ value: 12, positive: true }}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          title={t("dashboard.todayRevenue")}
          value={`${todayRevenue.toLocaleString()} DH`}
          description={t("dashboard.todayRevenueDesc")}
          icon={Banknote}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title={t("dashboard.pendingPayments")}
          value={pendingPayments}
          description={t("dashboard.awaitingPayment")}
          icon={AlertCircle}
          iconClassName="bg-warning/10 text-warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div>
          <ProcedureDistribution />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointments />

        {/* Quick Stats / Staff Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-info" />
              {t("dashboard.staffOverview")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {staff
                .filter((s) => s.role === "dentist" || s.role === "hygienist")
                .map((member) => {
                  const memberAppointments = todayAppointments.filter(
                    (apt) => apt.practitionerId === member.id
                  );
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback
                            style={{ backgroundColor: member.color }}
                            className="text-white"
                          >
                            {member.firstName.charAt(0)}
                            {member.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {member.role === 'dentist' ? t('dashboard.staff.dentist') : t('dashboard.staff.hygienist')}
                            {member.specialization && ` • ${member.specialization}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {memberAppointments.length} {t("dashboard.appointmentsToday")}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{t("dashboard.today")}</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
