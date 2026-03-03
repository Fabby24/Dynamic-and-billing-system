

## Landing Page for SpaceHub

### Overview
Create an attractive, public landing page at the root route (`/`) that showcases SpaceHub's coworking spaces and drives visitors to sign up or log in. The current dashboard moves to `/dashboard`.

### Route Changes
- `/` -- New public landing page (no auth required)
- `/dashboard` -- Current dashboard (protected)
- Update `AppSidebar` dashboard link to point to `/dashboard`

### Landing Page Sections (single file: `src/pages/LandingPage.tsx`)

1. **Hero Section**
   - Full-width background with gradient overlay
   - Headline: "Premium Workspaces for Modern Teams"
   - Subtext describing flexible booking
   - Two CTA buttons: "Get Started" (links to `/auth`) and "Explore Spaces" (scrolls down)
   - Stats bar: number of spaces, happy clients, cities

2. **Featured Spaces Section**
   - Pulls up to 6 available spaces from the database (public read -- spaces table already has RLS allowing select)
   - Displays them in a responsive grid with images, name, type, capacity, and price
   - "View All Spaces" button links to `/auth` (must log in to access full app)

3. **Why Choose Us Section**
   - 3-4 feature cards with icons: Flexible Booking, Premium Amenities, Instant Invoicing, Secure Payments (M-Pesa)

4. **How It Works Section**
   - 3 steps: Browse Spaces, Book & Pay, Start Working
   - Clean numbered cards

5. **Call-to-Action Banner**
   - "Ready to find your perfect workspace?" with Sign Up button

6. **Footer**
   - Brand name, copyright, and links

### Design
- Uses existing Space Grotesk headings, Inter body, gradient-primary, gradient-accent utilities
- Smooth scroll animations using Tailwind `animate-fade-in`
- Fully responsive (mobile-first grid)
- Consistent with the existing premium SaaS aesthetic

### Technical Details

**Files to create:**
- `src/pages/LandingPage.tsx` -- The full landing page component, fetches featured spaces from Supabase

**Files to modify:**
- `src/App.tsx` -- Add LandingPage import, change `/` to LandingPage (public), add `/dashboard` as protected DashboardPage route
- `src/components/AppSidebar.tsx` -- Update dashboard NavLink `to` prop from `/` to `/dashboard`
- `src/components/ProtectedRoute.tsx` -- No changes needed (already redirects to `/auth`)

**Database:** No changes needed. The spaces table already allows public select via RLS, so the landing page can fetch featured spaces without authentication.

