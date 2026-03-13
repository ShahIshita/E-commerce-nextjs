'use client'

import { useRouter } from 'next/navigation'
import DeliveryAddressSelector, { AddressOption } from '@/components/checkout/DeliveryAddressSelector'

type Props = {
  addresses: AddressOption[]
  selectedAddressId: string | null
  buyNowProductId: string | null
  userEmail: string
  userName: string
}

export default function CheckoutAddressSelect({
  addresses,
  selectedAddressId,
  buyNowProductId,
  userEmail,
  userName,
}: Props) {
  const router = useRouter()

  function handleAddressSelect(id: string) {
    if (!id) return
    const params = new URLSearchParams()
    params.set('addressId', id)
    if (buyNowProductId) params.set('buyNow', buyNowProductId)
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <DeliveryAddressSelector
      addresses={addresses}
      selectedAddressId={selectedAddressId}
      onAddressSelect={handleAddressSelect}
      userName={userName}
      userEmail={userEmail}
      onAddressAdded={(newList) => {
        if(newList.length > 0) {
           handleAddressSelect(newList[0].id)
        }
        router.refresh()
      }}
    />
  )
}
