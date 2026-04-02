function formatDuration(seconds) {
  if (seconds < 60) return { value: Math.round(seconds), unit: 'sec' }
  const mins = Math.floor(seconds / 60)
  if (mins < 60) return { value: mins, unit: 'min' }
  const hours = Math.floor(mins / 60)
  const remainMins = mins % 60
  return { value: hours, unit: 'h', sub: remainMins ? `${remainMins} min` : null }
}

export default function RecentlyListened({ data }) {
  const { value, unit, sub } = formatDuration(data.totalDuration)

  return (
    <div className="card">
      <div className="card-title">Total Listening Time</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
        <span className="stat-value">{value.toLocaleString()}</span>
        <span className="stat-unit">{unit}</span>
        {sub && <span className="stat-unit">{sub}</span>}
      </div>
      <div className="stat-sub">{data.songCount.toLocaleString()} tracks played</div>
    </div>
  )
}
