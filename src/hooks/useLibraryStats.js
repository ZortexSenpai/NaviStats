import { useState, useCallback } from 'react'
import { fetchAllLibrarySongs } from '../api/navidrome'

function processLibrary(songs) {
  const untagged = songs.map(s => {
    const missingGenre = !s.genre && (!Array.isArray(s.genres) || s.genres.length === 0)
    const missingYear = !s.year || s.year === 0
    const missingGain = !s.rgAlbumGain && !s.rgTrackGain
    if (!missingGenre && !missingYear && !missingGain) return null
    return {
      id: s.id,
      title: s.title || 'Unknown',
      artist: s.artist || 'Unknown',
      album: s.album || '',
      albumId: s.albumId,
      missingGenre,
      missingYear,
      missingGain,
    }
  }).filter(Boolean)

  const formatMap = {}
  songs.forEach(s => {
    const fmt = (s.suffix || 'unknown').toLowerCase()
    if (!formatMap[fmt]) formatMap[fmt] = { count: 0, totalBitrate: 0, bitrateCount: 0 }
    formatMap[fmt].count++
    if (s.bitRate > 0) {
      formatMap[fmt].totalBitrate += s.bitRate
      formatMap[fmt].bitrateCount++
    }
  })
  const formats = Object.entries(formatMap)
    .map(([fmt, v]) => ({
      format: fmt.toUpperCase(),
      count: v.count,
      avgBitrate: v.bitrateCount > 0 ? Math.round(v.totalBitrate / v.bitrateCount) : null,
    }))
    .sort((a, b) => b.count - a.count)

  return { untagged, formats, total: songs.length }
}

export function useLibraryStats(auth) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    if (!auth) return
    setData(null)
    setLoading(true)
    setError(null)
    try {
      const songs = await fetchAllLibrarySongs(auth.serverUrl, auth.token)
      setData(processLibrary(songs))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [auth])

  return { data, loading, error, load }
}
