ALTER TABLE public.cart_items
  ADD COLUMN IF NOT EXISTS selected_size TEXT;
