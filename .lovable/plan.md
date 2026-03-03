

## Plan: Spaces Improvements, Admin Space Management, and Auto-Invoice Generation

### 1. Spaces Page -- High-Quality Images and 9 Spaces

**Current state:** 9 spaces exist in the database but only 3 have `image_url` set. The ones without images show a plain gradient with a MapPin icon.

**Changes:**
- Update the 6 spaces missing `image_url` in the database with high-quality Unsplash images matching their space type (boardroom, private office, desk, event hall)
- No code change needed for the grid -- it already renders all spaces returned from the query. The spaces will appear automatically once images are set.
- Update `SpacesPage.tsx` to display the actual `image_url` instead of the gradient placeholder when an image exists

### 2. Admin Page -- Add/Edit Spaces Tab

Add a new **"Spaces"** tab to the Admin Panel with:

- **Add Space** button opening a dialog form (name, type, capacity, hourly rate, daily rate, location, amenities, image URL, description)
- **Spaces table** listing all spaces with Edit and toggle availability buttons
- **Edit Space** dialog pre-filled with existing data, allowing admins to update any field
- Reuses existing patterns from other admin tabs (useQuery, useMutation, Dialog)

### 3. Auto-Generate Invoice When Reservation Is Created

**Root cause of the bug:** `ReservationsPage.handleCreate` inserts into `reservations` but never creates a corresponding invoice. The Invoices page shows nothing because no invoice rows exist for the booking.

**Fix:** After successfully inserting a reservation, automatically create an invoice:
- Generate a unique invoice number (e.g., `INV-YYYYMMDD-XXXX`)
- Calculate subtotal from `total_cost`, apply 16% VAT
- Set `due_date` to 7 days from now
- Insert into `invoices` table with `status: 'draft'`, linking `reservation_id` and `user_id`
- Show a toast confirming both reservation and invoice creation

---

### Technical Details

**Database updates (via insert tool):**
- UPDATE 6 spaces to set `image_url` with appropriate Unsplash photos

**File changes:**

1. **`src/pages/SpacesPage.tsx`** -- Replace gradient placeholder with actual image when `space.image_url` exists using an `<img>` tag with object-cover styling

2. **`src/pages/AdminPage.tsx`** -- Add a 4th tab "Spaces" with:
   - `SpacesAdminTab` component with CRUD table
   - Add Space dialog (form with all space fields)
   - Edit Space dialog (pre-populated form)
   - Toggle availability button

3. **`src/pages/ReservationsPage.tsx`** -- Update `handleCreate` to insert an invoice after the reservation is created:
   ```
   // After reservation insert succeeds:
   const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
   const subtotal = totalCost;
   const taxRate = 16;
   const taxAmount = subtotal * (taxRate / 100);
   const totalAmount = subtotal + taxAmount;
   
   await supabase.from("invoices").insert([{
     reservation_id: newReservationId,
     user_id: user.id,
     invoice_number: invoiceNumber,
     subtotal, tax_rate: taxRate, tax_amount: taxAmount,
     total_amount: totalAmount,
     status: "draft",
     due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString().split("T")[0],
   }]);
   ```
   This requires changing the reservation insert to use `.select().single()` so we get back the new reservation ID.

