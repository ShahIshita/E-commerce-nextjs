'use client'

/** Spinner shown inside buttons while loading */
export function ButtonLoader() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '1rem',
        height: '1rem',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        marginRight: '0.5rem',
        verticalAlign: 'middle',
      }}
    />
  )
}
