import Link from 'next/link'
import AuthButton from './AuthButton'

interface NavbarProps {
  /** When true, show minimal navbar (Store + Login/Signup only) - used on auth pages */
  minimal?: boolean
}

export default function Navbar({ minimal = false }: NavbarProps) {
  return (
    <nav style={{ 
      padding: '1rem 2rem', 
      backgroundColor: '#ffffff', 
      color: '#1f2937',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      borderBottom: '1px solid #e5e7eb'
    }}>
      <Link href="/" style={{ 
        color: '#6366f1', 
        textDecoration: 'none', 
        fontSize: '1.5rem', 
        fontWeight: 'bold' 
      }}>
        E-commerce Store
      </Link>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {!minimal && (
          <Link href="/products" style={{ 
            color: '#374151', 
            textDecoration: 'none',
            fontWeight: '500',
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#374151'}
          >
            Products
          </Link>
        )}
        <AuthButton minimal={minimal} />
      </div>
    </nav>
  )
}
