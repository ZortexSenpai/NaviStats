import { useState } from 'react'
import LimitSelect from './LimitSelect'
import { artistArtUrl } from '../api/navidrome'

export default function ArtistLoyalty({ data, auth }) {
  const [limit, setLimit] = useState(10)

  if (!data || data.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Artist Loyalty Score</div>
        <div className="empty-state">
          <span className="empty-state-icon">🎤</span>
          Not enough data — requires at least 5 plays per artist across multiple months
        </div>
      </div>
    )
  }

  const displayed = data.slice(0, limit)

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Artist Loyalty Score</div>
          <div className="top-sessions-total">How consistently you return each month · {data[0]?.totalMonths} months of history</div>
        </div>
        <LimitSelect value={limit} onChange={setLimit} />
      </div>
      <div className="ranked-list" style={{ marginTop: 12 }}>
        {displayed.map((a, i) => {
          const art = artistArtUrl(auth.serverUrl, auth, a.id, 40)
          return (
            <div className="ranked-item" key={a.name}>
              <span className="ranked-num">{i + 1}</span>
              {art
                ? <img src={art} className="ranked-avatar round" alt="" />
                : (
                  <div className="ranked-avatar round" style={{
                    background: 'var(--accent-muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, color: 'var(--accent)',
                  }}>♪</div>
                )
              }
              <div className="ranked-bar-wrap">
                <div className="ranked-name">{a.name}</div>
                <div className="ranked-sub">{a.monthsActive} / {a.totalMonths} months · {a.playCount} plays</div>
                <div className="ranked-bar-track">
                  <div className="ranked-bar-fill" style={{ width: `${a.score}%` }} />
                </div>
              </div>
              <span className="ranked-count" style={{ minWidth: 40, textAlign: 'right' }}>{a.score}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
