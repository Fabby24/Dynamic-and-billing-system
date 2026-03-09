

## Plan: Enhanced Landing Page with Dark Mode, Mobile Responsiveness, and Modern Footer

### 1. Dark Mode Toggle

The project already has `next-themes` installed but no `ThemeProvider` wrapping the app. Changes:

- **`src/App.tsx`**: Wrap the app with `ThemeProvider` from `next-themes` (attribute="class", defaultTheme="system", enableSystem)
- **`src/pages/LandingPage.tsx`**: Add a Sun/Moon toggle button in the navbar using `useTheme()` from next-themes

### 2. Enhanced Landing Page (`src/pages/LandingPage.tsx`)

Complete rewrite with richer content and better mobile responsiveness:

**Navbar enhancements:**
- Mobile hamburger menu (Menu/X icon toggle) with slide-down nav links
- Dark mode toggle button (Sun/Moon icons)
- Smooth transitions

**Hero section enhancements:**
- Trusted-by logos/badges row beneath the CTA
- Animated gradient background orbs
- Better mobile text sizing

**New: Testimonials section**
- 3 customer testimonial cards with avatar, name, role, and quote
- Responsive grid (1 col mobile, 3 col desktop)

**New: Pricing preview section**
- 3 pricing tiers (Hourly, Daily, Monthly) with feature lists
- Highlight the popular plan

**Enhanced "Why Choose Us"**
- Add 2 more feature cards (total 6): 24/7 Access, Community Events
- 2-col on mobile, 3-col on desktop

**Modern Footer:**
- 4-column grid: Company info, Quick Links, Support, Contact
- Social media icon links: Twitter/X, Facebook, Instagram, LinkedIn, YouTube
- Newsletter email input
- Bottom bar with copyright, Privacy Policy, Terms of Service links
- Fully responsive (stacks on mobile)

### 3. Mobile Responsiveness Throughout
- All grids use responsive breakpoints (grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3)
- Text sizes scale with viewport (text-3xl → sm:text-4xl → lg:text-6xl)
- Padding adjusts for small screens
- Mobile nav menu with hamburger toggle

### Files to modify:
1. **`src/App.tsx`** -- Add ThemeProvider wrapper
2. **`src/pages/LandingPage.tsx`** -- Full enhancement with all new sections, dark mode toggle, mobile menu, modern footer

