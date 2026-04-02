import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

const INTERVALS = [
  { key: 'day',   label: 'Day',   subtitle: 'Last 6 months by day' },
  { key: 'week',  label: 'Week',  subtitle: 'Last year by week' },
  { key: 'month', label: 'Month', subtitle: 'Last 3 years by month' },
  { key: 'year',  label: 'Year',  subtitle: 'All time by year' },
]

// Replace the alpha value in an rgba() string
function withAlpha(rgba, alpha) {
  return rgba.replace(/[\d.]+\)$/, `${alpha})`)
}

export default function ListeningPace({ pace, chartColors }) {
  const [interval, setInterval] = useState('month')

  const current = INTERVALS.find(i => i.key === interval)
  const buckets = pace?.[interval] ?? []
  const hasData = buckets.some(b => b.count > 0)

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div>
          <div className="card-title">Listening Pace</div>
          <div className="top-sessions-total">{current.subtitle}</div>
        </div>
        <div className="view-toggle">
          {INTERVALS.map(iv => (
            <button
              key={iv.key}
              className={`view-toggle-btn${interval === iv.key ? ' active' : ''}`}
              onClick={() => setInterval(iv.key)}
            >
              {iv.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="empty-state">
          <span className="empty-state-icon">📈</span>
          No data for this interval
        </div>
      ) : (
        <div className="chart-wrap" style={{ flex: 1, minHeight: 220, position: 'relative' }}>
          <Line
            data={{
              labels: buckets.map(b => b.label),
              datasets: [{
                data: buckets.map(b => b.count),
                borderColor: withAlpha(chartColors.bar, 0.9),
                backgroundColor: withAlpha(chartColors.bar, 0.12),
                fill: true,
                tension: 0.35,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: chartColors.barHover,
                borderWidth: 2,
              }],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { display: false },
                tooltip: {
                  backgroundColor: chartColors.tooltipBg,
                  borderColor: chartColors.tooltipBorder,
                  borderWidth: 1,
                  titleColor: chartColors.tooltipTitle,
                  bodyColor: chartColors.tooltipBody,
                  padding: 10,
                  callbacks: {
                    label: ctx => {
                      const b = buckets[ctx.dataIndex]
                      const mins = Math.round(b.duration / 60)
                      return ` ${b.count} track${b.count !== 1 ? 's' : ''} · ${mins} min`
                    },
                  },
                },
              },
              scales: {
                x: {
                  grid: { color: chartColors.grid },
                  ticks: {
                    color: chartColors.tick,
                    font: { size: 11 },
                    maxTicksLimit: interval === 'day' ? 10 : interval === 'week' ? 13 : undefined,
                    maxRotation: 0,
                  },
                  border: { color: chartColors.grid },
                },
                y: {
                  grid: { color: chartColors.grid },
                  ticks: { color: chartColors.tick, font: { size: 11 } },
                  border: { color: chartColors.grid },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      )}
    </div>
  )
}
