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

export default function TopDecades({ decades, chartColors }) {
  if (!decades || decades.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Top Decades</div>
        <div className="empty-state">
          <span className="empty-state-icon">📅</span>
          No data
        </div>
      </div>
    )
  }

  const c = chartColors

  const data = {
    labels: decades.map(d => d.label),
    datasets: [
      {
        data: decades.map(d => d.count),
        backgroundColor: c.bar,
        hoverBackgroundColor: c.barHover,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        borderWidth: 1,
        titleColor: c.tooltipTitle,
        bodyColor: c.tooltipBody,
        padding: 10,
        callbacks: {
          label: ctx => {
            const d = decades[ctx.dataIndex]
            return ` ${d.count} tracks · ${fmtDuration(d.duration)}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: c.grid },
        ticks: { color: c.tick, font: { size: 12 } },
        border: { color: c.grid },
      },
      y: {
        grid: { color: c.grid },
        ticks: { color: c.tick, font: { size: 11 } },
        border: { color: c.grid },
      },
    },
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-title">Top Decades</div>
      <div className="chart-wrap" style={{ flex: 1, position: 'relative' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
