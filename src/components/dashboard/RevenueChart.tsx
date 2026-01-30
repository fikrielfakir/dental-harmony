import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign } from "lucide-react";
import { useStore } from "@/store";
import { parseISO, format } from "date-fns";
import { useTranslation } from "react-i18next";

export function RevenueChart() {
  const { t } = useTranslation();
  const { invoices } = useStore();

  // Generate real revenue data from invoices
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentYear = new Date().getFullYear();
  
  const revenueData = months.map((month, index) => {
    const monthlyTotal = invoices
      .flatMap(inv => inv.payments)
      .filter(p => {
        const pDate = parseISO(p.paymentDate);
        return pDate.getMonth() === index && pDate.getFullYear() === currentYear;
      })
      .reduce((sum, p) => sum + p.amount, 0);
      
    return { month, revenue: monthlyTotal };
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-success" />
          {t("dashboard.revenueOverview")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(221, 83%, 53%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
                labelStyle={{ color: "hsl(var(--foreground))" }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, t("dashboard.revenue")]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(221, 83%, 53%)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
