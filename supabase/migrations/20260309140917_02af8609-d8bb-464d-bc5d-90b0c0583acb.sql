-- Fix RLS: All current policies are RESTRICTIVE which breaks access.
-- Need PERMISSIVE policies. Drop and recreate as PERMISSIVE.

-- RESERVATIONS
DROP POLICY IF EXISTS "Admins can manage all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can update own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Users can view own reservations" ON public.reservations;

CREATE POLICY "Admins can manage all reservations" ON public.reservations
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own reservations" ON public.reservations
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can create reservations" ON public.reservations
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reservations" ON public.reservations
  FOR UPDATE TO public USING (auth.uid() = user_id);

-- INVOICES
DROP POLICY IF EXISTS "Admins can manage invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can create own invoices" ON public.invoices;
DROP POLICY IF EXISTS "Users can view own invoices" ON public.invoices;

CREATE POLICY "Admins can manage invoices" ON public.invoices
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own invoices" ON public.invoices
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can create own invoices" ON public.invoices
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- PAYMENTS
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
DROP POLICY IF EXISTS "Users can create payments" ON public.payments;
DROP POLICY IF EXISTS "Users can view own payments" ON public.payments;

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can create payments" ON public.payments
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- PROFILES
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

-- USER_ROLES
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO public USING (auth.uid() = user_id);

-- SPACES
DROP POLICY IF EXISTS "Admins can manage spaces" ON public.spaces;
DROP POLICY IF EXISTS "Anyone can view available spaces" ON public.spaces;

CREATE POLICY "Admins can manage spaces" ON public.spaces
  FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view available spaces" ON public.spaces
  FOR SELECT TO anon, authenticated USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;