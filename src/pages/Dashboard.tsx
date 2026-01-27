import { format, parseISO, startOfToday } from "date-fns";
import { Calendar, Users, DollarSign, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingAppointments } from "@/components/dashboard/UpcomingAppointments";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ProcedureDistribution } from "@/components/dashboard/ProcedureDistribution";
import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const Dashboard = () => {
  const { appointments, patients, staff } = useStore();

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

  // Mock financial data (would come from backend in real app)
  const todayRevenue = 2450;
  const monthlyRevenue = 28900;
  const pendingPayments = 5;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={todayAppointments.length}
          description={`${completedToday} completed`}
          icon={Calendar}
          iconClassName="bg-primary/10 text-primary"
        />
        <StatCard
          title="Total Patients"
          value={patients.length}
          description="Active patients"
          icon={Users}
          trend={{ value: 12, positive: true }}
          iconClassName="bg-info/10 text-info"
        />
        <StatCard
          title="Today's Revenue"
          value={`$${todayRevenue.toLocaleString()}`}
          description="From completed appointments"
          icon={DollarSign}
          iconClassName="bg-success/10 text-success"
        />
        <StatCard
          title="Pending Payments"
          value={pendingPayments}
          description="Awaiting payment"
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
              Staff Overview
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
                            {member.role}
                            {member.specialization && ` • ${member.specialization}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="mb-1">
                          {memberAppointments.length} appointments
                        </Badge>
                        <p className="text-xs text-muted-foreground">Today</p>
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
