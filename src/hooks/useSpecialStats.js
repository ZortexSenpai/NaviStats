import { useState, useCallback } from 'react'
import { format, startOfWeek } from 'date-fns'
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
  const emptyPace = { day: [], week: [], month: [], year: [] }
  if (!songs.length) return { onThisDay: [], artistLoyalty: [], pace: emptyPace }

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
  if (validSongs.length === 0) return { onThisDay, artistLoyalty: [], pace: emptyPace }

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

  // ── Listening Pace ───────────────────────────────────────────────
  // Use calendar arithmetic (new Date(y, m, d ± n)) throughout so that DST
  // transitions never push a bucket's date components off by one day.
  const realNow = new Date()
  const todayTZ = inTZ(realNow, timezone)
  const ty = todayTZ.getFullYear()
  const tm = todayTZ.getMonth()
  const td = todayTZ.getDate()

  // Day: last 180 days (6 months), one bucket per day
  const DAY_COUNT = 180
  const dayBuckets = []
  for (let i = DAY_COUNT - 1; i >= 0; i--) {
    const d = new Date(ty, tm, td - i)
    dayBuckets.push({ key: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`, label: format(d, 'MMM d'), count: 0, duration: 0 })
  }
  const dayMap = Object.fromEntries(dayBuckets.map(b => [b.key, b]))
  const dayStartMs = new Date(ty, tm, td - (DAY_COUNT - 1)).getTime()
  songs.forEach(s => {
    if (new Date(s.playDate).getTime() < dayStartMs) return
    const d = inTZ(new Date(s.playDate), timezone)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (dayMap[key]) { dayMap[key].count++; dayMap[key].duration += s.duration || 0 }
  })

  // Week: last 52 weeks (1 year), one bucket per week (Mon–Sun)
  // startOfWeek on the tz-shifted today gives us the correct Monday date components.
  const WEEK_COUNT = 52
  const cwStart = startOfWeek(new Date(ty, tm, td), { weekStartsOn: 1 })
  const cwy = cwStart.getFullYear(), cwm = cwStart.getMonth(), cwd = cwStart.getDate()
  const weekBuckets = []
  for (let i = WEEK_COUNT - 1; i >= 0; i--) {
    const ws = new Date(cwy, cwm, cwd - i * 7)
    weekBuckets.push({ key: `${ws.getFullYear()}-${ws.getMonth()}-${ws.getDate()}`, label: format(ws, 'MMM d'), count: 0, duration: 0 })
  }
  const weekMap = Object.fromEntries(weekBuckets.map(b => [b.key, b]))
  const weekStartMs = new Date(cwy, cwm, cwd - (WEEK_COUNT - 1) * 7).getTime()
  songs.forEach(s => {
    if (new Date(s.playDate).getTime() < weekStartMs) return
    const d = inTZ(new Date(s.playDate), timezone)
    // startOfWeek on the tz-shifted date gives correct Mon date components
    const ws = startOfWeek(new Date(d.getFullYear(), d.getMonth(), d.getDate()), { weekStartsOn: 1 })
    const key = `${ws.getFullYear()}-${ws.getMonth()}-${ws.getDate()}`
    if (weekMap[key]) { weekMap[key].count++; weekMap[key].duration += s.duration || 0 }
  })

  // Month: last 36 months, one bucket per month
  const monthBuckets = []
  for (let i = 35; i >= 0; i--) {
    let m = realNow.getMonth() - i
    let y = realNow.getFullYear()
    while (m < 0) { m += 12; y-- }
    monthBuckets.push({ key: `${y}-${m}`, label: format(new Date(y, m, 1), 'MMM yyyy'), count: 0, duration: 0 })
  }
  const monthMap = Object.fromEntries(monthBuckets.map(b => [b.key, b]))
  const month36Start = new Date(realNow.getFullYear() - 3, realNow.getMonth(), 1).getTime()
  songs.forEach(s => {
    if (new Date(s.playDate).getTime() < month36Start) return
    const d = inTZ(new Date(s.playDate), timezone)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    if (monthMap[key]) { monthMap[key].count++; monthMap[key].duration += s.duration || 0 }
  })

  // Year: full span, one bucket per calendar year
  const yearMap = {}
  songs.forEach(s => {
    const d = inTZ(new Date(s.playDate), timezone)
    const y = d.getFullYear()
    if (y <= 1970) return
    const key = String(y)
    if (!yearMap[key]) yearMap[key] = { key, label: key, year: y, count: 0, duration: 0 }
    yearMap[key].count++
    yearMap[key].duration += s.duration || 0
  })
  const yearBuckets = Object.values(yearMap).sort((a, b) => a.year - b.year)

  function trimZeros(buckets) {
    const first = buckets.findIndex(b => b.count > 0)
    if (first === -1) return []
    let last = buckets.length - 1
    while (last > first && buckets[last].count === 0) last--
    return buckets.slice(first, last + 1)
  }

  const pace = {
    day: trimZeros(dayBuckets),
    week: trimZeros(weekBuckets),
    month: trimZeros(monthBuckets),
    year: yearBuckets,
  }

  return { onThisDay, artistLoyalty, pace }
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
