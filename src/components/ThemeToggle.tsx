'use client'

import { useEffect, useState } from 'react'

export type ThemeChoice = 'light' | 'dark' | 'system'

export const THEME_KEY = 'em-lock-theme'

/**
 * Inlined in <head> before paint so the correct theme is applied on the very
 * first frame (no white flash when a dark-mode user loads the dashboard).
 */
export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var t = localStorage.getItem('${THEME_KEY}') || 'system';
    var dark = t === 'dark' || (t === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', dark);
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  } catch (e) {}
})();
`

function apply(choice: ThemeChoice) {
  const dark =
    choice === 'dark' ||
    (choice === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
}

const OPTIONS: { value: ThemeChoice; label: string; icon: JSX.Element }[] = [
  {
    value: 'light',
    label: 'Light',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    ),
  },
  {
    value: 'system',
    label: 'System',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <rect x="2" y="4" width="20" height="13" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    ),
  },
  {
    value: 'dark',
    label: 'Dark',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
    ),
  },
]

/** Three-way theme switch: light / follow-system / dark. */
export default function ThemeToggle({ className = '' }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>('system')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem(THEME_KEY) as ThemeChoice) || 'system'
    setChoice(stored)
    setMounted(true)

    // Follow the OS while on "system"
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if ((localStorage.getItem(THEME_KEY) as ThemeChoice) !== 'dark' &&
          (localStorage.getItem(THEME_KEY) as ThemeChoice) !== 'light') {
        apply('system')
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function pick(value: ThemeChoice) {
    localStorage.setItem(THEME_KEY, value)
    setChoice(value)
    apply(value)
  }

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={`inline-flex items-center gap-0.5 rounded-full border border-line bg-elevated p-0.5 ${className}`}
    >
      {OPTIONS.map((opt) => {
        const active = mounted && choice === opt.value
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            aria-label={opt.label}
            title={`${opt.label} theme`}
            onClick={() => pick(opt.value)}
            className={`focus-ring grid h-7 w-7 place-items-center rounded-full transition ${
              active
                ? 'bg-surface text-brand shadow-sm'
                : 'text-subtle hover:text-ink'
            }`}
          >
            {opt.icon}
          </button>
        )
      })}
    </div>
  )
}
