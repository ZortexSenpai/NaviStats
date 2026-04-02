import { useState, useEffect, useRef } from 'react'
import SpanPicker from './SpanPicker'
import RecentlyListened from './RecentlyListened'
import Timeline from './Timeline'
import TopGenres from './TopGenres'
import ArtistList from './ArtistList'
import AlbumList from './AlbumList'
import RecentTracks from './RecentTracks'
import TopTracks from './TopTracks'
import TopDecades from './TopDecades'
import ThemeSelector from './ThemeSelector'
import TopSessions from './TopSessions'
import AlbumsByRelease from './AlbumsByRelease'
import { useStats } from '../hooks/useStats'
import { useConfig } from '../hooks/useConfig'
import { useThemeContext } from '../ThemeContext'

export default function Dashboard({ auth, onLogout, themes, themeId, onThemeChange }) {
  const config = useConfig()
  const [span, setSpan] = useState(null)
  const configApplied = useRef(false)
  useEffect(() => {
    if (config.loaded && !configApplied.current) {
      configApplied.current = true
      setSpan({ days: config.defaultTimespan || 30 })
    }
  }, [config.loaded])
  const { data, loading, error, refetch } = useStats(auth, span, config.genreGroups, config.timezone, config.recentTracksGenreGrouping)
  const theme = useThemeContext()

  useEffect(() => {
    const interval = config.recentTracksRefreshInterval
    if (!interval || interval <= 0) return
    const id = setInterval(refetch, interval * 1000)
    return () => clearInterval(id)
  }, [config.recentTracksRefreshInterval, refetch])

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-logo">
          <div className="header-logo-icon">♪</div>
          Navi<span>Stats</span>
        </div>
        <div className="header-right">
          <span className="header-user">
            Logged in as <strong>{auth.name || auth.username}</strong>
          </span>
          <ThemeSelector themes={themes} themeId={themeId} onSelect={onThemeChange} />
          <button className="btn btn-ghost" onClick={onLogout} style={{ padding: '6px 14px', fontSize: 13 }}>
            Logout
          </button>
        </div>
      </header>

      <main className="main-content">
        {span && <SpanPicker span={span} onChange={setSpan} />}

        {loading && !data && (
          <div className="loading-overlay">
            <div className="spinner" />
            <span>Fetching your listening data…</span>
          </div>
        )}

        {error && !loading && (
          <div className="error-card">
            <strong>Could not load data</strong>
            <p>{error}</p>
            <button className="btn btn-ghost" onClick={refetch}>Try again</button>
          </div>
        )}

        {data && (
          <div className="stats-grid">
            <div className="col-6">
              <RecentlyListened data={data} />
            </div>
            <div className="col-6">
              <div className="card" style={{ height: '100%' }}>
                <div className="card-title">Unique Tracks</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
                  <span className="stat-value">{data.songCount.toLocaleString()}</span>
                </div>
                <div className="stat-sub">
                  {data.topArtists.length > 0
                    ? `across ${data.topArtists.length}+ artists`
                    : 'No tracks in this period'}
                </div>
              </div>
            </div>

            <div className="col-12">
              <Timeline topTimes={data.topTimes} chartColors={theme.chart} />
            </div>

            <div className="col-6">
              <TopGenres genres={data.genres} />
            </div>
            <div className="col-6">
              <TopDecades decades={data.decades} chartColors={theme.chart} />
            </div>

            <div className="col-12">
              <AlbumsByRelease decades={data.decades} years={data.years} chartColors={theme.chart} />
            </div>

            <div className="col-6">
              <ArtistList topArtists={data.topArtists} auth={auth} />
            </div>
            <div className="col-6">
              <AlbumList topAlbums={data.topAlbums} auth={auth} />
            </div>

            <div className="col-6">
              <TopTracks topTracks={data.topTracks} auth={auth} />
            </div>
            <div className="col-6">
              <RecentTracks recentTracks={data.recentTracks} auth={auth} />
            </div>

            <div className="col-12">
              <TopSessions sessions={data.sessions} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
