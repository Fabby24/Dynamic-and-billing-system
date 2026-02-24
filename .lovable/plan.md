

## Admin Panel for User Management, Role Assignment, and System-Wide Reservations

### Overview
Add a dedicated Admin Panel page with three tabs: **User Management**, **Role Assignment**, and **All Reservations**. Access is restricted to users with the `admin` role, checked via the existing `has_role` database function.

---

### 1. Role-Aware Auth Context

**File:** `src/contexts/AuthContext.tsx`

- After login, fetch the current user's role from `user_roles` table
- Expose `userRole` (string) and `isAdmin` (boolean) on the context
- This avoids repeated role queries throughout the app

---

### 2. Admin Page with Three Tabs

**New file:** `src/pages/AdminPage.tsx`

Three tabs using the existing Tabs component:

**Tab 1 -- Users**
- Fetch all profiles (admin RLS policy already allows this)
- Display in a table: Name, Email, Phone, Status (active/inactive), Created date
- Toggle user active status (update `profiles.is_active`)
- Search/filter by name or email

**Tab 2 -- Roles**
- Fetch all `user_roles` joined with `profiles` (for display names)
- Show each user's current role
- Dropdown to change role (`admin`, `member`, `accountant`)
- On change, update the `user_roles` row via Supabase client
- Confirmation dialog before role changes

**Tab 3 -- All Reservations**
- Fetch all reservations with joined space name and user profile
- Table with: User, Space, Title, Start/End, Cost, Status
- Filter by status (pending/confirmed/cancelled/completed)
- Admin can update reservation status (confirm/cancel)

---

### 3. RLS Policy Addition

**New migration** -- Add a policy so admins can manage (update) profiles:

```sql
CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));
```

The existing policies already allow admins to SELECT profiles, manage reservations, manage roles, and manage invoices.

---

### 4. Sidebar Update

**File:** `src/components/AppSidebar.tsx`

- Add an "Admin" nav item (Shield icon) pointing to `/admin`
- Conditionally render it only when `isAdmin` is true from AuthContext

---

### 5. Route Registration

**File:** `src/App.tsx`

- Add `/admin` route wrapped in `ProtectedRoute`
- The AdminPage itself checks `isAdmin` and shows an access-denied message for non-admins

---

### Technical Details

- **Role check**: Uses the existing `has_role` SQL function (security definer) to avoid RLS recursion
- **No new tables needed**: All data comes from existing `profiles`, `user_roles`, `reservations`, and `spaces` tables
- **Existing RLS coverage**: Admin ALL policies already exist on `user_roles`, `reservations`, `invoices`, and `payments`. Only `profiles` UPDATE for admins is missing
- **Components used**: Existing `Tabs`, `Table`, `Select`, `Dialog`, `Badge`, `Button` from the UI library

