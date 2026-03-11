-- Seed data for Phase-4 product/category module
-- Safe to run multiple times (uses ON CONFLICT).

BEGIN;

-- Categories
INSERT INTO public.categories (id, name, description)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Electronics', 'Phones, laptops, audio devices, and accessories'),
  ('22222222-2222-2222-2222-222222222222', 'Fashion', 'Clothing, footwear, and daily wear essentials'),
  ('33333333-3333-3333-3333-333333333333', 'Home & Kitchen', 'Home appliances and kitchen utility products'),
  ('44444444-4444-4444-4444-444444444444', 'Books', 'Fiction, non-fiction, and technical books')
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- Products
INSERT INTO public.products (
  id, name, description, price, category_id, stock_quantity, image_url
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Wireless Headphones X100',
    'Over-ear Bluetooth headphones with active noise cancellation.',
    89.99,
    '11111111-1111-1111-1111-111111111111',
    35,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'Smartphone Pro 12',
    '6.7-inch display smartphone with 128GB storage and dual camera.',
    699.00,
    '11111111-1111-1111-1111-111111111111',
    20,
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'Slim Fit Denim Jacket',
    'Classic slim-fit denim jacket for all-season casual wear.',
    59.50,
    '22222222-2222-2222-2222-222222222222',
    42,
    'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=1200'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    'Running Shoes AirFlex',
    'Lightweight running shoes with breathable mesh and soft sole.',
    74.00,
    '22222222-2222-2222-2222-222222222222',
    50,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    'Non-stick Cookware Set',
    '8-piece non-stick cookware set suitable for gas and induction.',
    129.99,
    '33333333-3333-3333-3333-333333333333',
    16,
    'https://images.unsplash.com/photo-1584990347449-a1c6450f7e45?w=1200'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    'Portable Blender 500ml',
    'USB rechargeable blender for smoothies and shakes on-the-go.',
    34.75,
    '33333333-3333-3333-3333-333333333333',
    60,
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=1200'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7',
    'Atomic Habits',
    'A practical guide to building good habits and breaking bad ones.',
    18.99,
    '44444444-4444-4444-4444-444444444444',
    120,
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8',
    'Clean Code',
    'A handbook of agile software craftsmanship by Robert C. Martin.',
    27.49,
    '44444444-4444-4444-4444-444444444444',
    80,
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200'
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  stock_quantity = EXCLUDED.stock_quantity,
  image_url = EXCLUDED.image_url;

-- Additional product images
INSERT INTO public.product_images (id, product_id, image_url)
VALUES
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb001',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb002',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'https://images.unsplash.com/photo-1577174881658-0f30ed549adc?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb003',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb004',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb005',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb006',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8',
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=1200'
  )
ON CONFLICT (id) DO UPDATE
SET
  product_id = EXCLUDED.product_id,
  image_url = EXCLUDED.image_url;

COMMIT;
