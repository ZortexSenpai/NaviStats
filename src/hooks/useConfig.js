import { useState, useEffect } from 'react'

const DEFAULT_CONFIG = { genreGroups: {}, defaultTheme: null, timezone: null }

export function useConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/config.json')
      .then(r => (r.ok ? r.json() : {}))
      .then(data => setConfig({ ...DEFAULT_CONFIG, ...data }))
      .catch(() => {})
      .finally(() => setLoaded(true))
  }, [])

  return { ...config, loaded }
}
