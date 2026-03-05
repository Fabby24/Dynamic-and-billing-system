

## Fix: Mobile Sidebar Toggle Not Visible

### Problem
The mobile header (line 43-50) only shows the logo and brand name but has no hamburger menu button to open/close the sidebar navigation. On mobile, the sidebar is hidden (`hidden md:flex`) and there's no way to toggle it.

### Solution

**`src/components/AppSidebar.tsx`**:
1. Add a `mobileOpen` state to control mobile sidebar visibility
2. Add a hamburger Menu button to the mobile header bar (right side)
3. Show the sidebar as a slide-over overlay on mobile when `mobileOpen` is true, with a backdrop overlay to close it
4. Auto-close the mobile sidebar when a nav link is clicked

No other files need changes. The `AppLayout` already reserves `pt-14` for the mobile header.

