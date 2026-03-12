'use client'

import { useState } from 'react'
import { ButtonLoader } from '@/components/ui/ButtonLoader'

type LoadingSubmitButtonProps = {
  idleText: string
  loadingText: string
  style?: React.CSSProperties
}

export default function LoadingSubmitButton({
  idleText,
  loadingText,
  style,
}: LoadingSubmitButtonProps) {
  const [loading, setLoading] = useState(false)

  return (
    <button
      type="submit"
      onClick={() => setLoading(true)}
      disabled={loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        ...style,
      }}
    >
      {loading && <ButtonLoader />}
      {loading ? loadingText : idleText}
    </button>
  )
}
