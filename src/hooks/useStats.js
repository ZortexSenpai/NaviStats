import { useState, useEffect, useCallback, useMemo } from 'react'
import { subDays, format, getHours, startOfWeek } from 'date-fns'
import { fetchSongsInRange } from '../api/navidrome'

function buildGenreGroupMap(genreGroups) {
  const map = {}
  for (const [group, subgenres] of Object.entries(genreGroups || {})) {
    for (const sub of subgenres) {
      map[sub.toLowerCase()] = group
    }
  }
  return map
}

// Returns the resolved genre names for a song, applying group mapping
function songGenres(s, genreGroupMap) {
  const raw = Array.isArray(s.genres) && s.genres.length
    ? s.genres
    : s.genre ? [{ name: s.genre }] : [{ name: 'Unknown' }]
  return raw.map(g => {
    const name = g.name || 'Unknown'
    return genreGroupMap[name.toLowerCase()] ?? name
  })
}

// Returns a Date whose local-time components (hours, date, month…) match the
// target timezone. date-fns functions like getHours/format/startOfWeek then
// operate on the correct timezone-local values without needing a tz-aware lib.
// Uses formatToParts instead of toLocaleString+new Date to avoid the ambiguity
// of re-parsing a locale string (which browsers may treat as UTC or local).
function inTZ(date, tz) {
  if (!tz) return date
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  }).formatToParts(date)
  const get = type => parseInt(parts.find(p => p.type === type).value)
  // hour12:false can yield 24 for midnight; normalise to 0
  return new Date(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute'), get('second'))
}

