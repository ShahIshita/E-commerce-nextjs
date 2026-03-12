import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'
import PriceRangeSlider from '@/components/products/PriceRangeSlider'
import ProductCard from '@/components/products/ProductCard'
import LoadingSubmitButton from '@/components/products/LoadingSubmitButton'
import ClearFiltersButton from '@/components/products/ClearFiltersButton'

type ProductsPageProps = {
  searchParams?: Record<string, string | string[] | undefined>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const selectedCategoryId = (searchParams?.category as string) || ''
  const searchTerm = (searchParams?.search as string) || ''
  const minPrice = Number((searchParams?.minPrice as string) || 0) || 0
  const maxPrice = Number((searchParams?.maxPrice as string) || 0) || 0

  const normalizeMulti = (value: string | string[] | undefined) => {
    if (!value) return [] as string[]
    if (Array.isArray(value)) return value.filter(Boolean)
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  }

  const selectedBrands = normalizeMulti(searchParams?.brand)
  const selectedColors = normalizeMulti(searchParams?.color)
  const selectedSizes = normalizeMulti(searchParams?.size)
  const filterStateKey = JSON.stringify({
    category: selectedCategoryId,
    search: searchTerm,
    minPrice,
    maxPrice,
    brand: selectedBrands,
    color: selectedColors,
    size: selectedSizes,
  })

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  let facetsBaseQuery = supabase
    .from('products')
    .select('brand, color, size, price')
    .order('created_at', { ascending: false })

  if (selectedCategoryId) {
    facetsBaseQuery = facetsBaseQuery.eq('category_id', selectedCategoryId)
  }
  if (searchTerm) {
    facetsBaseQuery = facetsBaseQuery.ilike('name', `%${searchTerm}%`)
  }

  const { data: facetProducts } = await facetsBaseQuery
  const brandOptions = Array.from(new Set((facetProducts ?? []).map((p) => p.brand).filter(Boolean))) as string[]
  const colorOptions = Array.from(new Set((facetProducts ?? []).map((p) => p.color).filter(Boolean))) as string[]
  const sizeOptions = Array.from(new Set((facetProducts ?? []).map((p) => p.size).filter(Boolean))) as string[]
  const prices = (facetProducts ?? [])
    .map((p) => Number(p.price))
    .filter((price) => Number.isFinite(price))
  const minAvailablePrice = prices.length > 0 ? Math.floor(Math.min(...prices)) : 0
  const maxAvailablePrice = prices.length > 0 ? Math.ceil(Math.max(...prices)) : 100000

  let productsQuery = supabase
    .from('products')
    .select('id, name, description, price, stock_quantity, image_url, category_id, brand, color, size')
    .order('created_at', { ascending: false })

  if (selectedCategoryId) {
    productsQuery = productsQuery.eq('category_id', selectedCategoryId)
  }
  if (searchTerm) {
    productsQuery = productsQuery.ilike('name', `%${searchTerm}%`)
  }
  if (minPrice > 0) {
    productsQuery = productsQuery.gte('price', minPrice)
  }
  if (maxPrice > 0) {
    productsQuery = productsQuery.lte('price', maxPrice)
  }
  if (selectedBrands.length > 0) {
    productsQuery = productsQuery.in('brand', selectedBrands)
  }
  if (selectedColors.length > 0) {
    productsQuery = productsQuery.in('color', selectedColors)
  }
  if (selectedSizes.length > 0) {
    productsQuery = productsQuery.in('size', selectedSizes)
  }

  const { data: products, error } = await productsQuery

  const buildCategoryHref = (categoryId?: string) => {
    const params = new URLSearchParams()
    if (categoryId) params.set('category', categoryId)
    if (searchTerm) params.set('search', searchTerm)
    if (minPrice > 0) params.set('minPrice', String(minPrice))
    if (maxPrice > 0) params.set('maxPrice', String(maxPrice))
    if (selectedBrands.length > 0) params.set('brand', selectedBrands.join(','))
    if (selectedColors.length > 0) params.set('color', selectedColors.join(','))
    if (selectedSizes.length > 0) params.set('size', selectedSizes.join(','))
    const query = params.toString()
    return query ? `/products?${query}` : '/products'
  }
  const clearHref = searchTerm ? `/products?search=${encodeURIComponent(searchTerm)}` : '/products'

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Products</h1>

      <form
        key={`search-${filterStateKey}`}
        action="/products"
        method="GET"
        style={{
          marginBottom: '1rem',
          padding: '0.75rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#fff',
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: '0.5rem',
        }}
      >
        {selectedCategoryId && <input type="hidden" name="category" value={selectedCategoryId} />}
        {selectedBrands.map((brand) => (
          <input key={`search-brand-${brand}`} type="hidden" name="brand" value={brand} />
        ))}
        {selectedColors.map((color) => (
          <input key={`search-color-${color}`} type="hidden" name="color" value={color} />
        ))}
        {selectedSizes.map((size) => (
          <input key={`search-size-${size}`} type="hidden" name="size" value={size} />
        ))}
        {minPrice > 0 && <input type="hidden" name="minPrice" value={minPrice} />}
        {maxPrice > 0 && <input type="hidden" name="maxPrice" value={maxPrice} />}

        <input
          name="search"
          defaultValue={searchTerm}
          placeholder="Search products, brands and more"
          style={{ padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
        />
        <LoadingSubmitButton
          idleText="Search"
          loadingText="Searching..."
          style={{
            padding: '0.6rem 1rem',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#2563eb',
            color: '#fff',
            cursor: 'pointer',
          }}
        />
      </form>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          href={buildCategoryHref()}
          style={{
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            borderRadius: '6px',
            textDecoration: 'none',
            color: selectedCategoryId ? '#333' : '#fff',
            backgroundColor: selectedCategoryId ? '#fff' : '#333',
          }}
        >
          All
        </Link>

        {(categories ?? []).map((category) => {
          const isActive = selectedCategoryId === category.id
          return (
            <Link
              key={category.id}
              href={buildCategoryHref(category.id)}
              style={{
                padding: '0.5rem 0.75rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                textDecoration: 'none',
                color: isActive ? '#fff' : '#333',
                backgroundColor: isActive ? '#333' : '#fff',
              }}
            >
              {category.name}
            </Link>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1rem' }}>
        <aside
          style={{
            alignSelf: 'start',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#fff',
            padding: '1rem',
          }}
        >
          <h3 style={{ marginBottom: '0.75rem' }}>Filters</h3>

          <form key={`filters-${filterStateKey}`} action="/products" method="GET">
            <input type="hidden" name="search" value={searchTerm} />
            <input type="hidden" name="category" value={selectedCategoryId} />

            <details open style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Price Range</summary>
              <PriceRangeSlider
                minBound={minAvailablePrice}
                maxBound={maxAvailablePrice}
                selectedMin={minPrice}
                selectedMax={maxPrice}
              />
            </details>

            <details open style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Brand</summary>
              <div style={{ marginTop: '0.5rem' }}>
                {brandOptions.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No options</p>}
                {brandOptions.map((brand) => (
                  <label key={brand} style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <input type="checkbox" name="brand" value={brand} defaultChecked={selectedBrands.includes(brand)} /> {brand}
                  </label>
                ))}
              </div>
            </details>

            <details open style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Color</summary>
              <div style={{ marginTop: '0.5rem' }}>
                {colorOptions.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No options</p>}
                {colorOptions.map((color) => (
                  <label key={color} style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <input type="checkbox" name="color" value={color} defaultChecked={selectedColors.includes(color)} /> {color}
                  </label>
                ))}
              </div>
            </details>

            <details open style={{ marginBottom: '0.75rem' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Size</summary>
              <div style={{ marginTop: '0.5rem' }}>
                {sizeOptions.length === 0 && <p style={{ color: '#6b7280', fontSize: '0.85rem' }}>No options</p>}
                {sizeOptions.map((size) => (
                  <label key={size} style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                    <input type="checkbox" name="size" value={size} defaultChecked={selectedSizes.includes(size)} /> {size}
                  </label>
                ))}
              </div>
            </details>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
              <LoadingSubmitButton
                idleText="Apply"
                loadingText="Applying..."
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: '#111827',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              />
              <ClearFiltersButton href={clearHref} />
            </div>
          </form>
        </aside>

        <div>
      {error && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            border: '1px solid #fecaca',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            borderRadius: '6px',
          }}
        >
          Failed to load products. Please try again.
        </div>
      )}

      {!error && (products ?? []).length === 0 && (
        <p style={{ color: '#6b7280' }}>No products found for the selected filters.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '1rem',
        }}
      >
        {(products ?? []).map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              description: product.description,
              price: Number(product.price),
              stock_quantity: product.stock_quantity,
              image_url: product.image_url,
              brand: product.brand,
              color: product.color,
              size: product.size,
            }}
          />
        ))}
      </div>
        </div>
      </div>
    </div>
  )
}
