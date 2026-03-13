import { createClient } from '@/lib/supabaseServer'
import HomePageClient from '@/components/home/HomePageClient'

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
  const matched = categories.find(
    (category) => category.name.toLowerCase() === label.toLowerCase()
  )
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

  const categoryTabs = HOME_CATEGORIES.map((label) => ({
    label,
    href: getCategoryHref(label, categories ?? []),
  }))

  const mapProduct = (p: (typeof list)[0]) => ({
    id: p.id,
    name: p.name,
    price: Number(p.price),
    image_url: p.image_url,
    category_id: p.category_id ?? undefined,
  })

  return (
    <HomePageClient
      categoryTabs={categoryTabs}
      stillLooking={stillLooking.map(mapProduct)}
      trends={trends.map(mapProduct)}
      lowestPrices={lowestPrices.map(mapProduct)}
    />
  )
}
