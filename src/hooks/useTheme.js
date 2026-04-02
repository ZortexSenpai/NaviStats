import { useState, useEffect } from 'react'
import { themes, themeMap, DEFAULT_THEME_ID } from '../themes'

const STORAGE_KEY = 'navistats_theme'

function applyTheme(theme) {
  const root = document.documentElement
  Object.entries(theme.vars).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
  })
}

export function useTheme(configDefaultThemeId) {
  const [themeId, setThemeIdState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored && themeMap[stored] ? stored : DEFAULT_THEME_ID
  })

  // When config loads with a defaultTheme and the user has no stored preference,
  // apply the config default.
  useEffect(() => {
    if (!configDefaultThemeId || !themeMap[configDefaultThemeId]) return
    if (localStorage.getItem(STORAGE_KEY)) return
    setThemeIdState(configDefaultThemeId)
  }, [configDefaultThemeId])

  useEffect(() => {
    const theme = themeMap[themeId] || themeMap[DEFAULT_THEME_ID]
    applyTheme(theme)
    localStorage.setItem(STORAGE_KEY, themeId)
  }, [themeId])

  // Apply on first mount
  useEffect(() => {
    const theme = themeMap[themeId] || themeMap[DEFAULT_THEME_ID]
    applyTheme(theme)
  }, []) // eslint-disable-line

  function setThemeId(id) {
    if (themeMap[id]) setThemeIdState(id)
  }

  return { theme: themeMap[themeId], themeId, setThemeId, themes }
}
