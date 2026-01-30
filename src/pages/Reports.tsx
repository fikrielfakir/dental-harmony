import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ProcedureDistribution } from "@/components/dashboard/ProcedureDistribution";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, TrendingUp, Users, Calendar, Banknote } from "lucide-react";
import { useStore } from "@/store";
import { useTranslation } from "react-i18next";
import { startOfMonth, startOfWeek, subMonths, subWeeks, isAfter, parseISO } from "date-fns";

const Reports = () => {
  const { t } = useTranslation();
  const { patients, appointments, invoices, clinicalNotes } = useStore();

  // Financial Stats
  const totalRevenue = invoices
    .flatMap(inv => inv.payments)
    .reduce((sum, p) => sum + p.amount, 0);

  const lastMonthStart = startOfMonth(subMonths(new Date(), 1));
  const currentMonthStart = startOfMonth(new Date());
  
  const lastMonthRevenue = invoices
    .flatMap(inv => inv.payments)
    .filter(p => {
      const pDate = parseISO(p.paymentDate);
      return pDate >= lastMonthStart && pDate < currentMonthStart;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const revenueGrowth = lastMonthRevenue > 0 
    ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : "0";

  // Patient Stats
  const newPatientsThisWeek = patients.filter(p => {
    const pDate = parseISO(p.createdAt);
    return pDate >= startOfWeek(new Date());
  }).length;

  // Appointment Stats
  const appointmentsYTD = appointments.filter(a => {
    const aDate = parseISO(a.startTime);
    return aDate.getFullYear() === new Date().getFullYear();
  }).length;

  // Procedure Stats
  const procedureStats = clinicalNotes.reduce((acc: any, note) => {
    const procedure = note.procedure || "Other";
    if (!acc[procedure]) {
      acc[procedure] = { name: procedure, volume: 0, revenue: 0 };
    }
    acc[procedure].volume += 1;
    acc[procedure].revenue += note.cost || 0;
    return acc;
  }, {});

  const topProcedures = Object.values(procedureStats)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("reports.title", "Rapports d'Activité")}</h1>
          <p className="text-muted-foreground">
            {t("reports.subtitle", "Analysez les performances de votre cabinet et la démographie des patients")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.totalRevenue", "Revenu Total")}</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} DH</div>
            <p className="text-xs text-muted-foreground">
              {revenueGrowth > 0 ? "+" : ""}{revenueGrowth}% {t("reports.fromLastMonth", "depuis le mois dernier")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.totalPatients", "Total Patients")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{patients.length}</div>
            <p className="text-xs text-muted-foreground">+{newPatientsThisWeek} {t("reports.newThisWeek", "nouveaux cette semaine")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.treatments", "Traitements")}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clinicalNotes.length}</div>
            <p className="text-xs text-muted-foreground">{t("reports.totalProcedures", "Procédures totales réalisées")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("reports.appointments", "Rendez-vous")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointmentsYTD}</div>
            <p className="text-xs text-muted-foreground">{t("reports.yearToDate", "Cumul annuel")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart />
        <ProcedureDistribution />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("reports.servicePerformance", "Performance des Services")}</CardTitle>
          <CardDescription>{t("reports.servicePerformanceDesc", "Procédures les plus demandées et leur contribution au revenu.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("reports.table.procedure", "Procédure")}</TableHead>
                <TableHead>{t("reports.table.volume", "Volume")}</TableHead>
                <TableHead>{t("reports.table.revenue", "Revenu")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProcedures.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    {t("reports.noData", "Aucune donnée disponible")}
                  </TableCell>
                </TableRow>
              ) : (
                topProcedures.map((service: any) => (
                  <TableRow key={service.name}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>{service.volume}</TableCell>
                    <TableCell>{service.revenue.toLocaleString()} DH</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;