import { createContext, useContext } from 'react'
import { themeMap, DEFAULT_THEME_ID } from './themes'

export const ThemeContext = createContext(themeMap[DEFAULT_THEME_ID])
export const useThemeContext = () => useContext(ThemeContext)
