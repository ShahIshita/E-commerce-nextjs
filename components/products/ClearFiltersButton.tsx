'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ButtonLoader } from '@/components/ui/ButtonLoader'

export default function ClearFiltersButton({ href }: { href: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="button"
      onClick={() => {
        setLoading(true)
        router.push(href)
      }}
      disabled={loading}
      style={{
        flex: 1,
        padding: '0.5rem',
        textAlign: 'center',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        color: '#374151',
        backgroundColor: '#fff',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
      }}
    >
      {loading && <ButtonLoader />}
      {loading ? 'Clearing...' : 'Clear'}
    </button>
  )
}
