const ZERO_DATE = '0001-01-01T00:00:00Z'
const PAGE_SIZE = 500

export async function login(serverUrl, username, password) {
  const base = serverUrl.replace(/\/$/, '')
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(res.status === 401 ? 'Invalid username or password.' : `Login failed: ${text}`)
  }
  return res.json()
}

export async function fetchSongsInRange(serverUrl, token, startDate) {
  const base = serverUrl.replace(/\/$/, '')
  const headers = { 'X-Nd-Authorization': `Bearer ${token}` }
  const songs = []
  let offset = 0

  while (true) {
    const url = `${base}/api/song?_sort=playDate&_order=DESC&_start=${offset}&_end=${offset + PAGE_SIZE}`
    const res = await fetch(url, { headers })

    if (res.status === 401) throw new Error('Session expired. Please log in again.')
    if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)

    const page = await res.json()
    if (!Array.isArray(page) || page.length === 0) break

    let reachedEnd = false
    for (const song of page) {
      if (!song.playDate || song.playDate === ZERO_DATE) {
        reachedEnd = true
        break
      }
      const pd = new Date(song.playDate)
      if (pd < startDate) {
        reachedEnd = true
        break
      }
      songs.push(song)
    }

    if (reachedEnd || page.length < PAGE_SIZE) break
    offset += PAGE_SIZE
  }

  return songs
}

export async function fetchTopTracks(serverUrl, token, limit = 10) {
  const base = serverUrl.replace(/\/$/, '')
  const res = await fetch(
    `${base}/api/song?_sort=playCount&_order=DESC&_start=0&_end=${limit}`,
    { headers: { 'X-Nd-Authorization': `Bearer ${token}` } }
  )
  if (res.status === 401) throw new Error('Session expired. Please log in again.')
  if (!res.ok) throw new Error(`API error ${res.status}: ${res.statusText}`)
  return res.json()
}

// Build a Subsonic cover art URL usable directly in <img src="...">
// Works for album art (pass albumId) or artist art (pass artistId with ar- prefix).
export function coverArtUrl(serverUrl, auth, id, size = 48) {
  if (!id || !auth?.subsonicToken) return null
  const base = serverUrl.replace(/\/$/, '')
  return (
    `${base}/rest/getCoverArt.view` +
    `?u=${encodeURIComponent(auth.username)}` +
    `&t=${auth.subsonicToken}` +
    `&s=${auth.subsonicSalt}` +
    `&v=1.4.0&c=navistats` +
    `&id=${id}&size=${size}`
  )
}

export function artistArtUrl(serverUrl, auth, artistId, size = 48) {
  if (!artistId || !auth?.subsonicToken) return null
  return coverArtUrl(serverUrl, auth, `ar-${artistId}`, size)
}
