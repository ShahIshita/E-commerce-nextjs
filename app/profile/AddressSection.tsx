'use client'

import { useCallback, useEffect, useState } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabaseBrowser'
import { ButtonLoader } from '@/components/ui/ButtonLoader'
import { MapPin, Pencil, Trash2 } from 'lucide-react'

export type Address = {
  id: string
  address_line: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}

const emptyForm = {
  address_line: '',
  city: '',
  state: '',
  postal_code: '',
  country: '',
}

export default function AddressSection({ userId }: { userId: string }) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const loadAddresses = useCallback(async () => {
    const { data, error } = await supabase
      .from('addresses')
      .select('id, address_line, city, state, postal_code, country, is_default')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })

    if (!error) setAddresses((data ?? []) as Address[])
    setLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  async function getAddressFromCoords(lat: number, lon: number) {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { 'Accept-Language': 'en' } }
    )
    const data = await res.json()
    const a = data?.address || {}
    const address_line = [a.house_number, a.road, a.suburb, a.neighbourhood].filter(Boolean).join(', ') || a.village || a.town || data?.display_name?.split(',')[0] || ''
    return {
      address_line: address_line || 'Address from location',
      city: a.city || a.town || a.village || a.county || '',
      state: a.state || '',
      postal_code: a.postcode || '',
      country: a.country || '',
    }
  }

  async function handleUseCurrentLocation() {
    setLocationError(null)
    setLocationLoading(true)
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      setLocationLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setMapCoords({ lat: latitude, lng: longitude })
        try {
          const addr = await getAddressFromCoords(latitude, longitude)
          setForm(addr)
          setShowAddForm(true)
        } catch {
          setLocationError('Could not fetch address for this location.')
        }
        setLocationLoading(false)
      },
      () => {
        setLocationError('Could not get your location. Check permissions or try again.')
        setLocationLoading(false)
      }
    )
  }

  async function handleSubmit(e: React.FormEvent, addressId?: string, addAnother?: boolean) {
    e.preventDefault()
    setSaveError(null)
    const payload = {
      address_line: form.address_line.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postal_code: form.postal_code.trim(),
      country: form.country.trim() || 'India',
      is_default: addresses.length === 0,
    }
    if (!payload.address_line || !payload.city) {
      setSaveError('Please enter address line and city.')
      return
    }
    setSaving(true)

    if (addressId) {
      const { error } = await supabase.from('addresses').update(payload).eq('id', addressId).eq('user_id', userId)
      if (error) {
        setSaveError(error.message)
      } else {
        setAddresses((prev) => prev.map((a) => (a.id === addressId ? { ...a, ...payload } : a)))
        setEditingId(null)
      }
    } else {
      const { data, error } = await supabase.from('addresses').insert({ user_id: userId, ...payload }).select('id').single()
      if (error) {
        setSaveError(error.message)
      } else if (data) {
        setAddresses((prev) => [...prev, { ...payload, id: data.id }])
        setForm(emptyForm)
        setMapCoords(null)
        setSaveError(null)
        if (!addAnother) {
          setShowAddForm(false)
        }
      }
    }
    setSaving(false)
  }

  async function setDefault(id: string) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', userId)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id).eq('user_id', userId)
    loadAddresses()
  }

  async function deleteAddress(id: string) {
    if (!confirm('Remove this address?')) return
    await supabase.from('addresses').delete().eq('id', id).eq('user_id', userId)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    if (editingId === id) setEditingId(null)
  }

  if (loading) {
    return <p style={{ color: '#6b7280' }}>Loading addresses...</p>
  }

  return (
    <div
      style={{
        padding: '1.5rem',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
      }}
    >
      <h2 style={{ marginBottom: '1rem', fontSize: '1.125rem', fontWeight: '600', color: '#374151' }}>
        Saved Addresses {addresses.length > 0 && `(${addresses.length})`}
      </h2>

      <div style={{ marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => {
            setShowAddForm(true)
            setForm(emptyForm)
            setMapCoords(null)
            setSaveError(null)
          }}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#6366f1',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}
        >
          Add address
        </button>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={locationLoading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#059669',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: locationLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          {locationLoading && <ButtonLoader />}
          <MapPin size={16} />
          Use current location
        </button>
      </div>

      {locationError && (
        <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{locationError}</p>
      )}

      {saveError && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.875rem' }}>
          {saveError}
        </div>
      )}

      {showAddForm && (
        <form
          onSubmit={(e) => handleSubmit(e)}
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: '#f9fafb',
          }}
        >
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>New address</h3>
          <div style={{ display: 'grid', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Address line</label>
              <input
                value={form.address_line}
                onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))}
                required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                placeholder="Street, building, landmark"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>State</label>
                <input
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Postal code</label>
                <input
                  value={form.postal_code}
                  onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: '500', fontSize: '0.875rem' }}>Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                />
              </div>
            </div>
            {mapCoords && (
              <div>
                <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.25rem' }}>Current location on map</p>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${mapCoords.lat}&mlon=${mapCoords.lng}#map=17/${mapCoords.lat}/${mapCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#2563eb', fontSize: '0.875rem' }}
                >
                  View on map →
                </a>
                <div style={{ marginTop: '0.5rem', borderRadius: '8px', overflow: 'hidden', maxWidth: 400 }}>
                  <img
                    src={`https://staticmap.openstreetmap.de/staticmap.php?center=${mapCoords.lat},${mapCoords.lng}&zoom=15&size=400x150&markers=${mapCoords.lat},${mapCoords.lng}`}
                    alt="Location map"
                    style={{ width: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              </div>
            )}
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            <button type="submit" disabled={saving} style={{ padding: '0.5rem 1rem', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {saving && <ButtonLoader />} Save address
            </button>
            <button type="button" onClick={(e) => handleSubmit(e as unknown as React.FormEvent, undefined, true)} disabled={saving} style={{ padding: '0.5rem 1rem', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              {saving && <ButtonLoader />} Save and add another
            </button>
            <button type="button" onClick={() => { setShowAddForm(false); setForm(emptyForm); setMapCoords(null); setSaveError(null); }} style={{ padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {addresses.map((addr, index) => (
          <div
            key={addr.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
              backgroundColor: addr.is_default ? '#eff6ff' : '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>
                Address {index + 1}
              </span>
              {addr.is_default && <span style={{ fontSize: '0.7rem', backgroundColor: '#2563eb', color: '#fff', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>Default</span>}
            </div>
            {editingId === addr.id ? (
              <form onSubmit={(e) => handleSubmit(e, addr.id)} style={{ display: 'grid', gap: '0.5rem' }}>
                <input value={form.address_line} onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))} required placeholder="Address line" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} required placeholder="City" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                  <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="State" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input value={form.postal_code} onChange={(e) => setForm((f) => ({ ...f, postal_code: e.target.value }))} placeholder="Postal code" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                  <input value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} required placeholder="Country" style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" disabled={saving}>Save</button>
                  <button type="button" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <p style={{ margin: 0, fontWeight: 500 }}>{addr.address_line}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
                  {[addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ')}
                </p>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => { setEditingId(addr.id); setForm({ address_line: addr.address_line, city: addr.city, state: addr.state, postal_code: addr.postal_code, country: addr.country }); }} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Pencil size={14} /> Edit
                  </button>
                  {!addr.is_default && (
                    <button type="button" onClick={() => setDefault(addr.id)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}>
                      Set as default
                    </button>
                  )}
                  <button type="button" onClick={() => deleteAddress(addr.id)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', border: 'none', color: '#dc2626', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {addresses.length === 0 && !showAddForm && (
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>No saved addresses. Add one or use current location.</p>
      )}
    </div>
  )
}
