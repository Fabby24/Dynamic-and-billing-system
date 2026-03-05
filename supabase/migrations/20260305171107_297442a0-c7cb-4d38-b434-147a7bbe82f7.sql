DROP POLICY "Anyone can view available spaces" ON public.spaces;

CREATE POLICY "Anyone can view available spaces"
ON public.spaces
FOR SELECT
TO anon, authenticated
USING (true);