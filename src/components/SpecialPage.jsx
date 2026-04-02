import { useEffect } from 'react'
import { useSpecialStats } from '../hooks/useSpecialStats'
import OnThisDay from './OnThisDay'
import ArtistLoyalty from './ArtistLoyalty'

export default function SpecialPage({ auth, config }) {
  const { data, loading, error, load } = useSpecialStats(auth, config.timezone)

  useEffect(() => { load() }, [load])

  return (
    <main className="main-content">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Loading your complete listening history…</span>
        </div>
      )}

      {error && !loading && (
        <div className="error-card">
          <strong>Could not load data</strong>
          <p>{error}</p>
          <button className="btn btn-ghost" onClick={load}>Try again</button>
        </div>
      )}

      {data && (
        <div className="stats-grid">
          <div className="col-12">
            <OnThisDay data={data.onThisDay} auth={auth} />
          </div>
          <div className="col-12">
            <ArtistLoyalty data={data.artistLoyalty} auth={auth} />
          </div>
        </div>
      )}
    </main>
  )
}
