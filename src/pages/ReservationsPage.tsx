import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, CalendarDays, Clock } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-warning/10 text-warning border-warning/20",
  confirmed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-primary/10 text-primary border-primary/20",
};

const ReservationsPage = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    space_id: "",
    title: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const fetchData = async () => {
    setLoading(true);
    const [resRes, spacesRes] = await Promise.all([
      supabase.from("reservations").select("*, spaces(name, hourly_rate)").order("start_time", { ascending: false }),
      supabase.from("spaces").select("id, name, hourly_rate").eq("is_available", true),
    ]);
    setReservations(resRes.data || []);
    setSpaces(spacesRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateCost = () => {
    if (!form.space_id || !form.start_time || !form.end_time) return 0;
    const space = spaces.find((s) => s.id === form.space_id);
    if (!space) return 0;
    const hours = (new Date(form.end_time).getTime() - new Date(form.start_time).getTime()) / (1000 * 60 * 60);
    return Math.max(0, hours * Number(space.hourly_rate));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const totalCost = calculateCost();
    const { data: newRes, error } = await supabase.from("reservations").insert([
      {
        ...form,
        user_id: user.id,
        total_cost: totalCost,
        status: "pending" as const,
      },
    ]).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    // Auto-generate invoice
    const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
    const subtotal = totalCost;
    const taxRate = 16;
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    const { error: invError } = await supabase.from("invoices").insert([{
      reservation_id: newRes.id,
      user_id: user.id,
      invoice_number: invoiceNumber,
      subtotal,
      tax_rate: taxRate,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      status: "draft" as const,
      due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }]);

    if (invError) {
      console.error("Invoice creation failed:", invError);
      toast({ title: "Reservation created but invoice failed", description: invError.message, variant: "destructive" });
    } else {
      toast({ title: "Reservation & invoice created!" });
    }

    setDialogOpen(false);
    setForm({ space_id: "", title: "", start_time: "", end_time: "", notes: "" });
    fetchData();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Reservations</h1>
            <p className="text-sm text-muted-foreground">Manage your space bookings</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> New Reservation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Create Reservation</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Space</Label>
                  <Select value={form.space_id} onValueChange={(v) => setForm({ ...form, space_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select a space" /></SelectTrigger>
                    <SelectContent>
                      {spaces.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name} — KES {s.hourly_rate}/hr</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Team standup" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Start</Label>
                    <Input type="datetime-local" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>End</Label>
                    <Input type="datetime-local" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </div>
                {calculateCost() > 0 && (
                  <div className="rounded-lg bg-accent p-3 text-center">
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <p className="font-heading text-xl font-bold text-foreground">KES {calculateCost().toLocaleString()}</p>
                  </div>
                )}
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Create Reservation</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-foreground">No reservations yet</p>
            <p className="text-sm text-muted-foreground">Create your first booking</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reservations.map((res) => (
              <Card key={res.id} className="shadow-card animate-fade-in">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{res.title || "Reservation"}</p>
                      <p className="text-xs text-muted-foreground">
                        {(res.spaces as any)?.name} · {new Date(res.start_time).toLocaleDateString()} {new Date(res.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(res.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-heading font-bold text-foreground">KES {Number(res.total_cost).toLocaleString()}</p>
                    <Badge variant="outline" className={statusColors[res.status] || ""}>{res.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ReservationsPage;
