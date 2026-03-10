

## Plan: Hide "New Reservation" Button for Admins

The "New Reservation" button and dialog live in `src/pages/ReservationsPage.tsx`. The fix is simple: use the `useAuth` context (which already provides `isAdmin`) to conditionally hide the button for admin users.

### Changes

**File: `src/pages/ReservationsPage.tsx`**
- Import `isAdmin` from `useAuth` (already importing `useAuth`)
- Wrap the `Dialog` (containing the "New Reservation" button and form) in a conditional: only render when `!isAdmin`
- This keeps the reservation list visible to admins but removes their ability to create new ones

Single file, ~2 lines changed.

