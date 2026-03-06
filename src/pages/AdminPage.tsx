import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ShieldAlert, Search, Users, Shield, CalendarDays, MapPin } from "lucide-react";
import { SpacesAdminTab } from "@/components/admin/SpacesAdminTab";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type ReservationStatus = Database["public"]["Enums"]["reservation_status"];

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // --- Access denied ---
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <ShieldAlert className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to view this page.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">Manage users, roles, reservations, and spaces</p>
        </div>
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="w-full flex overflow-x-auto">
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm"><Users className="h-4 w-4" /> <span className="hidden sm:inline">Users</span><span className="sm:hidden">Users</span></TabsTrigger>
            <TabsTrigger value="roles" className="gap-1.5 text-xs sm:text-sm"><Shield className="h-4 w-4" /> <span className="hidden sm:inline">Roles</span><span className="sm:hidden">Roles</span></TabsTrigger>
            <TabsTrigger value="reservations" className="gap-1.5 text-xs sm:text-sm"><CalendarDays className="h-4 w-4" /> <span className="hidden sm:inline">All Reservations</span><span className="sm:hidden">Bookings</span></TabsTrigger>
            <TabsTrigger value="spaces" className="gap-1.5 text-xs sm:text-sm"><MapPin className="h-4 w-4" /> <span className="hidden sm:inline">Spaces</span><span className="sm:hidden">Spaces</span></TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UsersTab search={search} setSearch={setSearch} />
          </TabsContent>
          <TabsContent value="roles">
            <RolesTab />
          </TabsContent>
          <TabsContent value="reservations">
            <ReservationsTab />
          </TabsContent>
          <TabsContent value="spaces">
            <SpacesAdminTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

// ============ USERS TAB ============
function UsersTab({ search, setSearch }: { search: string; setSearch: (s: string) => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: profiles, isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-profiles"] });
      toast({ title: "User status updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = profiles?.filter(
    (p) =>
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by name or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No users found</TableCell></TableRow>
            ) : (
              filtered?.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name || "—"}</TableCell>
                  <TableCell>{p.email}</TableCell>
                  <TableCell>{p.phone || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? "default" : "secondary"}>
                      {p.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={p.is_active ? "outline" : "default"}
                      onClick={() => toggleActive.mutate({ id: p.id, is_active: !p.is_active })}
                    >
                      {p.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ============ ROLES TAB ============
function RolesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [confirmDialog, setConfirmDialog] = useState<{ userId: string; userName: string; newRole: AppRole } | null>(null);

  const { data: roles, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (error) throw error;
      // fetch profiles separately to join
      const userIds = data.map((r) => r.user_id);
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds);
      return data.map((r) => ({
        ...r,
        profile: profiles?.find((p) => p.user_id === r.user_id),
      }));
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: AppRole }) => {
      const { error } = await supabase.from("user_roles").update({ role: newRole }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-roles"] });
      toast({ title: "Role updated successfully" });
      setConfirmDialog(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Change Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : (
              roles?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.profile?.full_name || "—"}</TableCell>
                  <TableCell>{r.profile?.email || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={r.role === "admin" ? "destructive" : r.role === "accountant" ? "outline" : "secondary"}>
                      {r.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={r.role}
                      onValueChange={(val: AppRole) => {
                        if (val !== r.role) {
                          setConfirmDialog({ userId: r.user_id, userName: r.profile?.full_name || r.profile?.email || "this user", newRole: val });
                        }
                      }}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="accountant">Accountant</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!confirmDialog} onOpenChange={() => setConfirmDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              Change <strong>{confirmDialog?.userName}</strong>'s role to <strong>{confirmDialog?.newRole}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(null)}>Cancel</Button>
            <Button onClick={() => confirmDialog && updateRole.mutate({ userId: confirmDialog.userId, newRole: confirmDialog.newRole })}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ============ RESERVATIONS TAB ============
function ReservationsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: reservations, isLoading } = useQuery({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*, spaces(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      // fetch profiles for user names
      const userIds = [...new Set(data.map((r) => r.user_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, full_name, email").in("user_id", userIds);
      return data.map((r) => ({
        ...r,
        profile: profiles?.find((p) => p.user_id === r.user_id),
      }));
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReservationStatus }) => {
      const { error } = await supabase.from("reservations").update({ status }).eq("id", id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      toast({ title: "Reservation updated" });

      // Send email notification when confirmed
      if (result.status === "confirmed") {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const token = sessionData?.session?.access_token;
          if (!token) return;

          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reservation-confirmed`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
                apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              },
              body: JSON.stringify({ reservation_id: result.id }),
            }
          );

          if (res.ok) {
            toast({ title: "Confirmation email sent" });
          } else {
            const err = await res.json();
            console.error("Email send error:", err);
            toast({ title: "Reservation confirmed but email failed", description: err.error, variant: "destructive" });
          }
        } catch (emailErr) {
          console.error("Email notification error:", emailErr);
        }
      }
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = reservations?.filter((r) => statusFilter === "all" || r.status === statusFilter);

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed": return "default";
      case "pending": return "secondary";
      case "cancelled": return "destructive";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  return (
    <div className="space-y-4">
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-44">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="confirmed">Confirmed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
        </SelectContent>
      </Select>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Space</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Start</TableHead>
              <TableHead>End</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : filtered?.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No reservations found</TableCell></TableRow>
            ) : (
              filtered?.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.profile?.full_name || r.profile?.email || "—"}</TableCell>
                  <TableCell>{(r.spaces as any)?.name || "—"}</TableCell>
                  <TableCell>{r.title || "—"}</TableCell>
                  <TableCell>{format(new Date(r.start_time), "MMM d, HH:mm")}</TableCell>
                  <TableCell>{format(new Date(r.end_time), "MMM d, HH:mm")}</TableCell>
                  <TableCell>KES {Number(r.total_cost).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusColor(r.status) as any}>{r.status}</Badge></TableCell>
                  <TableCell className="text-right space-x-2">
                    {r.status === "pending" && (
                      <>
                        <Button size="sm" onClick={() => updateStatus.mutate({ id: r.id, status: "confirmed" })}>Confirm</Button>
                        <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: r.id, status: "cancelled" })}>Cancel</Button>
                      </>
                    )}
                    {r.status === "confirmed" && (
                      <Button size="sm" variant="destructive" onClick={() => updateStatus.mutate({ id: r.id, status: "cancelled" })}>Cancel</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AdminPage;
