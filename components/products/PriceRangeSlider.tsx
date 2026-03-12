'use client'

import { useEffect, useMemo, useState } from 'react'

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
  const safeMax = Number.isFinite(maxBound) ? maxBound : 1000
  const gap = Math.max(1, Math.floor((safeMax - safeMin) * 0.02))

  const initialMin = selectedMin > 0 ? Math.max(safeMin, selectedMin) : safeMin
  const initialMax = selectedMax > 0 ? Math.min(safeMax, selectedMax) : safeMax

  const [minValue, setMinValue] = useState(initialMin)
  const [maxValue, setMaxValue] = useState(initialMax)

  useEffect(() => {
    setMinValue(initialMin)
    setMaxValue(initialMax)
  }, [initialMin, initialMax])

  const minPercent = useMemo(
    () => ((minValue - safeMin) / Math.max(1, safeMax - safeMin)) * 100,
    [minValue, safeMin, safeMax]
  )
  const maxPercent = useMemo(
    () => ((maxValue - safeMin) / Math.max(1, safeMax - safeMin)) * 100,
    [maxValue, safeMin, safeMax]
  )

  return (
    <div style={{ marginTop: '0.6rem' }}>
      <div style={{ fontWeight: 600, marginBottom: '0.6rem' }}>
        ₹{minValue.toLocaleString()} — ₹{maxValue.toLocaleString()}
      </div>

      <div style={{ position: 'relative', height: '36px', marginBottom: '0.65rem' }}>
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: 0,
            right: 0,
            height: '6px',
            borderRadius: '999px',
            backgroundColor: '#e5e7eb',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '14px',
            left: `${minPercent}%`,
            width: `${Math.max(0, maxPercent - minPercent)}%`,
            height: '6px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, #2563eb, #1d4ed8)',
          }}
        />

        <input
          type="range"
          min={safeMin}
          max={safeMax}
          value={minValue}
          onChange={(e) => {
            const next = Math.min(Number(e.target.value), maxValue - gap)
            setMinValue(next)
          }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: '100%',
            top: 0,
            pointerEvents: 'auto',
          }}
        />
        <input
          type="range"
          min={safeMin}
          max={safeMax}
          value={maxValue}
          onChange={(e) => {
            const next = Math.max(Number(e.target.value), minValue + gap)
            setMaxValue(next)
          }}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: '100%',
            top: 0,
            pointerEvents: 'auto',
          }}
        />
      </div>

      {/* Submitted with existing filter form */}
      <input type="hidden" name="minPrice" value={minValue} />
      <input type="hidden" name="maxPrice" value={maxValue} />
    </div>
  )
}
