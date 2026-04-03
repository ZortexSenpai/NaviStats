import { useEffect } from 'react'
import { useLibraryStats } from '../hooks/useLibraryStats'
import FormatDistribution from './FormatDistribution'
import UntaggedTracks from './UntaggedTracks'
import { useThemeContext } from '../ThemeContext'

export default function LibraryPage({ auth }) {
  const { data, loading, error, load } = useLibraryStats(auth)
  const theme = useThemeContext()

  useEffect(() => { load() }, [load])

  return (
    <main className="main-content">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Scanning your library…</span>
        </div>
      )}

      {error && !loading && (
        <div className="error-card">
          <strong>Could not load data</strong>
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={load}>Try again</button>
        </div>
      )}

      {data && (
        <div className="stats-grid">
          <div className="col-12">
            <FormatDistribution data={data} chartColors={theme.chart} />
          </div>
          <div className="col-12">
            <UntaggedTracks data={data} />
          </div>
        </div>
      )}
    </main>
  )
}
