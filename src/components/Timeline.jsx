import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend, Filler)

const GENRE_COLORS = [
  '#7c6ff7', '#4ecdc4', '#f87171', '#fbbf24', '#60a5fa',
  '#a78bfa', '#2dd4bf', '#fb923c', '#e879f9', '#4ade80',
]
const MAX_GENRES = 9

function fmtMins(mins) {
  if (mins < 60) return `${mins} min`
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

function buildGenreDatasets(topTimes) {
  // Collect all genres sorted by total duration
  const totals = {}
  topTimes.forEach(b => {
    Object.entries(b.genres || {}).forEach(([name, dur]) => {
      totals[name] = (totals[name] || 0) + dur
    })
  })
  const sorted = Object.keys(totals).sort((a, b) => totals[b] - totals[a])
  const top = sorted.slice(0, MAX_GENRES)
  const otherNames = new Set(sorted.slice(MAX_GENRES))

  const datasets = top.map((genre, i) => ({
    label: genre,
    data: topTimes.map(b => Math.round((b.genres?.[genre] || 0) / 60)),
    backgroundColor: GENRE_COLORS[i % GENRE_COLORS.length],
    stack: 'genres',
    borderWidth: 0,
  }))

  if (otherNames.size > 0) {
    datasets.push({
      label: 'Other',
      data: topTimes.map(b =>
        Math.round(
          Object.entries(b.genres || {})
            .filter(([name]) => otherNames.has(name))
            .reduce((sum, [, dur]) => sum + dur, 0) / 60
        )
      ),
      backgroundColor: '#484f58',
      stack: 'genres',
      borderWidth: 0,
    })
  }

  return datasets
}

export default function Timeline({ topTimes, chartColors }) {
  const [view, setView] = useState('songs')

  if (!topTimes || topTimes.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Timeline</div>
        <div className="empty-state">
          <span className="empty-state-icon">📊</span>
          No listening data for this period
        </div>
      </div>
    )
  }

  const c = chartColors
  const isGenres = view === 'genres'

  const songsData = {
    labels: topTimes.map(t => t.label),
    datasets: [
      {
        data: topTimes.map(t => Math.round(t.duration / 60)),
        backgroundColor: c.bar,
        hoverBackgroundColor: c.barHover,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const genreDatasets = buildGenreDatasets(topTimes)
  const genresData = {
    labels: topTimes.map(t => t.label),
    datasets: genreDatasets,
  }

  const baseScales = {
    x: {
      grid: { color: c.grid },
      ticks: { color: c.tick, font: { size: 11 } },
      border: { color: c.grid },
      stacked: isGenres,
    },
    y: {
      grid: { color: c.grid },
      ticks: {
        color: c.tick,
        font: { size: 11 },
        callback: v => v < 60 ? `${v}m` : `${Math.floor(v / 60)}h`,
      },
      border: { color: c.grid },
      stacked: isGenres,
    },
  }

  const songsOptions = {
    responsive: true,
    maintainAspectRatio: true,
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
            const count = topTimes[ctx.dataIndex].count
            return ` ${fmtMins(ctx.raw)} · ${count} tracks`
          },
        },
      },
    },
    scales: baseScales,
  }

  const genresOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          color: c.tick,
          boxWidth: 12,
          padding: 10,
          font: { size: 11 },
        },
      },
      tooltip: {
        backgroundColor: c.tooltipBg,
        borderColor: c.tooltipBorder,
        borderWidth: 1,
        titleColor: c.tooltipTitle,
        bodyColor: c.tooltipBody,
        padding: 10,
        filter: item => item.raw > 0,
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${fmtMins(ctx.raw)}`,
        },
      },
    },
    scales: baseScales,
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Timeline</div>
        <div className="timeline-toggle">
          <button
            className={`span-chip${!isGenres ? ' active' : ''}`}
            onClick={() => setView('songs')}
          >
            Songs
          </button>
          <button
            className={`span-chip${isGenres ? ' active' : ''}`}
            onClick={() => setView('genres')}
          >
            Genres
          </button>
        </div>
      </div>
      <div className="chart-wrap">
        <Bar
          data={isGenres ? genresData : songsData}
          options={isGenres ? genresOptions : songsOptions}
        />
      </div>
    </div>
  )
}
