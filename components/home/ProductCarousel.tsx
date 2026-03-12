'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type Product = {
  id: string
  name: string
  price: number
  image_url: string | null
  category_id?: string
}

type ProductCarouselProps = {
  products: Product[]
  title: string
  showPrice?: boolean
}

const ITEM_WIDTH = 180
const ITEMS_VISIBLE = 5
const GAP = 12
const SCROLL_AMOUNT = (ITEM_WIDTH + GAP) * ITEMS_VISIBLE

export default function ProductCarousel({
  products,
  title,
  showPrice = false,
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll() {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' })
  }

  if (products.length === 0) return null

  return (
    <section className="home-red-section">
      <h2>{title}</h2>
      <div className="home-carousel-wrap">
        <div ref={scrollRef} className="home-carousel-scroll">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="home-product-tile"
            >
              <img
                src={product.image_url || 'https://via.placeholder.com/260x180?text=No+Image'}
                alt={product.name}
              />
              <p>
                {product.name}
                {showPrice && <span>${Number(product.price).toFixed(2)}</span>}
              </p>
            </Link>
          ))}
        </div>
        {products.length > ITEMS_VISIBLE && (
          <button
            type="button"
            className="home-carousel-next"
            onClick={scroll}
            aria-label="Next"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>
    </section>
  )
}
