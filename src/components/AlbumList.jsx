import { useState } from 'react'
import { coverArtUrl } from '../api/navidrome'
import LimitSelect from './LimitSelect'

function Avatar({ src, name }) {
  const [failed, setFailed] = useState(false)
  if (failed || !src) {
    return <div className="avatar-fallback">{(name || '?')[0].toUpperCase()}</div>
  }
  return (
    <img
      src={src}
      alt={name}
      className="ranked-avatar"
      onError={() => setFailed(true)}
    />
  )
}

export default function AlbumList({ topAlbums, auth }) {
  const [limit, setLimit] = useState(10)

  if (!topAlbums || topAlbums.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Top Albums</div>
        <div className="empty-state">
          <span className="empty-state-icon">💿</span>
          No data
        </div>
      </div>
    )
  }

  const displayed = topAlbums.slice(0, limit)
  const max = displayed[0]?.count || 1

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">Top Albums</div>
        <LimitSelect value={limit} onChange={setLimit} />
      </div>
      <div className="ranked-list">
        {displayed.map((album, i) => (
          <div className="ranked-item" key={album.id || album.name}>
            <span className="ranked-num">{i + 1}</span>
            <Avatar
              src={coverArtUrl(auth.serverUrl, auth, album.id)}
              name={album.name}
            />
            <div className="ranked-bar-wrap">
              <div className="ranked-name">{album.name}</div>
              <div className="ranked-sub">{album.artist}</div>
              <div className="ranked-bar-track">
                <div
                  className="ranked-bar-fill"
                  style={{ width: `${(album.count / max) * 100}%`, background: 'var(--accent)' }}
                />
              </div>
            </div>
            <span className="ranked-count">{album.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
