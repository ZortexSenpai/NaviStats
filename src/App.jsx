import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import { ThemeContext } from './ThemeContext'
import { useTheme } from './hooks/useTheme'
import { useConfig } from './hooks/useConfig'

const STORAGE_KEY = 'navistats_auth'

export default function App() {
  const config = useConfig()
  const { theme, themeId, setThemeId, themes } = useTheme(config.defaultTheme)

  const [auth, setAuth] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  function handleLogin(authData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
    setAuth(authData)
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY)
    setAuth(null)
  }

  return (
    <ThemeContext.Provider value={theme}>
      {!auth
        ? <Login onLogin={handleLogin} />
        : <Dashboard
            auth={auth}
            onLogout={handleLogout}
            themes={themes}
            themeId={themeId}
            onThemeChange={setThemeId}
          />
      }
    </ThemeContext.Provider>
  )
}
