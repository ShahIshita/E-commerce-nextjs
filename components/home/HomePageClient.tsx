'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

type CategoryTab = {
  label: string
  href: string
}

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
  category_id?: string
}

type HomePageClientProps = {
  categoryTabs: CategoryTab[]
  stillLooking: Product[]
  trends: Product[]
  lowestPrices: Product[]
}

const ITEM_WIDTH = 180
const ITEMS_VISIBLE = 5
const GAP = 12
const SCROLL_AMOUNT = (ITEM_WIDTH + GAP) * ITEMS_VISIBLE

/** Intercept a navigation href – redirect to login if user is not authenticated */
function useAuthNav() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user)
    })
    return () => subscription.unsubscribe()
  }, [])

  const navigate = useCallback(
    (href: string) => {
      if (isLoggedIn) {
        router.push(href)
      } else {
        router.push(`/auth/login?redirectTo=${encodeURIComponent(href)}`)
      }
    },
    [isLoggedIn, router]
  )

  return { navigate, isLoggedIn }
}

// ─── Category Tabs ────────────────────────────────────────────────────────────
function CategoryTabs({ tabs }: { tabs: CategoryTab[] }) {
  const { navigate } = useAuthNav()
  return (
    <div className="home-category-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          onClick={() => navigate(tab.href)}
          className="home-category-tab"
          style={{ cursor: 'pointer', background: 'none', border: 'none', font: 'inherit' }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── Search Form ──────────────────────────────────────────────────────────────
function HomeSearchForm() {
  const { navigate } = useAuthNav()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const q = (fd.get('search') as string)?.trim()
    const href = q ? `/products?search=${encodeURIComponent(q)}` : '/products'
    navigate(href)
  }

  return (
    <form onSubmit={handleSubmit} className="home-search-row">
      <input
        name="search"
        placeholder="Search for Products, Brands and More"
        className="home-search-input"
      />
      <button type="submit" className="home-search-btn">
        Search
      </button>
    </form>
  )
}

// ─── Banner Cards ─────────────────────────────────────────────────────────────
function BannerCard({
  src,
  alt,
  title,
  subtitle,
  href,
  navigate,
}: {
  src: string
  alt: string
  title: string
  subtitle: string
  href: string
  navigate: (href: string) => void
}) {
  return (
    <div
      className="home-banner-card"
      onClick={() => navigate(href)}
      style={{ cursor: 'pointer' }}
    >
      <img src={src} alt={alt} />
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
  )
}

// ─── Product Carousel ─────────────────────────────────────────────────────────
function AuthedProductCarousel({
  products,
  title,
  showPrice = false,
}: {
  products: Product[]
  title: string
  showPrice?: boolean
}) {
  const { navigate } = useAuthNav()
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null)

  function scroll() {
    scrollRef?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className="home-red-section">
      <h2>{title}</h2>
      <div className="home-carousel-wrap">
        <div ref={setScrollRef} className="home-carousel-scroll">
          {products.map((product) => (
            <div
              key={product.id}
              className="home-product-tile"
              onClick={() => navigate(`/products/${product.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={product.image_url || 'https://via.placeholder.com/260x180?text=No+Image'}
                alt={product.name}
              />
              <p>
                {product.name}
                {showPrice && <span>${Number(product.price).toFixed(2)}</span>}
              </p>
            </div>
          ))}
        </div>
        {products.length > ITEMS_VISIBLE && (
          <button
            type="button"
            className="home-carousel-next"
            onClick={scroll}
            aria-label="Next"
          >
            ›
          </button>
        )}
      </div>
    </section>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function HomePageClient({
  categoryTabs,
  stillLooking,
  trends,
  lowestPrices,
}: HomePageClientProps) {
  const { navigate } = useAuthNav()

  return (
    <div className="home-page-wrap">
      <div className="home-page-inner">

        <HomeSearchForm />

        <CategoryTabs tabs={categoryTabs} />

        <div className="home-banner-strip">
          <BannerCard
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200"
            alt="Laptop deals"
            title="Intel Core Ultra laptops"
            subtitle="Top offers on premium models"
            href="/products?category=electronics"
            navigate={navigate}
          />
          <BannerCard
            src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=1200"
            alt="Appliance deals"
            title="Home appliances"
            subtitle="Bank offers and cashback"
            href="/products?category=home"
            navigate={navigate}
          />
          <BannerCard
            src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200"
            alt="Audio deals"
            title="Audio series from $39"
            subtitle="Headphones and speakers"
            href="/products?category=electronics"
            navigate={navigate}
          />
        </div>

        <AuthedProductCarousel products={stillLooking} title="Still looking for these?" />
        <AuthedProductCarousel products={trends} title="Trends you may like" />
        <AuthedProductCarousel products={lowestPrices} title="Lowest prices in the year" showPrice />
      </div>
    </div>
  )
}
