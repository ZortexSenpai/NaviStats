import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip)

const COLORS = [
  '#7c6ff7', '#4ecdc4', '#f87171', '#fbbf24', '#60a5fa',
  '#a78bfa', '#2dd4bf', '#fb923c', '#e879f9', '#4ade80',
]

const MAX_SLICES = 8

function fmtHours(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function TopGenres({ genres }) {
  if (!genres || genres.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Top Genres</div>
        <div className="empty-state">
          <span className="empty-state-icon">🎵</span>
          No genre data
        </div>
      </div>
    )
  }

  const top = genres.slice(0, MAX_SLICES)
  const rest = genres.slice(MAX_SLICES)
  const otherCount = rest.reduce((s, g) => s + g.count, 0)
  const otherDuration = rest.reduce((s, g) => s + g.duration, 0)
  const items = otherCount > 0 ? [...top, { name: 'Other', count: otherCount, duration: otherDuration }] : top
  const total = items.reduce((s, g) => s + g.count, 0)

  const chartData = {
    labels: items.map(g => g.name),
    datasets: [
      {
        data: items.map(g => g.count),
        backgroundColor: items.map((_, i) =>
          i < MAX_SLICES ? COLORS[i % COLORS.length] : '#484f58'
        ),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    cutout: '65%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#21262d',
        borderColor: '#30363d',
        borderWidth: 1,
        titleColor: '#8b949e',
        bodyColor: '#e6edf3',
        padding: 10,
        callbacks: {
          label: ctx => {
            const item = items[ctx.dataIndex]
            const pct = Math.round((ctx.raw / total) * 100)
            return ` ${ctx.label}: ${pct}% · ${fmtHours(item.duration)}`
          },
        },
      },
    },
  }

  return (
    <div className="card">
      <div className="card-title">Top Genres</div>
      <div style={{ maxWidth: 220, margin: '0 auto' }}>
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="genre-legend">
        {items.map((g, i) => (
          <div className="genre-legend-item" key={g.name}>
            <span
              className="genre-dot"
              style={{ background: i < MAX_SLICES ? COLORS[i % COLORS.length] : '#484f58' }}
            />
            <span className="genre-name">{g.name}</span>
            <span className="genre-pct">{Math.round((g.count / total) * 100)}%</span>
            <span className="genre-hours">{fmtHours(g.duration)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
