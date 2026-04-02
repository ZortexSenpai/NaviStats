import { useState, useCallback } from 'react'
import { fetchSongsInRange } from '../api/navidrome'

function inTZ(date, tz) {
  if (!tz) return date
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  }).formatToParts(date)
  const get = type => parseInt(parts.find(p => p.type === type).value)
  return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
}

function processSpecial(songs, timezone) {
  if (!songs.length) return { onThisDay: [], artistLoyalty: [] }

  const now = inTZ(new Date(), timezone)
  const todayMonth = now.getMonth()
  const todayDay = now.getDate()
  const todayYear = now.getFullYear()

  // ── On This Day ─────────────────────────────────────────────────
  const onThisDay = [1, 2, 3].map(yearsAgo => {
    const targetYear = todayYear - yearsAgo
    const tracks = songs.filter(s => {
      const d = inTZ(new Date(s.playDate), timezone)
      return d.getFullYear() === targetYear && d.getMonth() === todayMonth && d.getDate() === todayDay
    })
    return {
      yearsAgo,
      year: targetYear,
      tracks: tracks.map(s => ({
        id: s.id,
        title: s.title || 'Unknown',
        artist: s.artist || 'Unknown',
        album: s.album || '',
        albumId: s.albumId,
        duration: s.duration || 0,
      })),
    }
  }).filter(d => d.tracks.length > 0)

  // ── Artist Loyalty ───────────────────────────────────────────────
  const validSongs = songs.filter(s => new Date(s.playDate).getFullYear() > 1970)
  if (validSongs.length === 0) return { onThisDay, artistLoyalty: [] }

  let minTime = Infinity, maxTime = -Infinity
  validSongs.forEach(s => {
    const t = new Date(s.playDate).getTime()
    if (t < minTime) minTime = t
    if (t > maxTime) maxTime = t
  })

  const minDate = inTZ(new Date(minTime), timezone)
  const maxDate = inTZ(new Date(maxTime), timezone)
  const totalMonths =
    (maxDate.getFullYear() - minDate.getFullYear()) * 12 +
    (maxDate.getMonth() - minDate.getMonth()) + 1

  const artistMap = {}
  validSongs.forEach(s => {
    const isMulti = (s.artist || '').includes(' • ')
    const albumArtistIsVarious = /^various artists$/i.test((s.albumArtist || '').trim())
    let name, id
    if (!isMulti) {
      name = s.artist || 'Unknown'
      id = s.artistId || null
    } else if (s.albumArtist && !albumArtistIsVarious) {
      name = s.albumArtist
      id = s.albumArtistId || s.artistId || null
    } else {
      name = (s.artist || '').split(' • ')[0].trim() || 'Unknown'
      id = null
    }
    const key = id || name
    if (!artistMap[key]) artistMap[key] = { name, id, months: new Set(), count: 0 }
    const d = inTZ(new Date(s.playDate), timezone)
    artistMap[key].months.add(`${d.getFullYear()}-${d.getMonth()}`)
    artistMap[key].count++
  })

  const artistLoyalty = Object.values(artistMap)
    .filter(a => a.count >= 5)
    .map(a => ({
      name: a.name,
      id: a.id,
      monthsActive: a.months.size,
      totalMonths,
      score: Math.round((a.months.size / totalMonths) * 100),
      playCount: a.count,
    }))
    .sort((a, b) => b.score - a.score || b.playCount - a.playCount)
    .slice(0, 100)

  return { onThisDay, artistLoyalty }
}

export function useSpecialStats(auth, timezone = null) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!auth) return
    setData(null)
    setLoading(true)
    setError(null)
    try {
      const songs = await fetchSongsInRange(auth.serverUrl, auth.token, new Date(0))
      setData(processSpecial(songs, timezone))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [auth, timezone])

  return { data, loading, error, load }
}
