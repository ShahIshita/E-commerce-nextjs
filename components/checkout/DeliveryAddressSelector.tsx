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
  phone_number?: string
  is_default: boolean
}

type Props = {
  addresses: AddressOption[]
  selectedAddressId: string | null
  onAddressSelect: (id: string) => void
  userEmail: string
  userName: string
  onAddressAdded?: (newAddresses: AddressOption[]) => void // Passing whole array better
}

export default function DeliveryAddressSelector({
  addresses: initialAddresses,
  selectedAddressId,
  onAddressSelect,
  userEmail,
  userName,
  onAddressAdded,
}: Props) {
  const [addresses, setAddresses] = useState<AddressOption[]>(initialAddresses)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingAddr, setEditingAddr] = useState<AddressOption | null>(null)
  const [loading, setLoading] = useState(false)
  
  const selected = addresses.find((a) => a.id === selectedAddressId) ?? addresses.find((a) => a.is_default) ?? addresses[0]

  async function handleAddOrUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const payload = {
      address_line: fd.get('address_line') as string,
      city: fd.get('city') as string,
      state: fd.get('state') as string,
      postal_code: fd.get('postal_code') as string,
      country: fd.get('country') as string,
      phone_number: fd.get('phone_number') as string || null,
      is_default: true
    }

    const supabase = createSupabaseBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      setLoading(false)
      return
    }

    if (payload.is_default) {
      await supabase.from('addresses').update({ is_default: false }).eq('user_id', session.user.id)
    }

    let resultData;

    if (editingAddr) {
      const { data, error } = await supabase
        .from('addresses')
        .update(payload)
        .eq('id', editingAddr.id)
        .select()
        .single()
      
      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }
      resultData = data
      const updated = addresses.map(a => a.id === editingAddr.id ? data : a)
      setAddresses(updated)
      if(onAddressAdded) onAddressAdded(updated)
    } else {
      const { data, error } = await supabase
        .from('addresses')
        .insert({ ...payload, user_id: session.user.id })
        .select()
        .single()

      if (error) {
        alert(error.message)
        setLoading(false)
        return
      }
      resultData = data
      const updated = [data, ...addresses.map(a => ({...a, is_default: false}))]
      setAddresses(updated)
      if(onAddressAdded) onAddressAdded(updated)
    }

    setLoading(false)
    onAddressSelect(resultData.id)
    setIsAddingNew(false)
    setEditingAddr(null)
    setIsModalOpen(false)
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this address?')) return
    const supabase = createSupabaseBrowserClient()
    setLoading(true)
    await supabase.from('addresses').delete().eq('id', id)
    setLoading(false)
    
    const updated = addresses.filter(a => a.id !== id)
    setAddresses(updated)
    if(onAddressAdded) onAddressAdded(updated)
    
    if (selectedAddressId === id) {
      const nextSelect = updated.find(a => a.is_default) ?? updated[0]
      if (nextSelect) onAddressSelect(nextSelect.id)
    }
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
              {selected.phone_number && <><br/><strong>Phone:</strong> {selected.phone_number}</>}
            </p>
          ) : (
            <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>No address selected</p>
          )}
        </div>
        <button
          onClick={() => { setIsModalOpen(true); setIsAddingNew(false); setEditingAddr(null); }}
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
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                {isAddingNew ? 'Add New Address' : editingAddr ? 'Edit Address' : 'Change Delivery Address'}
              </h2>
              <button 
                onClick={() => { setIsModalOpen(false); setIsAddingNew(false); setEditingAddr(null); }}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280' }}
              >
                &times;
              </button>
            </div>

            {isAddingNew || editingAddr ? (
              <form onSubmit={handleAddOrUpdate}>
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>Phone Number <span style={{color:'#6b7280'}}>(new)</span></label>
                    <input name="phone_number" defaultValue={editingAddr?.phone_number || ''} style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>Address Line</label>
                    <input name="address_line" defaultValue={editingAddr?.address_line || ''} required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>City</label>
                      <input name="city" defaultValue={editingAddr?.city || ''} required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>State</label>
                      <input name="state" defaultValue={editingAddr?.state || ''} required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>Postal Code</label>
                      <input name="postal_code" defaultValue={editingAddr?.postal_code || ''} required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem', color: '#374151' }}>Country</label>
                      <input name="country" defaultValue={editingAddr?.country || 'India'} required style={{ width: '100%', padding: '0.6rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => { setIsAddingNew(false); setEditingAddr(null); }} style={{ padding: '0.6rem 1rem', background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer' }}>Cancel</button>
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
                        position: 'relative',
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
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 0.25rem 0', fontWeight: addr.id === selected?.id ? 600 : 400 }}>
                          {addr.address_line}
                        </p>
                        <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                          {addr.city}, {addr.state} {addr.postal_code}
                          {addr.phone_number && <span><br/>Phone: {addr.phone_number}</span>}
                        </p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingAddr(addr); }}
                          style={{ padding: '0.25rem', color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={(e) => handleDelete(addr.id, e)}
                          disabled={loading}
                          style={{ padding: '0.25rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                        >
                          Delete
                        </button>
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
