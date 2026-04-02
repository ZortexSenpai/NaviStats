const LIMITS = [5, 10, 25, 50, 100]

export default function LimitSelect({ value, onChange }) {
  return (
    <select
      className="limit-select"
      value={value}
      onChange={e => onChange(Number(e.target.value))}
    >
      {LIMITS.map(l => (
        <option key={l} value={l}>{l}</option>
      ))}
    </select>
  )
}
