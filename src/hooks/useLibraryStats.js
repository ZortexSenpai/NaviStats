import { useState, useCallback } from 'react'
import { fetchAllLibrarySongs } from '../api/navidrome'

const LOSSY_FORMATS = new Set(['mp3', 'aac', 'ogg', 'oga', 'm4a', 'wma', 'opus', 'mp4', 'mpc'])

function processLibrary(songs, lowQualityThreshold) {
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

  const lowQuality = songs
    .filter(s => {
      const fmt = (s.suffix || '').toLowerCase()
      return LOSSY_FORMATS.has(fmt) && s.bitRate > 0 && s.bitRate < lowQualityThreshold
    })
    .map(s => ({
      id: s.id,
      title: s.title || 'Unknown',
      artist: s.artist || 'Unknown',
      album: s.album || '',
      albumId: s.albumId,
      bitRate: s.bitRate,
      format: (s.suffix || '').toUpperCase(),
    }))
    .sort((a, b) => a.bitRate - b.bitRate)

  return { untagged, formats, lowQuality, total: songs.length }
}

export function useLibraryStats(auth, lowQualityThreshold = 192) {
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
      setData(processLibrary(songs, lowQualityThreshold))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [auth, lowQualityThreshold])

  return { data, loading, error, load }
}
