import { useState } from 'react'
import { format } from 'date-fns'
import LimitSelect from './LimitSelect'

function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export default function TopSessions({ sessions }) {
  const [limit, setLimit] = useState(10)

  if (!sessions || sessions.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Top Sessions</div>
        <div className="empty-state">
          <span className="empty-state-icon">⏱</span>
          No sessions in this period
        </div>
      </div>
    )
  }

  const displayed = sessions.slice(0, limit)
  const maxDuration = displayed[0].duration

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Top Sessions</div>
          <div className="top-sessions-total">{sessions.length} sessions detected</div>
        </div>
        <LimitSelect value={limit} onChange={setLimit} />
      </div>
      <div className="ranked-list" style={{ marginTop: 12 }}>
        {displayed.map((session, i) => (
          <div className="ranked-item" key={session.start}>
            <span className="ranked-num">{i + 1}</span>
            <div className="ranked-bar-wrap">
              <div className="ranked-name">
                {format(new Date(session.start), 'EEE MMM d, HH:mm')}
              </div>
              <div className="ranked-sub">{session.trackCount} track{session.trackCount !== 1 ? 's' : ''}</div>
              <div className="ranked-bar-track">
                <div
                  className="ranked-bar-fill"
                  style={{ width: `${(session.duration / maxDuration) * 100}%` }}
                />
              </div>
            </div>
            <span className="ranked-count" style={{ minWidth: 52, textAlign: 'right' }}>
              {fmtDuration(session.duration)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
