-- Link orders to delivery address

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_address_id ON public.orders(address_id);