function processStats(songs, startDate, endDate, timespanDays, genreGroups = {}, timezone = null, recentTracksGenreGrouping = true) {
  if (!songs.length) {
    return { totalDuration: 0, songCount: 0, topTimes: [], genres: [], topArtists: [], topAlbums: [], recentTracks: [], decades: [], years: [], sessions: [] }
  }

  const totalDuration = songs.reduce((sum, s) => sum + (s.duration || 0), 0)
  const genreGroupMap = buildGenreGroupMap(genreGroups)

  // ── Top Times ──────────────────────────────────────────────────
  let topTimes = []

  if (timespanDays <= 1) {
    // Per hour (0–23)
    const hours = Array.from({ length: 24 }, (_, i) => {
      const label = i === 0 ? '12am' : i < 12 ? `${i}am` : i === 12 ? '12pm' : `${i - 12}pm`
      return { label, duration: 0, count: 0, genres: {} }
    })
    songs.forEach(s => {
      const h = getHours(inTZ(new Date(s.playDate), timezone))
      hours[h].duration += s.duration || 0
      hours[h].count++
      songGenres(s, genreGroupMap).forEach(name => {
        hours[h].genres[name] = (hours[h].genres[name] || 0) + (s.duration || 0)
      })
    })
    topTimes = hours

  } else if (timespanDays <= 31) {
    // Per day in range
    const dayMap = {}
    for (let i = timespanDays - 1; i >= 0; i--) {
      const d = inTZ(subDays(endDate, i), timezone)
      const key = format(d, 'yyyy-MM-dd')
      dayMap[key] = { label: format(d, 'EEE d'), duration: 0, count: 0, genres: {} }
    }
    songs.forEach(s => {
      const key = format(inTZ(new Date(s.playDate), timezone), 'yyyy-MM-dd')
      if (dayMap[key]) {
        dayMap[key].duration += s.duration || 0
        dayMap[key].count++
        songGenres(s, genreGroupMap).forEach(name => {
          dayMap[key].genres[name] = (dayMap[key].genres[name] || 0) + (s.duration || 0)
        })
      }
    })
    topTimes = Object.values(dayMap)

  } else if (timespanDays <= 90) {
    // Per week
    const weekMap = {}
    songs.forEach(s => {
      const pd = inTZ(new Date(s.playDate), timezone)
      const ws = startOfWeek(pd, { weekStartsOn: 1 })
      const key = format(ws, 'yyyy-MM-dd')
      if (!weekMap[key]) weekMap[key] = { label: format(ws, 'MMM d'), weekStart: ws, duration: 0, count: 0, genres: {} }
      weekMap[key].duration += s.duration || 0
      weekMap[key].count++
      songGenres(s, genreGroupMap).forEach(name => {
        weekMap[key].genres[name] = (weekMap[key].genres[name] || 0) + (s.duration || 0)
      })
    })
    topTimes = Object.values(weekMap).sort((a, b) => a.weekStart - b.weekStart)

  } else {
    // Per month
    const monthMap = {}
    songs.forEach(s => {
      const pd = inTZ(new Date(s.playDate), timezone)
      const key = format(pd, 'yyyy-MM')
      if (!monthMap[key]) monthMap[key] = { label: format(pd, 'MMM yyyy'), month: pd, duration: 0, count: 0, genres: {} }
      monthMap[key].duration += s.duration || 0
      monthMap[key].count++
      songGenres(s, genreGroupMap).forEach(name => {
        monthMap[key].genres[name] = (monthMap[key].genres[name] || 0) + (s.duration || 0)
      })
    })
    topTimes = Object.values(monthMap).sort((a, b) => a.month - b.month)
  }

  // ── Genres ─────────────────────────────────────────────────────
  const genreMap = {}
  songs.forEach(s => {
    songGenres(s, genreGroupMap).forEach(name => {
      if (!genreMap[name]) genreMap[name] = { name, count: 0, duration: 0 }
      genreMap[name].count++
      genreMap[name].duration += s.duration || 0
    })
  })
  const genres = Object.values(genreMap).sort((a, b) => b.count - a.count)

  // ── Top Artists ─────────────────────────────────────────────────
  const artistMap = {}
  songs.forEach(s => {
    // When multiple artists are joined by ' • ', use the album artist — unless it is
    // "Various Artists", in which case fall back to the first listed artist.
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
    const key = id || name || 'unknown'
    if (!artistMap[key]) {
      artistMap[key] = { name, id, count: 0, duration: 0 }
    }
    artistMap[key].count++
    artistMap[key].duration += s.duration || 0
  })
  const topArtists = Object.values(artistMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 100)

  // ── Top Albums ──────────────────────────────────────────────────
  const albumMap = {}
  songs.forEach(s => {
    const key = s.albumId || s.album || 'unknown'
    if (!albumMap[key]) {
      albumMap[key] = {
        name: s.album || 'Unknown',
        artist: s.albumArtist || s.artist || '',
        id: s.albumId,
        count: 0,
        duration: 0,
      }
    }
    albumMap[key].count++
    albumMap[key].duration += s.duration || 0
  })
  const topAlbums = Object.values(albumMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 100)

  // ── Recent Tracks ───────────────────────────────────────────────
  // Songs are already sorted DESC by playDate from the API
  const recentTracks = songs.slice(0, 100).map(s => ({
    id: s.id,
    title: s.title || 'Unknown',
    artist: s.artist || 'Unknown',
    album: s.album || '',
    albumId: s.albumId,
    playDate: s.playDate,
    duration: s.duration || 0,
    genres: [...new Set(songGenres(s, recentTracksGenreGrouping ? genreGroupMap : {}))],
  }))

  // ── Top Tracks ─────────────────────────────────────────────────
  // Sort songs in the timespan by playCount DESC so the result respects the selected period.
  const topTracks = songs
    .slice()
    .sort((a, b) => (b.playCount ?? b.play_count ?? 0) - (a.playCount ?? a.play_count ?? 0))
    .slice(0, 100)
    .map(s => ({
      id: s.id,
      title: s.title || 'Unknown',
      artist: s.artist || 'Unknown',
      album: s.album || '',
      albumId: s.albumId,
      playCount: s.playCount ?? s.play_count ?? 0,
      duration: s.duration || 0,
    }))

  // ── Decades ────────────────────────────────────────────────────
  const decadeMap = {}
  songs.forEach(s => {
    if (!s.year || s.year <= 0) return
    const decade = Math.floor(s.year / 10) * 10
    const label = decade < 2000 ? `${decade % 100}s` : `${decade}s`
    if (!decadeMap[decade]) decadeMap[decade] = { decade, label, count: 0, duration: 0, albumCounts: {} }
    decadeMap[decade].count++
    decadeMap[decade].duration += s.duration || 0
    const aKey = s.albumId || s.album || 'unknown'
    if (!decadeMap[decade].albumCounts[aKey]) decadeMap[decade].albumCounts[aKey] = { name: s.album || 'Unknown', count: 0 }
    decadeMap[decade].albumCounts[aKey].count++
  })
  const decades = Object.values(decadeMap).sort((a, b) => a.decade - b.decade).map(d => ({
    decade: d.decade, label: d.label, count: d.count, duration: d.duration,
    topAlbums: Object.values(d.albumCounts).sort((a, b) => b.count - a.count).slice(0, 3),
  }))

  // ── Years ──────────────────────────────────────────────────────
  const yearMap = {}
  songs.forEach(s => {
    if (!s.year || s.year <= 0) return
    const y = s.year
    if (!yearMap[y]) yearMap[y] = { year: y, label: String(y), count: 0, duration: 0, albumCounts: {} }
    yearMap[y].count++
    yearMap[y].duration += s.duration || 0
    const aKey = s.albumId || s.album || 'unknown'
    if (!yearMap[y].albumCounts[aKey]) yearMap[y].albumCounts[aKey] = { name: s.album || 'Unknown', count: 0 }
    yearMap[y].albumCounts[aKey].count++
  })
  const years = Object.values(yearMap).sort((a, b) => a.year - b.year).map(y => ({
    year: y.year, label: y.label, count: y.count, duration: y.duration,
    topAlbums: Object.values(y.albumCounts).sort((a, b) => b.count - a.count).slice(0, 3),
  }))

  // ── Sessions ────────────────────────────────────────────────────
  // A session is a continuous block of listening; a gap > 20 min = new session.
  const SESSION_GAP_MS = 20 * 60 * 1000
  const sortedAsc = songs.slice().sort((a, b) => new Date(a.playDate) - new Date(b.playDate))
  const sessionList = []
  let cur = null
  for (const s of sortedAsc) {
    const startMs = new Date(s.playDate).getTime()
    const durMs = (s.duration || 0) * 1000
    const endMs = startMs + durMs
    if (!cur) {
      cur = { start: startMs, end: endMs, duration: s.duration || 0, trackCount: 1 }
    } else {
      const gap = startMs - cur.end
      if (gap <= SESSION_GAP_MS) {
        cur.end = Math.max(cur.end, endMs)
        cur.duration += s.duration || 0
        cur.trackCount++
      } else {
        sessionList.push(cur)
        cur = { start: startMs, end: endMs, duration: s.duration || 0, trackCount: 1 }
      }
    }
  }
  if (cur) sessionList.push(cur)
  const sessions = sessionList.sort((a, b) => b.duration - a.duration)

  return { totalDuration, songCount: songs.length, topTimes, genres, topArtists, topAlbums, recentTracks, topTracks, decades, years, sessions }
}

