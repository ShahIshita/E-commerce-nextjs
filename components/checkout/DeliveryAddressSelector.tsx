'use client'

import { useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'

export type AddressOption = {
  id: string
  address_line: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

type Props = {
  addresses: AddressOption[]
  selectedAddressId: string | null
  onAddressSelect: (id: string) => void
  userEmail: string
  userName: string
  onAddressAdded?: (newAddress: AddressOption) => void
}

export default function DeliveryAddressSelector({
  addresses,
  selectedAddressId,
  onAddressSelect,
  userEmail,
  userName,
  onAddressAdded,
}: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const selected = addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.is_default) ?? addresses[0]

  async function handleAddNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      address_line: fd.get('address_line') as string,
      city: fd.get('city') as string,
      state: fd.get('state') as string,
      postal_code: fd.get('postal_code') as string,
      country: fd.get('country') as string,
      is_default: true
    }

    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setLoading(false)
      return
    }

    // if there were other addresses, unset their default
    if (payload.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', session.user.id)
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...payload, user_id: session.user.id })
      .select()
      .single()

    setLoading(false)
    if (error) {
      alert(error.message)
      return
    }
    
    if (onAddressAdded && data) {
      onAddressAdded(data)
    }
    onAddressSelect(data.id)
    setIsAddingNew(false)
    setIsModalOpen(false)
  }

  return (
    <>
      <div 
        className="checkout-delivery-card" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'baseline',
          padding: '1.25rem',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#fff',
          marginBottom: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#111827', textTransform: 'uppercase' }}>Deliver to:</h3>
            <span style={{ fontWeight: 600, color: '#111827' }}>{userName}</span>
            <span style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem', backgroundColor: '#e5e7eb', borderRadius: '4px', color: '#374151', fontWeight: 600 }}>HOME</span>
          </div>
          
          {selected ? (
            <p style={{ margin: 0, color: '#4b5563', fontSize: '0.95rem' }}>
              {selected.address_line}, {selected.city}
              {selected.state && `, ${selected.state}`} {selected.postal_code && `- ${selected.postal_code}`}
              {selected.country && `, ${selected.country}`}
            </p>
          ) : (
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>No address selected</p>
          )}
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#fff',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            color: '#2563eb',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Change
        </button>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Change Delivery Address</h2>
              <button 
                onClick={() => { setIsModalOpen(false); setIsAddingNew(false); }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
              >
                &times;
              </button>
            </div>

            {isAddingNew ? (
              <form onSubmit={handleAddNew}>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>Address Line</label>
                    <input name="address_line" required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>City</label>
                      <input name="city" required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>State</label>
                      <input name="state" required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>Postal Code</label>
                      <input name="postal_code" required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>Country</label>
                      <input name="country" required defaultValue="India" style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => setIsAddingNew(false)} style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={loading} style={{ padding: '0.6rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    {loading ? 'Saving...' : 'Save and Deliver Here'}
                  </button>
                </div>
              </form>
            ) : (
              <>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  {addresses.map((addr) => (
                    <div 
                      key={addr.id} 
                      onClick={() => {
                        onAddressSelect(addr.id)
                        setIsModalOpen(false)
                      }}
                      style={{ 
                        display: 'flex', 
                        gap: '1rem', 
                        padding: '1rem', 
                        border: addr.id === selected?.id ? '2px solid #2563eb' : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        backgroundColor: addr.id === selected?.id ? '#eff6ff' : '#fff'
                      }}
                    >
                      <input 
                        type="radio" 
                        checked={addr.id === selected?.id} 
                        readOnly 
                        style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                      />
                      <div>
                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: addr.id === selected?.id ? 600 : 400 }}>
                          {addr.address_line}
                        </p>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                          {addr.city}, {addr.state} {addr.postal_code}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => setIsAddingNew(true)}
                  style={{ width: '100%', padding: '0.8rem', backgroundColor: '#f9fafb', border: '1px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', color: '#2563eb', fontWeight: 500 }}
                >
                  + Add a new address
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
