export default function Footer() {
  return (
    <footer style={{ 
      padding: '2rem', 
      backgroundColor: '#ffffff', 
      color: '#6b7280',
      textAlign: 'center',
      marginTop: 'auto',
      borderTop: '1px solid #e5e7eb'
    }}>
      <p style={{ fontSize: '0.875rem' }}>
        &copy; {new Date().getFullYear()} NexCart. All rights reserved.
      </p>
    </footer>
  )
}
