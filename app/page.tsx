import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import ProductCarousel from '@/components/home/ProductCarousel'

const HOME_CATEGORIES = [
  'All',
  'Books',
  'Electronics',
  'Home & Kitchen',
  'Toys',
  'Beauty',
  'Sports',
]

function getCategoryHref(label: string, categories: { id: string; name: string }[]) {
  if (label === 'All') return '/products'
  const matched = categories.find((category) => category.name.toLowerCase() === label.toLowerCase())
  if (matched) {
    return `/products?category=${encodeURIComponent(matched.id)}`
  }
  return `/products?search=${encodeURIComponent(label)}`
}

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from('categories').select('id, name').order('name', { ascending: true }),
    supabase
      .from('products')
      .select('id, name, price, image_url, category_id')
      .order('created_at', { ascending: false }),
  ])

  const list = products ?? []
  const stillLooking = list.slice(0, 15)
  const trends = list.slice(7, 22)
  const lowestPrices = [...list]
    .sort((a, b) => Number(a.price) - Number(b.price))
    .slice(0, 15)

  return (
    <div className="home-page-wrap">
      <div className="home-page-inner">
        
        <form action="/products" method="GET" className="home-search-row">
          <input
            name="search"
            placeholder="Search for Products, Brands and More"
            className="home-search-input"
          />
          <button type="submit" className="home-search-btn">
            Search
          </button>
        </form>

        <div className="home-category-tabs">
          {HOME_CATEGORIES.map((label) => (
            <Link key={label} href={getCategoryHref(label, categories ?? [])} className="home-category-tab">
              {label}
            </Link>
          ))}
        </div>

        <div className="home-banner-strip">
          <div className="home-banner-card">
            <img
              src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200"
              alt="Laptop deals"
            />
            <div>
              <h3>Intel Core Ultra laptops</h3>
              <p>Top offers on premium models</p>
            </div>
          </div>
          <div className="home-banner-card">
            <img
              src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200"
              alt="Appliance deals"
            />
            <div>
              <h3>Home appliances</h3>
              <p>Bank offers and cashback</p>
            </div>
          </div>
          <div className="home-banner-card">
            <img
              src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200"
              alt="Audio deals"
            />
            <div>
              <h3>Audio series from $39</h3>
              <p>Headphones and speakers</p>
            </div>
          </div>
        </div>

        <ProductCarousel
          products={stillLooking.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            image_url: p.image_url,
            category_id: p.category_id ?? undefined,
          }))}
          title="Still looking for these?"
        />

        <ProductCarousel
          products={trends.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            image_url: p.image_url,
            category_id: p.category_id ?? undefined,
          }))}
          title="Trends you may like"
        />

        <ProductCarousel
          products={lowestPrices.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            image_url: p.image_url,
            category_id: p.category_id ?? undefined,
          }))}
          title="Lowest prices in the year"
          showPrice
        />
      </div>
    </div>
  )
}
