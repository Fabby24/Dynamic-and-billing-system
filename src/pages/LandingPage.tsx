import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Sun,
  Moon,
  Menu,
  X,
  Check,
  Quote,
  Wifi,
  PartyPopper,
  Mail,
  Phone,
  MapPinned,
} from "lucide-react";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

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

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

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

          {/* Desktop nav */}
          <div className="hidden items-center gap-6 md:flex">
            <a href="#spaces" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Spaces</a>
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>
            <div className="hidden items-center gap-2 sm:flex">
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth">
                <Button size="sm" className="gradient-primary text-primary-foreground">Get Started</Button>
              </Link>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background px-4 py-4 md:hidden animate-fade-in">
            <div className="flex flex-col gap-3">
              <a href="#spaces" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Spaces</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Features</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Pricing</a>
              <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Testimonials</a>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Link to="/auth" className="flex-1">
                  <Button variant="outline" className="w-full" size="sm">Sign In</Button>
                </Link>
                <Link to="/auth" className="flex-1">
                  <Button className="w-full gradient-primary text-primary-foreground" size="sm">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-secondary" />
              Modern workspace solutions
            </div>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Premium Workspaces for{" "}
              <span className="bg-gradient-to-r from-primary to-[hsl(250,65%,55%)] bg-clip-text text-transparent">
                Modern Teams
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg lg:text-xl">
              Book conference rooms, private offices, desks, and event halls — all from one platform.
              Flexible scheduling, instant invoicing, and seamless M-Pesa payments.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Link to="/auth">
                <Button size="lg" className="gradient-primary text-primary-foreground px-8 text-base w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#spaces">
                <Button size="lg" variant="outline" className="px-8 text-base w-full sm:w-auto">
                  Explore Spaces
                </Button>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-4 sm:gap-8 animate-fade-in" style={{ animationDelay: "200ms" }}>
            {[
              { value: "9+", label: "Workspaces", icon: Building2 },
              { value: "200+", label: "Happy Clients", icon: Users },
              { value: "3", label: "Locations", icon: MapPin },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                  <stat.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="font-heading text-xl font-bold sm:text-3xl">{stat.value}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Trusted by */}
          <div className="mx-auto mt-16 max-w-3xl text-center animate-fade-in" style={{ animationDelay: "400ms" }}>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-6">Trusted by leading organizations</p>
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 opacity-60">
              {["Safaricom", "KCB Group", "Equity Bank", "KPMG", "Deloitte"].map((name) => (
                <span key={name} className="font-heading text-sm sm:text-base font-semibold text-muted-foreground">{name}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Spaces */}
      <section id="spaces" className="border-t border-border bg-card/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Building2 className="h-3 w-3" /> Our Spaces
            </div>
            <h2 className="font-heading text-2xl font-bold sm:text-4xl">Featured Spaces</h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Hand-picked workspaces designed for productivity and collaboration.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space, i) => (
              <div
                key={space.id}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  {space.image_url ? (
                    <img src={space.image_url} alt={space.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                <div className="p-4 sm:p-5">
                  <h3 className="font-heading text-base sm:text-lg font-semibold">{space.name}</h3>
                  <div className="mt-2 flex items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {space.capacity}</span>
                    {space.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {space.location}</span>}
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-heading text-lg sm:text-xl font-bold text-primary">
                      KES {space.hourly_rate.toLocaleString()}<span className="text-xs sm:text-sm font-normal text-muted-foreground">/hr</span>
                    </p>
                    <Link to="/auth"><Button size="sm" variant="outline">Book Now</Button></Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {spaces.length > 0 && (
            <div className="mt-10 text-center">
              <Link to="/auth">
                <Button variant="outline" size="lg">View All Spaces <ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section id="features" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Star className="h-3 w-3" /> Why Us
            </div>
            <h2 className="font-heading text-2xl font-bold sm:text-4xl">Why Choose SpaceHub</h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">
              Everything you need to manage your workspace bookings in one place.
            </p>
          </div>

          <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: CalendarCheck, title: "Flexible Booking", desc: "Book by the hour or day. Cancel or reschedule anytime with no hassle." },
              { icon: Star, title: "Premium Amenities", desc: "High-speed WiFi, projectors, whiteboards, and refreshments included." },
              { icon: FileText, title: "Instant Invoicing", desc: "Automatic invoice generation with VAT calculation for every booking." },
              { icon: Shield, title: "Secure M-Pesa Payments", desc: "Pay seamlessly via M-Pesa STK push. Fast, safe, and reliable." },
              { icon: Wifi, title: "24/7 Access", desc: "Round-the-clock access to your workspace with secure keycard entry." },
              { icon: PartyPopper, title: "Community Events", desc: "Regular networking events, workshops, and social gatherings for members." },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="rounded-xl border border-border bg-card p-6 text-center shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
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
      <section className="border-t border-border bg-card/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="h-3 w-3" /> Simple Process
            </div>
            <h2 className="font-heading text-2xl font-bold sm:text-4xl">How It Works</h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">Get started in three simple steps.</p>
          </div>

          <div className="mt-10 grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3">
            {[
              { step: "01", icon: Search, title: "Browse Spaces", desc: "Explore our curated collection of premium workspaces across multiple locations." },
              { step: "02", icon: CreditCard, title: "Book & Pay", desc: "Reserve your space and pay securely via M-Pesa with instant confirmation." },
              { step: "03", icon: Clock, title: "Start Working", desc: "Show up and get productive in your perfect workspace with all amenities ready." },
            ].map((item, i) => (
              <div
                key={item.step}
                className="relative rounded-xl border border-border bg-card p-6 sm:p-8 text-center shadow-card animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 font-heading text-sm font-bold text-primary-foreground">
                  {item.step}
                </span>
                <div className="mx-auto mb-4 mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-accent">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-heading text-base sm:text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <CreditCard className="h-3 w-3" /> Pricing
            </div>
            <h2 className="font-heading text-2xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">Choose the plan that fits your needs. No hidden fees.</p>
          </div>

          <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-3">
            {[
              {
                name: "Hourly",
                price: "500",
                unit: "/hour",
                desc: "Perfect for quick meetings",
                popular: false,
                features: ["Access to all spaces", "WiFi included", "Projector access", "Tea & coffee"],
              },
              {
                name: "Daily",
                price: "3,500",
                unit: "/day",
                desc: "Best for full workdays",
                popular: true,
                features: ["Everything in Hourly", "Dedicated desk", "Printing access", "Lunch voucher", "Meeting room credits"],
              },
              {
                name: "Monthly",
                price: "45,000",
                unit: "/month",
                desc: "For regular members",
                popular: false,
                features: ["Everything in Daily", "Private office", "24/7 access", "Mail handling", "Event invitations", "Priority support"],
              },
            ].map((plan, i) => (
              <div
                key={plan.name}
                className={`relative rounded-xl border bg-card p-6 sm:p-8 shadow-card transition-all duration-300 hover:shadow-elevated animate-fade-in ${
                  plan.popular ? "border-primary ring-2 ring-primary/20" : "border-border"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-primary px-4 py-1 text-xs font-bold text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <h3 className="font-heading text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.desc}</p>
                <div className="mt-4">
                  <span className="font-heading text-3xl sm:text-4xl font-bold text-primary">KES {plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.unit}</span>
                </div>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth" className="mt-6 block">
                  <Button className={`w-full ${plan.popular ? "gradient-primary text-primary-foreground" : ""}`} variant={plan.popular ? "default" : "outline"}>
                    Get Started
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="border-t border-border bg-card/50 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Quote className="h-3 w-3" /> Testimonials
            </div>
            <h2 className="font-heading text-2xl font-bold sm:text-4xl">What Our Members Say</h2>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground">Real stories from professionals who work at SpaceHub.</p>
          </div>

          <div className="mt-10 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { name: "Jane Muthoni", role: "Startup Founder", quote: "SpaceHub transformed how our team collaborates. The booking system is seamless, and the spaces are beautifully maintained.", avatar: "JM" },
              { name: "David Ochieng", role: "Freelance Designer", quote: "I love the flexibility of booking by the hour. The M-Pesa integration makes payment effortless. Highly recommend!", avatar: "DO" },
              { name: "Amina Hassan", role: "Marketing Director", quote: "We host all our client meetings at SpaceHub. The professional environment and amenities always impress our guests.", avatar: "AH" },
            ].map((t, i) => (
              <div
                key={t.name}
                className="rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-elevated animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-heading text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-2xl gradient-primary p-8 text-center sm:p-16 animate-fade-in">
            <h2 className="font-heading text-2xl font-bold text-primary-foreground sm:text-4xl">
              Ready to find your perfect workspace?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base text-primary-foreground/80">
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
      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Main footer */}
          <div className="grid gap-8 py-12 sm:py-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {/* Company */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary">
                  <Building2 className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="font-heading text-lg font-bold">SpaceHub</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Premium coworking spaces for modern teams. Flexible booking, seamless payments, and world-class amenities.
              </p>
              {/* Social links */}
              <div className="mt-5 flex gap-3">
                {[
                  { label: "Twitter", href: "https://twitter.com" },
                  { label: "Facebook", href: "https://facebook.com" },
                  { label: "Instagram", href: "https://instagram.com" },
                  { label: "LinkedIn", href: "https://linkedin.com" },
                  { label: "YouTube", href: "https://youtube.com" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:text-foreground hover:border-primary"
                    aria-label={social.label}
                  >
                    <span className="text-xs font-bold">{social.label[0]}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-sm font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2.5">
                {[
                  { label: "Browse Spaces", href: "#spaces" },
                  { label: "Pricing", href: "#pricing" },
                  { label: "Testimonials", href: "#testimonials" },
                  { label: "Sign In", href: "/auth" },
                ].map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</a>
                    ) : (
                      <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-heading text-sm font-semibold mb-4">Support</h4>
              <ul className="space-y-2.5">
                {["Help Center", "FAQs", "Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter + Contact */}
            <div>
              <h4 className="font-heading text-sm font-semibold mb-4">Stay Updated</h4>
              <p className="text-sm text-muted-foreground mb-3">Subscribe to our newsletter for the latest updates.</p>
              <div className="flex gap-2">
                <Input placeholder="Your email" className="h-9 text-sm" />
                <Button size="sm" className="gradient-primary text-primary-foreground h-9 px-4">
                  <Mail className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-5 space-y-2">
                <a href="mailto:hello@spacehub.co.ke" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-3.5 w-3.5" /> hello@spacehub.co.ke
                </a>
                <a href="tel:+254700000000" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-3.5 w-3.5" /> +254 700 000 000
                </a>
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinned className="h-3.5 w-3.5" /> Nairobi, Kenya
                </p>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-border py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} SpaceHub. All rights reserved.</p>
            <div className="flex gap-6 text-xs text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
