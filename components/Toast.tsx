'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string
  visible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, visible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [visible, onClose, duration])

  if (!visible) return null

  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        padding: '12px 24px',
        backgroundColor: '#16a34a',
        color: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '0.9375rem',
        fontWeight: '500',
        zIndex: 9999,
        animation: 'toastSlideIn 0.3s ease-out',
      }}
    >
      {message}
      <style>{`
        @keyframes toastSlideIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
