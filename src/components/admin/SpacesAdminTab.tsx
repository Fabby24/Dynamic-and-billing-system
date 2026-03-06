import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type SpaceType = Database["public"]["Enums"]["space_type"];

const spaceTypeLabels: Record<string, string> = {
  conference_room: "Conference Room",
  private_office: "Private Office",
  desk: "Desk",
  event_hall: "Event Hall",
};

const emptyForm = {
  name: "",
  description: "",
  space_type: "conference_room" as SpaceType,
  capacity: 10,
  hourly_rate: 500,
  daily_rate: 4000,
  location: "",
  image_url: "",
  amenities: ["WiFi"],
  is_available: true,
};

export function SpacesAdminTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: spaces, isLoading } = useQuery({
    queryKey: ["admin-spaces"],
    queryFn: async () => {
      const { data, error } = await supabase.from("spaces").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsertSpace = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        daily_rate: form.daily_rate || null,
      };
      if (editingId) {
        const { error } = await supabase.from("spaces").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("spaces").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
      toast({ title: editingId ? "Space updated" : "Space created" });
      closeDialog();
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleAvailability = useMutation({
    mutationFn: async ({ id, is_available }: { id: string; is_available: boolean }) => {
      const { error } = await supabase.from("spaces").update({ is_available }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-spaces"] });
      toast({ title: "Availability toggled" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (space: any) => {
    setEditingId(space.id);
    setForm({
      name: space.name,
      description: space.description || "",
      space_type: space.space_type,
      capacity: space.capacity,
      hourly_rate: Number(space.hourly_rate),
      daily_rate: Number(space.daily_rate) || 0,
      location: space.location || "",
      image_url: space.image_url || "",
      amenities: space.amenities || [],
      is_available: space.is_available,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openAdd} className="gradient-primary text-primary-foreground">
          <Plus className="mr-2 h-4 w-4" /> Add Space
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Rate/hr</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
            ) : spaces?.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No spaces</TableCell></TableRow>
            ) : (
              spaces?.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell>{spaceTypeLabels[s.space_type]}</TableCell>
                  <TableCell>{s.capacity}</TableCell>
                  <TableCell>KES {Number(s.hourly_rate).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={s.is_available ? "default" : "secondary"}>
                      {s.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(s)}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={s.is_available ? "secondary" : "default"}
                      onClick={() => toggleAvailability.mutate({ id: s.id, is_available: !s.is_available })}
                    >
                      {s.is_available ? "Disable" : "Enable"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading…</div>
        ) : spaces?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No spaces</div>
        ) : (
          spaces?.map((s) => (
            <div key={s.id} className="rounded-lg border bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-foreground truncate">{s.name}</p>
                <Badge variant={s.is_available ? "default" : "secondary"}>
                  {s.is_available ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{spaceTypeLabels[s.space_type]}</span>
                <span>Cap: {s.capacity}</span>
              </div>
              <p className="font-heading font-bold text-foreground">KES {Number(s.hourly_rate).toLocaleString()}/hr</p>
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(s)}>
                  <Pencil className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant={s.is_available ? "secondary" : "default"}
                  className="flex-1"
                  onClick={() => toggleAvailability.mutate({ id: s.id, is_available: !s.is_available })}
                >
                  {s.is_available ? "Disable" : "Enable"}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Space" : "Add New Space"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); upsertSpace.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.space_type} onValueChange={(v) => setForm({ ...form, space_type: v as SpaceType })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(spaceTypeLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Capacity</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Hourly Rate (KES)</Label>
                <Input type="number" value={form.hourly_rate} onChange={(e) => setForm({ ...form, hourly_rate: +e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Daily Rate (KES)</Label>
                <Input type="number" value={form.daily_rate} onChange={(e) => setForm({ ...form, daily_rate: +e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Amenities (comma-separated)</Label>
              <Input
                value={form.amenities.join(", ")}
                onChange={(e) => setForm({ ...form, amenities: e.target.value.split(",").map((a) => a.trim()).filter(Boolean) })}
                placeholder="WiFi, Projector, AC"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={upsertSpace.isPending}>
              {editingId ? "Update Space" : "Create Space"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