// span: { days: number, startDate?: Date, endDate?: Date }
export function useStats(auth, span, genreGroups = {}, timezone = null, recentTracksGenreGrouping = true) {
  const [raw, setRaw] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async (silent = false) => {
    if (!auth || !span) return
    if (!silent) setRaw(null)
    setLoading(true)
    setError(null)
    try {
      const endDate = span.endDate ?? new Date()
      const startDate = span.all ? new Date(0) : (span.startDate ?? subDays(endDate, span.days))
      const songs = await fetchSongsInRange(auth.serverUrl, auth.token, startDate)
      // fetchSongsInRange stops at startDate but doesn't skip songs after endDate.
      // For custom ranges (endDate in the past) we must filter the leading songs out.
      const filtered = songs.filter(s => new Date(s.playDate) <= endDate)
      setRaw({ songs: filtered, startDate, endDate, days: span.all ? Infinity : span.days })
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [auth, span?.days, span?.all, span?.startDate, span?.endDate])

  useEffect(() => { load() }, [load])

  // Re-process whenever raw data or genre groups change — no extra fetch needed
  const data = useMemo(() => {
    if (!raw) return null
    return processStats(raw.songs, raw.startDate, raw.endDate, raw.days, genreGroups, timezone, recentTracksGenreGrouping)
  }, [raw, genreGroups, timezone, recentTracksGenreGrouping])

  return { data, loading, error, refetch: () => load(true) }
}
