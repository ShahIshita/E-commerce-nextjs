'use client'

import { useMemo, useState } from 'react'

type ProductImageGalleryProps = {
  productName: string
  images: string[]
}

export default function ProductImageGallery({ productName, images }: ProductImageGalleryProps) {
  const safeImages = useMemo(
    () =>
      images.length > 0
        ? images
        : ['https://via.placeholder.com/800x500?text=No+Image'],
    [images]
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [zoomOpen, setZoomOpen] = useState(false)

  const activeImage = safeImages[activeIndex] ?? safeImages[0]

  return (
    <>
      <div>
        <div
          style={{
            width: '100%',
            height: '360px',
            borderRadius: '10px',
            overflow: 'hidden',
            border: '1px solid #e5e7eb',
            cursor: 'zoom-in',
            backgroundColor: '#f8fafc',
          }}
          onClick={() => setZoomOpen(true)}
          title="Click to zoom"
        >
          <img
            src={activeImage}
            alt={productName}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>

        {safeImages.length > 1 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
            {safeImages.map((imageUrl, index) => (
              <button
                key={`${imageUrl}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                style={{
                  width: '92px',
                  height: '72px',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: activeIndex === index ? '2px solid #2563eb' : '1px solid #e5e7eb',
                  padding: 0,
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                <img
                  src={imageUrl}
                  alt={`${productName} ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoomOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: 'min(1000px, 95vw)',
              height: 'min(700px, 90vh)',
              backgroundColor: '#fff',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateRows: '1fr auto',
            }}
          >
            <img
              src={activeImage}
              alt={`${productName} enlarged`}
              style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f8fafc' }}
            />
            <div
              style={{
                padding: '0.55rem 0.75rem',
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#374151', fontSize: '0.9rem' }}>
                Image {activeIndex + 1} of {safeImages.length}
              </span>
              <button
                type="button"
                onClick={() => setZoomOpen(false)}
                style={{
                  border: '1px solid #d1d5db',
                  borderRadius: '7px',
                  padding: '0.35rem 0.65rem',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
