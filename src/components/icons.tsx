/* Thin stroke icon set (24×24, currentColor) used across the dashboard. */
import * as React from 'react'

type P = React.SVGProps<SVGSVGElement>

function base(props: P) {
  return {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...props,
    className: props.className ?? 'h-5 w-5',
  }
}

export const IconChip = (p: P) => (
  <svg {...base(p)}>
    <rect x="7" y="7" width="10" height="10" rx="2" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </svg>
)

export const IconUsers = (p: P) => (
  <svg {...base(p)}>
    <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
    <circle cx="9" cy="7" r="3.5" />
    <path d="M22 20v-1.5a4 4 0 0 0-3-3.87M16.5 3.6a4 4 0 0 1 0 7.3" />
  </svg>
)

export const IconCalendar = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="16" rx="2.5" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

export const IconKey = (p: P) => (
  <svg {...base(p)}>
    <circle cx="8" cy="15" r="4" />
    <path d="M10.8 12.2 20 3M17 6l2.5 2.5M14.5 8.5 17 11" />
  </svg>
)

export const IconSync = (p: P) => (
  <svg {...base(p)}>
    <path d="M21 12a9 9 0 0 1-15.2 6.5L3 16" />
    <path d="M3 12a9 9 0 0 1 15.2-6.5L21 8" />
    <path d="M21 3v5h-5M3 21v-5h5" />
  </svg>
)

export const IconLock = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v2" />
  </svg>
)

export const IconUnlock = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="10" width="16" height="11" rx="2.5" />
    <path d="M8 10V7a4 4 0 0 1 7.5-2M12 15v2" />
  </svg>
)

export const IconSignOut = (p: P) => (
  <svg {...base(p)}>
    <path d="M15 17v1.5A2.5 2.5 0 0 1 12.5 21h-6A2.5 2.5 0 0 1 4 18.5v-13A2.5 2.5 0 0 1 6.5 3h6A2.5 2.5 0 0 1 15 5.5V7" />
    <path d="M10 12h11M18 9l3 3-3 3" />
  </svg>
)

export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconChevronRight = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 5l7 7-7 7" />
  </svg>
)

export const IconArrowLeft = (p: P) => (
  <svg {...base(p)}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
)

export const IconPlus = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconPencil = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4z" />
    <path d="M13.5 6.5 17.5 10.5" />
  </svg>
)

export const IconTrash = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M10 4h4M6 7l1 13h10l1-13M10 11v6M14 11v6" />
  </svg>
)

export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 12.5 9 17.5 20 6.5" />
  </svg>
)

export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="12" height="12" rx="2.5" />
    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
  </svg>
)

export const IconWifi = (p: P) => (
  <svg {...base(p)}>
    <path d="M2.5 9a15 15 0 0 1 19 0M5.5 12.5a10.5 10.5 0 0 1 13 0M8.5 16a6 6 0 0 1 7 0M12 19.5v.01" />
  </svg>
)

export const IconCpu = (p: P) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" />
  </svg>
)

export const IconDatabase = (p: P) => (
  <svg {...base(p)}>
    <ellipse cx="12" cy="6" rx="8" ry="3" />
    <path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
  </svg>
)

export const IconActivity = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </svg>
)

export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.5l3.5 2" />
  </svg>
)

export const IconInbox = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 13h4l1.5 3h7L17 13h4" />
    <path d="M5.5 4h13l2.5 9v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5l2.5-9z" />
  </svg>
)

export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8.4-7.5 9.5-4.4-1.1-7.5-4.9-7.5-9.5V6L12 3z" />
    <path d="M9.5 12.2 11.4 14l3.4-3.6" />
  </svg>
)

export const IconBan = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.8 5.8l12.4 12.4" />
  </svg>
)

export const IconTerminal = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M7.5 9.5 10 12l-2.5 2.5M12.5 15h4" />
  </svg>
)

export const IconLink = (p: P) => (
  <svg {...base(p)}>
    <path d="M10.5 13.5a4 4 0 0 0 5.7 0l2.3-2.3a4 4 0 0 0-5.7-5.7l-1.3 1.3" />
    <path d="M13.5 10.5a4 4 0 0 0-5.7 0l-2.3 2.3a4 4 0 0 0 5.7 5.7l1.3-1.3" />
  </svg>
)

export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
)

export const IconRefresh = (p: P) => (
  <svg {...base(p)}>
    <path d="M20 11a8 8 0 1 0-.7 4.3" />
    <path d="M20 5v6h-6" />
  </svg>
)
