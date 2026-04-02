import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
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

export default function RecentTracks({ recentTracks, auth }) {
  const [limit, setLimit] = useState(10)

  if (!recentTracks || recentTracks.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Recent Tracks</div>
        <div className="empty-state">
          <span className="empty-state-icon">🎶</span>
          No recent tracks
        </div>
      </div>
    )
  }

  const displayed = recentTracks.slice(0, limit)

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Recent Tracks</div>
        <LimitSelect value={limit} onChange={setLimit} />
      </div>
      <div className="track-list">
        {displayed.map((track, i) => (
          <div className="track-item" key={`${track.id}-${i}`}>
            <Thumb
              src={coverArtUrl(auth.serverUrl, auth, track.albumId, 48)}
              title={track.title}
            />
            <div className="track-info">
              <span className="track-title">{track.title}</span>
              <span className="track-meta">{track.artist}{track.album ? ` · ${track.album}` : ''}</span>
              {track.genres && track.genres.length > 0 && (
                <div className="track-genres">
                  {track.genres.map(g => (
                    <span className="track-genre-tag" key={g}>{g}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="track-right">
              <span className="track-duration">{fmtDuration(track.duration)}</span>
              <span className="track-ago">
                {formatDistanceToNow(new Date(track.playDate), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
