'use client'

import { useEffect, useMemo, useState } from 'react'
import { Range } from 'react-range'

type PriceRangeSliderProps = {
  minBound: number
  maxBound: number
  selectedMin: number
  selectedMax: number
}

export default function PriceRangeSlider({
  minBound,
  maxBound,
  selectedMin,
  selectedMax,
}: PriceRangeSliderProps) {
  const safeMin = Number.isFinite(minBound) ? minBound : 0
  const safeMax = Number.isFinite(maxBound) ? maxBound : 100000
  const step = Math.max(1, Math.floor((safeMax - safeMin) / 100))

  const initialMin = selectedMin > 0 ? Math.max(safeMin, selectedMin) : safeMin
  const initialMax = selectedMax > 0 ? Math.min(safeMax, selectedMax) : safeMax

  const [values, setValues] = useState<[number, number]>([initialMin, initialMax])

  useEffect(() => {
    setValues([initialMin, initialMax])
  }, [initialMin, initialMax])

  const [minValue, maxValue] = values
  const range = Math.max(1, safeMax - safeMin)
  const minPercent = ((minValue - safeMin) / range) * 100
  const maxPercent = ((maxValue - safeMin) / range) * 100
  const label = useMemo(
    () => `₹${minValue.toLocaleString()} — ₹${maxValue.toLocaleString()}`,
    [minValue, maxValue]
  )

  return (
    <div style={{ marginTop: '0.6rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.7rem', whiteSpace: 'nowrap' }}>{label}</div>

      <Range
        min={safeMin}
        max={safeMax}
        step={step}
        values={values}
        onChange={(nextValues) => setValues([nextValues[0], nextValues[1]])}
        renderTrack={({ props, children }) => {
          const trackPropsWithKey = props as typeof props & { key?: string | number }
          const { key: trackKey, ...trackProps } = trackPropsWithKey
          return (
            <div
              key={trackKey}
              {...trackProps}
              style={{
                ...trackProps.style,
                height: '6px',
                width: '100%',
                borderRadius: '999px',
                background: `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${minPercent}%, #2563eb ${minPercent}%, #2563eb ${maxPercent}%, #e5e7eb ${maxPercent}%, #e5e7eb 100%)`,
              }}
            >
              {children}
            </div>
          )
        }}
        renderThumb={({ props, isDragged }) => {
          const thumbPropsWithKey = props as typeof props & { key?: string | number }
          const { key: thumbKey, ...thumbProps } = thumbPropsWithKey
          return (
            <div
              key={thumbKey}
              {...thumbProps}
              style={{
                ...thumbProps.style,
                height: '18px',
                width: '18px',
                borderRadius: '999px',
                backgroundColor: '#fff',
                border: '2px solid #2563eb',
                boxShadow: isDragged ? '0 0 0 6px rgba(37,99,235,0.16)' : 'none',
                outline: 'none',
              }}
            />
          )
        }}
      />

      {/* Submitted with existing filter form */}
      <input type="hidden" name="minPrice" value={minValue} />
      <input type="hidden" name="maxPrice" value={maxValue} />
    </div>
  )
}
