import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { useStore } from "@/store";
import { useTranslation } from "react-i18next";

export function ProcedureDistribution() {
  const { t } = useTranslation();
  const { appointments } = useStore();

  // Calculate real procedure distribution from appointments
  const distribution = appointments.reduce((acc: Record<string, number>, apt) => {
    const type = apt.appointmentType.charAt(0).toUpperCase() + apt.appointmentType.slice(1);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  const total = appointments.length;
  const colors = [
    "hsl(221, 83%, 53%)",
    "hsl(142, 76%, 36%)",
    "hsl(38, 92%, 50%)",
    "hsl(199, 89%, 48%)",
    "hsl(215, 16%, 47%)",
    "hsl(280, 65%, 60%)",
    "hsl(0, 72%, 51%)",
  ];

  const procedureData = Object.entries(distribution)
    .map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[index % colors.length]
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-warning" />
          {t("dashboard.procedureDistribution")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={procedureData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
              >
                {procedureData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                formatter={(value: number) => [`${value}%`, t("dashboard.percentage")]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
