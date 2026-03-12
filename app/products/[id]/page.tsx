import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabaseServer'

type ProductDetailPageProps = {
  params: {
    id: string
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from('products')
    .select(
      `
      id,
      name,
      description,
      price,
      stock_quantity,
      image_url,
      brand,
      color,
      size,
      created_at,
      categories (
        id,
        name
      )
    `
    )
    .eq('id', params.id)
    .single()

  if (error || !product) {
    notFound()
  }

  const { data: images } = await supabase
    .from('product_images')
    .select('id, image_url')
    .eq('product_id', product.id)

  const gallery = [
    ...(product.image_url ? [product.image_url] : []),
    ...((images ?? []).map((img) => img.image_url)),
  ]
  const categoryRelation = Array.isArray(product.categories)
    ? product.categories[0]
    : product.categories
  const categoryName = categoryRelation?.name || 'Uncategorized'

  return (
    <div style={{ padding: '2rem', maxWidth: '980px', margin: '0 auto' }}>
      <Link
        href="/products"
        style={{ display: 'inline-block', marginBottom: '1rem', color: '#374151', textDecoration: 'underline' }}
      >
        Back to Products
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '1.5rem',
          backgroundColor: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '10px',
          padding: '1.25rem',
        }}
      >
        <div>
          <img
            src={gallery[0] || 'https://via.placeholder.com/800x500?text=No+Image'}
            alt={product.name}
            style={{ width: '100%', height: '360px', objectFit: 'cover', borderRadius: '8px' }}
          />

          {gallery.length > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              {gallery.slice(1).map((imageUrl, idx) => (
                <img
                  key={`${imageUrl}-${idx}`}
                  src={imageUrl}
                  alt={`${product.name} ${idx + 2}`}
                  style={{ width: '92px', height: '72px', objectFit: 'cover', borderRadius: '6px' }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 style={{ marginBottom: '0.75rem' }}>{product.name}</h1>

          <p style={{ color: '#6b7280', marginBottom: '0.75rem' }}>
            Category: {categoryName}
          </p>

          <p style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
            ${Number(product.price).toFixed(2)}
          </p>

          <p style={{ marginBottom: '1rem', color: '#374151' }}>
            {product.description || 'No description provided.'}
          </p>

          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Brand:</strong> {product.brand || 'N/A'}
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Color:</strong> {product.color || 'N/A'}
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Size:</strong> {product.size || 'N/A'}
          </p>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Stock:</strong> {product.stock_quantity}
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
            Added: {new Date(product.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
}
