import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

export default function FormatDistribution({ data, chartColors }) {
  const { formats, total } = data

  if (!formats.length) {
    return (
      <div className="card">
        <div className="card-title">Format Distribution</div>
        <div className="empty-state">
          <span className="empty-state-icon">💿</span>
          No data
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Format Distribution</div>
          <div className="top-sessions-total">{total.toLocaleString()} tracks in library</div>
        </div>
      </div>

      <div className="chart-wrap" style={{ height: Math.max(100, formats.length * 38 + 16), position: 'relative' }}>
        <Bar
          data={{
            labels: formats.map(f => f.format),
            datasets: [{
              data: formats.map(f => f.count),
              backgroundColor: chartColors.bar,
              hoverBackgroundColor: chartColors.barHover,
              borderRadius: 4,
            }],
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
                    const f = formats[ctx.dataIndex]
                    const pct = ((f.count / total) * 100).toFixed(1)
                    const br = f.avgBitrate ? ` · avg ${f.avgBitrate} kbps` : ''
                    return ` ${f.count.toLocaleString()} tracks (${pct}%)${br}`
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { color: chartColors.grid },
                ticks: { color: chartColors.tick, font: { size: 11 } },
                border: { color: chartColors.grid },
                beginAtZero: true,
              },
              y: {
                grid: { color: chartColors.grid },
                ticks: { color: chartColors.tick, font: { size: 13, weight: '600' } },
                border: { color: chartColors.grid },
              },
            },
          }}
        />
      </div>

      <table className="format-table">
        <thead>
          <tr>
            <th>Format</th>
            <th>Tracks</th>
            <th>Share</th>
            <th>Avg Bitrate</th>
          </tr>
        </thead>
        <tbody>
          {formats.map(f => (
            <tr key={f.format}>
              <td><span className="format-badge">{f.format}</span></td>
              <td>{f.count.toLocaleString()}</td>
              <td>{((f.count / total) * 100).toFixed(1)}%</td>
              <td>{f.avgBitrate ? `${f.avgBitrate} kbps` : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
