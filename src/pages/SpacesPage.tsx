import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Users, Wifi, Monitor, Wind, MapPin, Search } from "lucide-react";

const spaceTypeLabels: Record<string, string> = {
  conference_room: "Conference Room",
  private_office: "Private Office",
  desk: "Desk",
  event_hall: "Event Hall",
};

const amenityIcons: Record<string, any> = {
  WiFi: Wifi,
  Projector: Monitor,
  AC: Wind,
};

const SpacesPage = () => {
  const { toast } = useToast();
  const [spaces, setSpaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    space_type: "conference_room" as "conference_room" | "private_office" | "desk" | "event_hall",
    capacity: 10,
    hourly_rate: 500,
    daily_rate: 4000,
    location: "",
    amenities: ["WiFi"],
  });

  const fetchSpaces = async () => {
    setLoading(true);
    let query = supabase.from("spaces").select("*").order("created_at", { ascending: false });
    if (typeFilter !== "all") query = query.eq("space_type", typeFilter as "conference_room" | "private_office" | "desk" | "event_hall");
    if (search) query = query.ilike("name", `%${search}%`);
    const { data } = await query;
    setSpaces(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSpaces();
  }, [typeFilter, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("spaces").insert([form]);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Space created" });
      setDialogOpen(false);
      fetchSpaces();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Spaces</h1>
            <p className="text-sm text-muted-foreground">Manage your workspaces and meeting rooms</p>
          </div>
          {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground">
                <Plus className="mr-2 h-4 w-4" /> Add Space
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="font-heading">Add New Space</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={form.space_type} onValueChange={(v) => setForm({ ...form, space_type: v as "conference_room" | "private_office" | "desk" | "event_hall" })}>
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
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Create Space</Button>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-10" placeholder="Search spaces..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue placeholder="All Types" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(spaceTypeLabels).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : spaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <MapPin className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium text-foreground">No spaces found</p>
            <p className="text-sm text-muted-foreground">Create your first space to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <Card key={space.id} className="overflow-hidden shadow-card transition-shadow hover:shadow-elevated animate-fade-in">
                <div className="h-40 overflow-hidden">
                  {space.image_url ? (
                    <img src={space.image_url} alt={space.name} className="h-full w-full object-cover transition-transform hover:scale-105" />
                  ) : (
                    <div className="h-full gradient-primary flex items-center justify-center">
                      <MapPin className="h-10 w-10 text-primary-foreground/40" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-heading font-semibold text-foreground">{space.name}</h3>
                      <p className="text-xs text-muted-foreground">{spaceTypeLabels[space.space_type]}</p>
                    </div>
                    <Badge variant={space.is_available ? "default" : "secondary"}>
                      {space.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {space.capacity}</span>
                    {space.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {space.location}</span>}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    {(space.amenities || []).slice(0, 3).map((a: string) => (
                      <span key={a} className="rounded bg-accent px-2 py-0.5 text-xs text-accent-foreground">{a}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-heading text-lg font-bold text-foreground">
                      KES {Number(space.hourly_rate).toLocaleString()}<span className="text-xs font-normal text-muted-foreground">/hr</span>
                    </p>
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/reservations?space=${space.id}`}>Book Now</a>
                    </Button>
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

export default SpacesPage;
