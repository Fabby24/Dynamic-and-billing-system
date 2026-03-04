import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  MapPin,
  CalendarCheck,
  Sparkles,
  FileText,
  Shield,
  ArrowRight,
  Star,
  Clock,
  CreditCard,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Space {
  id: string;
  name: string;
  space_type: string;
  capacity: number;
  hourly_rate: number;
  image_url: string | null;
  location: string | null;
}

const spaceTypeLabels: Record<string, string> = {
  conference_room: "Conference Room",
  private_office: "Private Office",
  desk: "Desk",
  event_hall: "Event Hall",
};

const LandingPage = () => {
  const [spaces, setSpaces] = useState<Space[]>([]);

  useEffect(() => {
    supabase
      .from("spaces")
      .select("id, name, space_type, capacity, hourly_rate, image_url, location")
      .eq("is_available", true)
      .limit(6)
      .then(({ data }) => {
        if (data) setSpaces(data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
              <Building2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold">SpaceHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-primary text-primary-foreground">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-secondary" />
              Modern workspace solutions
            </div>
            <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Premium Workspaces for{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(250,65%,55%)] bg-clip-text text-transparent">
                Modern Teams
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Book conference rooms, private offices, desks, and event halls — all from one platform.
              Flexible scheduling, instant invoicing, and seamless M-Pesa payments.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground px-8 text-base">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#spaces">
                <Button size="lg" variant="outline" className="px-8 text-base">
                  Explore Spaces
                </Button>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-3 gap-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {[
              { value: "9+", label: "Workspaces", icon: Building2 },
              { value: "200+", label: "Happy Clients", icon: Users },
              { value: "3", label: "Locations", icon: MapPin },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-heading text-2xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Spaces */}
      <section id="spaces" className="border-t border-border bg-card/50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">Featured Spaces</h2>
            <p className="mt-4 text-muted-foreground">
              Hand-picked workspaces designed for productivity and collaboration.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space, i) => (
              <div
                key={space.id}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden">
                  {space.image_url ? (
                    <img
                      src={space.image_url}
                      alt={space.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center gradient-primary">
                      <Building2 className="h-12 w-12 text-primary-foreground/60" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                      {spaceTypeLabels[space.space_type] || space.space_type}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-heading text-lg font-semibold">{space.name}</h3>
                  <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {space.capacity}
                    </span>
                    {space.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" /> {space.location}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-heading text-xl font-bold text-primary">
                      KES {space.hourly_rate.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">/hr</span>
                    </p>
                    <Link to="/auth">
                      <Button size="sm" variant="outline">Book Now</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {spaces.length > 0 && (
            <div className="mt-12 text-center">
              <Link to="/auth">
                <Button variant="outline" size="lg">
                  View All Spaces <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">Why Choose SpaceHub</h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need to manage your workspace bookings in one place.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: CalendarCheck,
                title: "Flexible Booking",
                desc: "Book by the hour or day. Cancel or reschedule anytime with no hassle.",
              },
              {
                icon: Star,
                title: "Premium Amenities",
                desc: "High-speed WiFi, projectors, whiteboards, and refreshments included.",
              },
              {
                icon: FileText,
                title: "Instant Invoicing",
                desc: "Automatic invoice generation with VAT calculation for every booking.",
              },
              {
                icon: Shield,
                title: "Secure M-Pesa Payments",
                desc: "Pay seamlessly via M-Pesa STK push. Fast, safe, and reliable.",
              },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-card transition-all duration-300 hover:shadow-elevated animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-border bg-card/50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-muted-foreground">Get started in three simple steps.</p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", icon: Search, title: "Browse Spaces", desc: "Explore our curated collection of premium workspaces." },
              { step: "02", icon: CreditCard, title: "Book & Pay", desc: "Reserve your space and pay securely via M-Pesa." },
              { step: "03", icon: Clock, title: "Start Working", desc: "Show up and get productive in your perfect workspace." },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-border bg-card p-8 text-center shadow-card animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 font-heading text-sm font-bold text-primary-foreground">
                  {item.step}
                </span>
                <div className="mx-auto mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl gradient-primary p-10 text-center sm:p-16 animate-fade-in">
            <h2 className="font-heading text-3xl font-bold text-primary-foreground sm:text-4xl">
              Ready to find your perfect workspace?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
              Join hundreds of professionals and teams who trust SpaceHub for their workspace needs.
            </p>
            <Link to="/auth" className="mt-8 inline-block">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 px-8 text-base">
                Sign Up Now <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold">SpaceHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SpaceHub. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
              <a href="#spaces" className="hover:text-foreground transition-colors">Spaces</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
