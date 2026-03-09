

## Adjustments: Admin Reservations, Role-Based Navigation, and Admin Notifications

### Summary of Changes

There are four distinct requirements:
1. **Admins can also make reservations** (currently the reservation form works for any logged-in user, so this should already work — need to verify if there's a blocking issue)
2. **Hide Analytics from regular users** — only admins should see the Analytics page/nav link
3. **Admin notifications for new reservations and payments** — real-time alerts on the admin dashboard
4. **Only confirm a reservation if it's paid** — the Confirm button should check payment status first

---

### 1. Role-Based Navigation: Hide Analytics from Non-Admins

**File: `src/components/AppSidebar.tsx`**
- Move the Analytics nav item (`/analytics`) out of the base `navItems` array
- Add it to `allNavItems` only when `isAdmin` is true (alongside the Admin link)

**File: `src/App.tsx`**
- Wrap the `/analytics` route with an admin check (redirect non-admins away)

---

### 2. Admin Can Make Reservations

**File: `src/pages/ReservationsPage.tsx`**
- The current code already allows any authenticated user to create reservations. The issue is likely that RLS policies on `reservations` only allow `INSERT` where `auth.uid() = user_id`, and the admin `ALL` policy is set to `RESTRICTIVE` (not permissive).
- **Database fix**: The admin policies on `reservations` are currently `RESTRICTIVE`. They need to be `PERMISSIVE` so admins can also insert. Will update the RLS policies via migration to make admin policies permissive.

**Actually**: Looking more carefully, all policies are `Permissive: No` which means RESTRICTIVE. For Postgres RLS, restrictive policies must ALL pass. The current setup has both "Admins can manage all reservations" (ALL, restrictive) and "Users can create reservations" (INSERT, restrictive). For a non-admin user doing INSERT, both restrictive policies must pass — but the admin one would fail. This is a broader RLS issue.

Wait — re-reading: `Permissive: No` means it IS restrictive. For restrictive policies, ALL must pass. This means a regular user inserting would need to pass BOTH the admin check AND the user check, which would fail. But the user said "everything works perfectly" for regular users. Let me re-check — actually in Postgres, if there are no permissive policies, access is denied. Restrictive policies only further restrict permissive ones. So these might actually all be permissive despite the label. The label "Permissive: No" in the context dump likely means the policy type column shows whether it's permissive or not. Let me not overthink this — the user says regular users can make reservations fine but admins cannot.

The actual issue: The admin `ALL` policy uses `USING` but no `WITH CHECK`. For INSERT, Postgres uses `WITH CHECK`. The "Users can create reservations" has a `WITH Check Expression: (auth.uid() = user_id)`. The admin "manage all" policy has `Using Expression: has_role(...)` but no explicit WITH CHECK — which should default to the USING expression for permissive policies.

The simplest fix: ensure admin has a proper INSERT policy with WITH CHECK, or just verify the admin policy covers INSERT properly. Will add a migration to drop and recreate the admin reservation policy with both USING and WITH CHECK.

---

### 3. Admin Notifications for New Reservations and Payments

**File: `src/pages/AdminPage.tsx`** (or a new `AdminNotifications` component)
- Add a notifications section at the top of the Admin page
- Use Supabase Realtime to subscribe to `INSERT` events on `reservations` and `payments` tables
- Show toast notifications when new records arrive
- Display a notification badge/counter in the Admin nav link

**Database migration**: Enable realtime for `reservations` and `payments` tables:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
```

**File: `src/components/AppSidebar.tsx`**
- Add a notification badge on the Admin nav item showing unread count

---

### 4. Only Confirm Reservation If Paid

**File: `src/pages/AdminPage.tsx`** — `ReservationsTab`
- Before allowing the admin to click "Confirm", check if the associated invoice has a completed payment
- Query `invoices` joined with `payments` for the reservation ID
- If no completed payment exists, show a warning toast: "Cannot confirm — payment not received"
- Disable or hide the Confirm button for unpaid reservations; show "Awaiting Payment" label instead

---

### Files to modify:
1. `src/components/AppSidebar.tsx` — hide Analytics for non-admins, add notification badge
2. `src/App.tsx` — protect Analytics route for admins only
3. `src/pages/AdminPage.tsx` — payment check before confirm, realtime notifications
4. **Database migration** — fix admin RLS on reservations, enable realtime

