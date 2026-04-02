import { useState, useEffect, useRef } from 'react'

export default function ThemeSelector({ themes, themeId, onSelect }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="theme-selector" ref={ref}>
      <button
        className="btn btn-ghost theme-toggle"
        onClick={() => setOpen(o => !o)}
        title="Change theme"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 2a10 10 0 0 1 0 20"/>
          <path d="M2 12h20"/>
        </svg>
        <span className="theme-btn-label">Theme</span>
      </button>

      {open && (
        <div className="theme-dropdown">
          {themes.map(t => (
            <button
              key={t.id}
              className={`theme-option${t.id === themeId ? ' active' : ''}`}
              onClick={() => { onSelect(t.id); setOpen(false) }}
            >
              <span className="theme-swatch">
                {t.swatches.map((color, i) => (
                  <span key={i} className="theme-swatch-dot" style={{ background: color }} />
                ))}
              </span>
              {t.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
