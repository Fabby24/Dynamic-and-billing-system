

## Fix: Spaces not showing on landing page + Admin "Add Space" button

### Root Cause: RLS Policy Issue

The spaces query from the landing page returns an empty array (`[]`) because the RLS policy "Anyone can view available spaces" is created as **RESTRICTIVE** (`Permissive: No`). In PostgreSQL, when all policies are restrictive and there are no permissive policies, access is denied by default. Unauthenticated (anon) users get zero rows.

### Fix 1: Database Migration -- Make spaces SELECT policy permissive

Drop the existing restrictive policy and recreate it as a **PERMISSIVE** policy:

```sql
DROP POLICY "Anyone can view available spaces" ON public.spaces;

CREATE POLICY "Anyone can view available spaces"
ON public.spaces
FOR SELECT
TO anon, authenticated
USING (true);
```

This allows both anonymous and authenticated users to read spaces, which is needed for the landing page.

### Fix 2: Add "Add Space" button for admins on SpacesPage

The SpacesPage currently has a create space dialog. Ensure the "Add Space" button is visible and functional for admin users by checking `isAdmin` from the auth context (already imported). The button should be conditionally rendered for admins.

### Files to modify:
1. **Database migration** -- Fix the RLS policy on spaces table
2. **`src/pages/SpacesPage.tsx`** -- Ensure admin "Add Space" button is prominently visible

