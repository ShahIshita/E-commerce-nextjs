-- Addresses for user profile and checkout

CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address_line TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT '',
  postal_code TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);

ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON public.addresses
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses"
  ON public.addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses"
  ON public.addresses
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses"
  ON public.addresses
  FOR DELETE
  USING (auth.uid() = user_id);
