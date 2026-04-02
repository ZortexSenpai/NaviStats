import { format } from 'date-fns'
import { coverArtUrl } from '../api/navidrome'

function fmtDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function OnThisDay({ data, auth }) {
  const dateLabel = format(new Date(), 'MMMM d')

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">On This Day</div>
          <div className="top-sessions-total">{dateLabel} in previous years</div>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📅</span>
          Nothing played on this day in previous years
        </div>
      ) : (
        <div className="otd-years">
          {data.map(({ yearsAgo, year, tracks }) => (
            <div key={yearsAgo} className="otd-year">
              <div className="otd-year-header">
                <span className="otd-year-label">{year}</span>
                <span className="otd-year-ago">{yearsAgo} year{yearsAgo !== 1 ? 's' : ''} ago</span>
                <span className="otd-year-count">{tracks.length} track{tracks.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="track-list">
                {tracks.slice(0, 10).map((t, i) => {
                  const art = coverArtUrl(auth.serverUrl, auth, t.albumId, 40)
                  return (
                    <div key={`${t.id}-${i}`} className="track-item">
                      {art
                        ? <img src={art} className="track-thumb" alt="" />
                        : <div className="track-thumb-fallback">♪</div>
                      }
                      <div className="track-info">
                        <div className="track-title">{t.title}</div>
                        <div className="track-meta">{t.artist}</div>
                      </div>
                      <span className="track-duration">{fmtDuration(t.duration)}</span>
                    </div>
                  )
                })}
                {tracks.length > 10 && (
                  <div className="otd-more">+{tracks.length - 10} more tracks</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
