-- Add optional filter attributes to products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS brand TEXT,
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS size TEXT;

-- Helpful indexes for filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products(brand);
CREATE INDEX IF NOT EXISTS idx_products_color ON public.products(color);
CREATE INDEX IF NOT EXISTS idx_products_size ON public.products(size);
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products(price);
