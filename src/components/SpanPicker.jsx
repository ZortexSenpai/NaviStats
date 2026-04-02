import { useState } from 'react'
import { differenceInCalendarDays, startOfDay, endOfDay } from 'date-fns'

const PRESETS = [
  { label: '1d',  days: 1 },
  { label: '7d',  days: 7 },
  { label: '30d', days: 30 },
  { label: '1y',  days: 365 },
  { label: 'All', days: null },
]

function toInputValue(date) {
  return date.toISOString().slice(0, 10)
}

export default function SpanPicker({ span, onChange }) {
  const today = toInputValue(new Date())
  const [showCustom, setShowCustom] = useState(!!span.startDate)
  const [fromDate, setFromDate] = useState(() =>
    span.startDate ? toInputValue(span.startDate) : toInputValue(new Date(Date.now() - span.days * 86400000))
  )
  const [toDate, setToDate] = useState(() =>
    span.endDate ? toInputValue(span.endDate) : today
  )

  const isCustom = !!span.startDate

  function applyCustom(from, to) {
    if (!from || !to) return
    // Append T00:00:00 so the string is parsed as local midnight, not UTC midnight.
    // Without this, date-only strings are treated as UTC and shift to the previous
    // day in timezones east of UTC.
    const start = startOfDay(new Date(from + 'T00:00:00'))
    const end = endOfDay(new Date(to + 'T00:00:00'))
    if (start > end) return
    const days = Math.max(1, differenceInCalendarDays(end, start) + 1)
    onChange({ days, startDate: start, endDate: end })
  }

  function handleCustomClick() {
    setShowCustom(prev => !prev)
  }

  function handleFrom(e) {
    setFromDate(e.target.value)
  }

  function handleTo(e) {
    setToDate(e.target.value)
  }

  return (
    <div className="span-picker">
      <span className="span-picker-label">Timespan</span>
      {PRESETS.map(p => (
        <button
          key={p.days}
          className={`span-chip${!isCustom && span.days === p.days ? ' active' : ''}`}
          onClick={() => { setShowCustom(false); onChange({ days: p.days, all: p.days === null }) }}
        >
          {p.label}
        </button>
      ))}
      <button
        className={`span-chip${isCustom ? ' active' : ''}`}
        onClick={handleCustomClick}
      >
        Custom
      </button>
      {showCustom && (
        <div className="span-custom">
          <input
            type="date"
            className="span-date-input"
            value={fromDate}
            max={toDate || today}
            onChange={handleFrom}
          />
          <span className="span-date-sep">→</span>
          <input
            type="date"
            className="span-date-input"
            value={toDate}
            min={fromDate}
            max={today}
            onChange={handleTo}
          />
          <button
            className="span-chip active"
            onClick={() => applyCustom(fromDate, toDate)}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  )
}
