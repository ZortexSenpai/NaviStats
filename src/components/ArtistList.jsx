import { useState } from 'react'
import { artistArtUrl } from '../api/navidrome'
import LimitSelect from './LimitSelect'

function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false)
  if (failed || !src) {
    return <div className="avatar-fallback round">{(name || '?')[0].toUpperCase()}</div>
  }
  return (
    <img
      src={src}
      alt={name}
      className="ranked-avatar round"
      onError={() => setFailed(true)}
    />
  )
}

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h === 0) return `${m}m`
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function ArtistList({ topArtists, auth }) {
  const [limit, setLimit] = useState(10)

  if (!topArtists || topArtists.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Top Artists</div>
        <div className="empty-state">
          <span className="empty-state-icon">🎤</span>
          No data
        </div>
      </div>
    )
  }

  const displayed = topArtists.slice(0, limit)
  const max = displayed[0]?.count || 1

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Top Artists</div>
        <LimitSelect value={limit} onChange={setLimit} />
      </div>
      <div className="ranked-list">
        {displayed.map((artist, i) => (
          <div className="ranked-item" key={artist.id || artist.name}>
            <span className="ranked-num">{i + 1}</span>
            <Avatar
              src={artistArtUrl(auth.serverUrl, auth, artist.id)}
              name={artist.name}
            />
            <div className="ranked-bar-wrap">
              <div className="ranked-name">{artist.name}</div>
              <div className="ranked-sub">{fmtDuration(artist.duration)}</div>
              <div className="ranked-bar-track">
                <div
                  className="ranked-bar-fill"
                  style={{ width: `${(artist.count / max) * 100}%` }}
                />
              </div>
            </div>
            <span className="ranked-count">{artist.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
