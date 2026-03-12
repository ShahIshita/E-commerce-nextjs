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
  id, name, description, price, category_id, stock_quantity, image_url, brand, color, size
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    'Wireless Headphones X100',
    'Over-ear Bluetooth headphones with active noise cancellation.',
    89.99,
    '11111111-1111-1111-1111-111111111111',
    35,
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200',
    'Sony',
    'Black',
    'One Size'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    'Smartphone Pro 12',
    '6.7-inch display smartphone with 128GB storage and dual camera.',
    699.00,
    '11111111-1111-1111-1111-111111111111',
    20,
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200',
    'Samsung',
    'Blue',
    '128GB'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    'Slim Fit Denim Jacket',
    'Classic slim-fit denim jacket for all-season casual wear.',
    59.50,
    '22222222-2222-2222-2222-222222222222',
    42,
    'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=1200',
    'Levis',
    'Navy',
    'M'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
    'Running Shoes AirFlex',
    'Lightweight running shoes with breathable mesh and soft sole.',
    74.00,
    '22222222-2222-2222-2222-222222222222',
    50,
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200',
    'Nike',
    'White',
    'UK-9'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
    'Non-stick Cookware Set',
    '8-piece non-stick cookware set suitable for gas and induction.',
    129.99,
    '33333333-3333-3333-3333-333333333333',
    16,
    'https://images.unsplash.com/photo-1584990347449-a1c6450f7e45?w=1200',
    'Prestige',
    'Black',
    '8-Piece'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
    'Portable Blender 500ml',
    'USB rechargeable blender for smoothies and shakes on-the-go.',
    34.75,
    '33333333-3333-3333-3333-333333333333',
    60,
    'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=1200',
    'Philips',
    'Green',
    '500ml'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7',
    'Atomic Habits',
    'A practical guide to building good habits and breaking bad ones.',
    18.99,
    '44444444-4444-4444-4444-444444444444',
    120,
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=1200',
    'Penguin',
    'Multicolor',
    'Paperback'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8',
    'Clean Code',
    'A handbook of agile software craftsmanship by Robert C. Martin.',
    27.49,
    '44444444-4444-4444-4444-444444444444',
    80,
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200',
    'Prentice Hall',
    'Multicolor',
    'Paperback'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9',
    'Bluetooth Speaker Mini',
    'Compact portable speaker with deep bass and 10-hour battery life.',
    49.99,
    '11111111-1111-1111-1111-111111111111',
    55,
    'https://images.unsplash.com/photo-1589003077984-894e133dabab?w=1200',
    'JBL',
    'Red',
    'One Size'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa10',
    'Laptop Air 14',
    '14-inch lightweight laptop with 16GB RAM and 512GB SSD.',
    999.00,
    '11111111-1111-1111-1111-111111111111',
    14,
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200',
    'HP',
    'Silver',
    '14-inch'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa11',
    'Casual Cotton T-Shirt',
    'Soft cotton crew-neck t-shirt ideal for daily wear.',
    19.99,
    '22222222-2222-2222-2222-222222222222',
    110,
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200',
    'H&M',
    'Black',
    'L'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa12',
    'Women Summer Dress',
    'Floral printed summer dress with breathable fabric.',
    44.00,
    '22222222-2222-2222-2222-222222222222',
    38,
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1200',
    'Zara',
    'Pink',
    'S'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa13',
    'Stainless Steel Water Bottle',
    'Insulated 1L bottle keeps drinks cold for 24 hours.',
    22.50,
    '33333333-3333-3333-3333-333333333333',
    75,
    'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=1200',
    'Milton',
    'Blue',
    '1L'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa14',
    'Air Fryer XL',
    'Large capacity air fryer with digital touch controls.',
    149.00,
    '33333333-3333-3333-3333-333333333333',
    18,
    'https://images.unsplash.com/photo-1615485925834-9d0f9b89f0a8?w=1200',
    'Philips',
    'Black',
    '5L'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa15',
    'The Psychology of Money',
    'Timeless lessons on wealth, greed, and happiness.',
    16.49,
    '44444444-4444-4444-4444-444444444444',
    90,
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1200',
    'Jaico',
    'Multicolor',
    'Paperback'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa16',
    'Deep Work',
    'Rules for focused success in a distracted world.',
    21.25,
    '44444444-4444-4444-4444-444444444444',
    64,
    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200',
    'Grand Central',
    'Multicolor',
    'Paperback'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa17',
    'Gaming Mouse Pro',
    'Ergonomic RGB gaming mouse with programmable buttons.',
    39.99,
    '11111111-1111-1111-1111-111111111111',
    73,
    'https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200',
    'Logitech',
    'Black',
    'One Size'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa18',
    'Travel Backpack 35L',
    'Water-resistant backpack with laptop sleeve and organizer pockets.',
    68.00,
    '22222222-2222-2222-2222-222222222222',
    46,
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200',
    'Wildcraft',
    'Grey',
    '35L'
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  category_id = EXCLUDED.category_id,
  stock_quantity = EXCLUDED.stock_quantity,
  image_url = EXCLUDED.image_url,
  brand = EXCLUDED.brand,
  color = EXCLUDED.color,
  size = EXCLUDED.size;

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
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb007',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb008',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa10',
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb009',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa11',
    'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb010',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa12',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb011',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa13',
    'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb012',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa14',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb013',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa15',
    'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb014',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa16',
    'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb015',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa17',
    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbb016',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaa18',
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200'
  )
ON CONFLICT (id) DO UPDATE
SET
  product_id = EXCLUDED.product_id,
  image_url = EXCLUDED.image_url;

COMMIT;
