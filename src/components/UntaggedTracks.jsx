import { useState } from 'react'

const FILTERS = [
  { key: 'all',   label: 'All issues' },
  { key: 'genre', label: 'Genre' },
  { key: 'year',  label: 'Year' },
  { key: 'gain',  label: 'Gain' },
]

const LIMIT = 50

export default function UntaggedTracks({ data }) {
  const [filter, setFilter] = useState('all')
  const [showAll, setShowAll] = useState(false)

  const { untagged, total } = data

  const missingGenreCount = untagged.filter(t => t.missingGenre).length
  const missingYearCount  = untagged.filter(t => t.missingYear).length
  const missingGainCount  = untagged.filter(t => t.missingGain).length

  const filtered =
    filter === 'genre' ? untagged.filter(t => t.missingGenre) :
    filter === 'year'  ? untagged.filter(t => t.missingYear)  :
    filter === 'gain'  ? untagged.filter(t => t.missingGain)  :
    untagged

  const visible = showAll ? filtered : filtered.slice(0, LIMIT)

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Untagged / Poorly Tagged</div>
          <div className="top-sessions-total">
            {untagged.length.toLocaleString()} of {total.toLocaleString()} tracks have missing tags
          </div>
        </div>
        <div className="view-toggle">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`view-toggle-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => { setFilter(f.key); setShowAll(false) }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="untagged-summary">
        <span className="untagged-badge">Missing genre <strong>{missingGenreCount.toLocaleString()}</strong></span>
        <span className="untagged-badge">Missing year <strong>{missingYearCount.toLocaleString()}</strong></span>
        <span className="untagged-badge">Missing gain <strong>{missingGainCount.toLocaleString()}</strong></span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 16 }}>
          <span className="empty-state-icon">✓</span>
          No issues in this category
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
                  {t.missingGenre && <span className="tag-badge tag-genre">genre</span>}
                  {t.missingYear  && <span className="tag-badge tag-year">year</span>}
                  {t.missingGain  && <span className="tag-badge tag-gain">gain</span>}
                </div>
              </div>
            ))}
          </div>
          {!showAll && filtered.length > LIMIT && (
            <button
              className="btn btn-ghost"
              style={{ marginTop: 12, width: '100%' }}
              onClick={() => setShowAll(true)}
            >
              Show all {filtered.length.toLocaleString()} tracks
            </button>
          )}
        </>
      )}
    </div>
  )
}
