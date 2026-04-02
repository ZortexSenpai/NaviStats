import { useState } from 'react'
import { coverArtUrl } from '../api/navidrome'
import LimitSelect from './LimitSelect'

function Thumb({ src, title }) {
  const [failed, setFailed] = useState(false)
  if (failed || !src) {
    return <div className="track-thumb-fallback">♪</div>
  }
  return (
    <img
      src={src}
      alt={title}
      className="track-thumb"
      onError={() => setFailed(true)}
    />
  )
}

function fmtDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function TopTracks({ topTracks, auth }) {
  const [limit, setLimit] = useState(10)

  if (!topTracks || topTracks.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Top Tracks</div>
        <div className="empty-state">
          <span className="empty-state-icon">🎵</span>
          No data
        </div>
      </div>
    )
  }

  const displayed = topTracks.slice(0, limit)
  const max = displayed[0]?.playCount || 1

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Top Tracks</div>
        <LimitSelect value={limit} onChange={setLimit} />
      </div>
      <div className="track-list">
        {displayed.map((track, i) => (
          <div className="track-item" key={`${track.id}-${i}`}>
            <span className="ranked-num" style={{ minWidth: 18 }}>{i + 1}</span>
            <Thumb
              src={coverArtUrl(auth.serverUrl, auth, track.albumId, 48)}
              title={track.title}
            />
            <div className="track-info">
              <span className="track-title">{track.title}</span>
              <span className="track-meta">{track.artist}{track.album ? ` · ${track.album}` : ''}</span>
              <div className="ranked-bar-track" style={{ marginTop: 4 }}>
                <div
                  className="ranked-bar-fill"
                  style={{ width: `${(track.playCount / max) * 100}%`, background: 'var(--accent)' }}
                />
              </div>
            </div>
            <div className="track-right">
              <span className="track-play-count">{track.playCount} plays</span>
              <span className="track-duration">{fmtDuration(track.duration)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
