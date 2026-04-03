import { useState } from 'react'

const LIMIT = 50

export default function LowQualityTracks({ data, threshold }) {
  const [showAll, setShowAll] = useState(false)

  const { lowQuality, total } = data
  const visible = showAll ? lowQuality : lowQuality.slice(0, LIMIT)

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Low Quality Tracks</div>
          <div className="top-sessions-total">
            Lossy files below {threshold} kbps · {lowQuality.length.toLocaleString()} of {total.toLocaleString()} tracks
          </div>
        </div>
      </div>

      {lowQuality.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">✓</span>
          No lossy tracks below {threshold} kbps
        </div>
      ) : (
        <>
          <div className="untagged-list">
            {visible.map(t => (
              <div key={t.id} className="untagged-row">
                <div className="untagged-track-info">
                  <span className="untagged-title">{t.title}</span>
                  <span className="untagged-artist">{t.artist}{t.album ? ` · ${t.album}` : ''}</span>
                </div>
                <div className="untagged-tags">
                  <span className="format-badge">{t.format}</span>
                  <span className="tag-badge tag-year">{t.bitRate} kbps</span>
                </div>
              </div>
            ))}
          </div>
          {!showAll && lowQuality.length > LIMIT && (
            <button
              className="btn btn-ghost"
              style={{ marginTop: 12, width: '100%' }}
              onClick={() => setShowAll(true)}
            >
              Show all {lowQuality.length.toLocaleString()} tracks
            </button>
          )}
        </>
      )}
    </div>
  )
}
