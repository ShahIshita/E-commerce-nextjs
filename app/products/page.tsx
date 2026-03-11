import Link from 'next/link'
import { createClient } from '@/lib/supabaseServer'

type ProductsPageProps = {
  searchParams?: {
    category?: string
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const selectedCategoryId = searchParams?.category

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  let productsQuery = supabase
    .from('products')
    .select('id, name, description, price, stock_quantity, image_url, category_id')
    .order('created_at', { ascending: false })

  if (selectedCategoryId) {
    productsQuery = productsQuery.eq('category_id', selectedCategoryId)
  }

  const { data: products, error } = await productsQuery

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '1rem' }}>Products</h1>

      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link
          href="/products"
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
              href={`/products?category=${category.id}`}
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
        <p style={{ color: '#6b7280' }}>No products found for this category.</p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
          gap: '1rem',
        }}
      >
        {(products ?? []).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: '#fff',
            }}
          >
            <img
              src={product.image_url || 'https://via.placeholder.com/400x250?text=No+Image'}
              alt={product.name}
              style={{
                width: '100%',
                height: '160px',
                objectFit: 'cover',
                borderRadius: '6px',
                marginBottom: '0.75rem',
              }}
            />
            <h3 style={{ marginBottom: '0.5rem' }}>{product.name}</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '0.75rem' }}>
              {product.description || 'No description available'}
            </p>
            <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>${Number(product.price).toFixed(2)}</p>
            <p style={{ fontSize: '0.85rem', color: '#4b5563' }}>
              Stock: {product.stock_quantity}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
