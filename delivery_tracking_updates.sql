-- 1. Update existing orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- 2. Create a separate deliveries table for shipment tracking
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  courier_name TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  delivery_status TEXT DEFAULT 'pending'
);

-- 3. Set up Row Level Security (RLS) for the deliveries table
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Allow users to view deliveries attached to their own orders
CREATE POLICY "Users can view their own deliveries" ON deliveries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = deliveries.order_id
      AND orders.user_id = auth.uid()
    )
  );
