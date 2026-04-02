import { useState } from 'react'
import { login } from '../api/navidrome'

export default function Login({ onLogin }) {
  const [serverUrl, setServerUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const url = serverUrl.trim().replace(/\/$/, '')
      const data = await login(url, username, password)
      onLogin({
        serverUrl: url,
        token: data.token,
        username: data.username,
        name: data.name,
        subsonicToken: data.subsonicToken,
        subsonicSalt: data.subsonicSalt,
      })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">♪</div>
          <div className="login-logo-text">Navi<span>Stats</span></div>
        </div>
        <p className="login-subtitle">Connect to your Navidrome server to see your listening habits.</p>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Server URL</label>
            <input
              className="form-input"
              type="url"
              placeholder="http://localhost:4533"
              value={serverUrl}
              onChange={e => setServerUrl(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              className="form-input"
              type="text"
              placeholder="admin"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Connecting…' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  )
}
