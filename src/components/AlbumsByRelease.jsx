import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function AlbumsByRelease({ decades, years, chartColors }) {
  const [view, setView] = useState('decade')

  const buckets = view === 'decade' ? decades : years
  const empty = !buckets || buckets.length === 0

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <div className="card-title">Albums by Release {view === 'decade' ? 'Decade' : 'Year'}</div>
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${view === 'decade' ? ' active' : ''}`}
            onClick={() => setView('decade')}
          >
            Decade
          </button>
          <button
            className={`view-toggle-btn${view === 'year' ? ' active' : ''}`}
            onClick={() => setView('year')}
          >
            Year
          </button>
        </div>
      </div>

      {empty ? (
        <div className="empty-state">
          <span className="empty-state-icon">📅</span>
          No data
        </div>
      ) : (
        <div className="chart-wrap" style={{ flex: 1, position: 'relative' }}>
          <Bar
            data={{
              labels: buckets.map(b => b.label),
              datasets: [
                {
                  data: buckets.map(b => b.count),
                  backgroundColor: chartColors.bar,
                  hoverBackgroundColor: chartColors.barHover,
                  borderRadius: 4,
                  borderSkipped: false,
                },
              ],
            }}
            options={{
              indexAxis: 'y',
              responsive: true,
              maintainAspectRatio: false,
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
                      return ` ${b.count} tracks · ${fmtDuration(b.duration)}`
                    },
                    afterBody: ctx => {
                      const b = buckets[ctx[0].dataIndex]
                      if (!b.topAlbums || b.topAlbums.length === 0) return []
                      return ['', 'Top albums:', ...b.topAlbums.map(a => `  ${a.name} (${a.count})`)]
                    },
                  },
                },
              },
              scales: {
                x: {
                  grid: { color: chartColors.grid },
                  ticks: { color: chartColors.tick, font: { size: 12 } },
                  border: { color: chartColors.grid },
                },
                y: {
                  grid: { color: chartColors.grid },
                  ticks: { color: chartColors.tick, font: { size: 11 } },
                  border: { color: chartColors.grid },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  )
}
