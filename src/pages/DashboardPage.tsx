import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, CalendarDays, CreditCard, Users, TrendingUp, Clock } from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ spaces: 0, reservations: 0, invoices: 0, revenue: 0 });
  const [recentReservations, setRecentReservations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [spacesRes, reservationsRes, invoicesRes] = await Promise.all([
        supabase.from("spaces").select("id", { count: "exact", head: true }),
        supabase.from("reservations").select("*").order("created_at", { ascending: false }).limit(5),
        supabase.from("invoices").select("total_amount, status"),
      ]);

      const revenue = (invoicesRes.data || [])
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

      setStats({
        spaces: spacesRes.count || 0,
        reservations: reservationsRes.data?.length || 0,
        invoices: invoicesRes.data?.length || 0,
        revenue,
      });
      setRecentReservations(reservationsRes.data || []);
    };
    fetchData();
  }, []);

  const statusColors: Record<string, string> = {
    pending: "bg-warning/10 text-warning border-warning/20",
    confirmed: "bg-success/10 text-success border-success/20",
    cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    completed: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Welcome back! Here's your overview.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Spaces" value={stats.spaces} icon={Building2} trend={{ value: 12, positive: true }} />
          <StatCard title="Reservations" value={stats.reservations} icon={CalendarDays} subtitle="This month" />
          <StatCard title="Invoices" value={stats.invoices} icon={CreditCard} />
          <StatCard
            title="Revenue"
            value={`KES ${stats.revenue.toLocaleString()}`}
            icon={TrendingUp}
            trend={{ value: 8, positive: true }}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Recent Reservations</CardTitle>
            </CardHeader>
            <CardContent>
              {recentReservations.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No reservations yet</p>
              ) : (
                <div className="space-y-3">
                  {recentReservations.map((res) => (
                    <div key={res.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{res.title || "Reservation"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(res.start_time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={statusColors[res.status] || ""}>
                        {res.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="font-heading text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: "New Reservation", icon: CalendarDays, href: "/reservations" },
                { label: "Browse Spaces", icon: Building2, href: "/spaces" },
                { label: "View Invoices", icon: CreditCard, href: "/invoices" },
                { label: "Manage Users", icon: Users, href: "/analytics" },
              ].map((action) => (
                <a
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-colors hover:bg-accent"
                >
                  <action.icon className="h-6 w-6 text-primary" />
                  <span className="text-xs font-medium text-foreground">{action.label}</span>
                </a>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default DashboardPage;
