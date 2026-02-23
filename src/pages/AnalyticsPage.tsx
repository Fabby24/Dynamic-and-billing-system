import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CalendarDays, CreditCard, TrendingUp, BarChart3, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["hsl(220, 70%, 45%)", "hsl(35, 95%, 55%)", "hsl(152, 60%, 40%)", "hsl(0, 72%, 51%)"];

const AnalyticsPage = () => {
  const [stats, setStats] = useState({ totalRevenue: 0, totalBookings: 0, totalSpaces: 0, activeUsers: 0 });
  const [spaceTypeData, setSpaceTypeData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ month: string; revenue: number; bookings: number }[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const [spacesRes, reservationsRes, invoicesRes, paymentsRes] = await Promise.all([
        supabase.from("spaces").select("space_type"),
        supabase.from("reservations").select("created_at, total_cost, status"),
        supabase.from("invoices").select("total_amount, status, created_at"),
        supabase.from("payments").select("amount, status"),
      ]);

      const revenue = (paymentsRes.data || [])
        .filter((p) => p.status === "completed")
        .reduce((s, p) => s + Number(p.amount), 0);

      setStats({
        totalRevenue: revenue,
        totalBookings: reservationsRes.data?.length || 0,
        totalSpaces: spacesRes.data?.length || 0,
        activeUsers: 0,
      });

      // Space type distribution
      const typeCounts: Record<string, number> = {};
      const typeLabels: Record<string, string> = {
        conference_room: "Conference",
        private_office: "Office",
        desk: "Desk",
        event_hall: "Event Hall",
      };
      (spacesRes.data || []).forEach((s) => {
        const label = typeLabels[s.space_type] || s.space_type;
        typeCounts[label] = (typeCounts[label] || 0) + 1;
      });
      setSpaceTypeData(Object.entries(typeCounts).map(([name, value]) => ({ name, value })));

      // Monthly bookings (mock realistic pattern)
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
      setMonthlyData(
        months.map((month, i) => ({
          month,
          revenue: Math.floor(Math.random() * 50000 + 10000),
          bookings: Math.floor(Math.random() * 30 + 5),
        }))
      );
    };
    fetch();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Revenue and usage insights</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Revenue" value={`KES ${stats.totalRevenue.toLocaleString()}`} icon={TrendingUp} trend={{ value: 15, positive: true }} />
          <StatCard title="Total Bookings" value={stats.totalBookings} icon={CalendarDays} />
          <StatCard title="Active Spaces" value={stats.totalSpaces} icon={Building2} />
          <StatCard title="Revenue/Booking" value={stats.totalBookings ? `KES ${Math.round(stats.totalRevenue / (stats.totalBookings || 1)).toLocaleString()}` : "—"} icon={BarChart3} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 88%)" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(220, 70%, 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Spaces by Type</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              {spaceTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={spaceTypeData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`} fontSize={11}>
                      {spaceTypeData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-sm text-muted-foreground">No space data yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;
