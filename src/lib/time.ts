/** All times are shown in the office timezone, whatever the viewer's browser is set to. */
export const TZ = process.env.NEXT_PUBLIC_TZ || 'Asia/Kolkata'

function parts(d: Date) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(d)
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '00'
  return { y: g('year'), m: g('month'), d: g('day'), hh: g('hour') === '24' ? '00' : g('hour'), mm: g('minute'), ss: g('second') }
}

/** YYYY-MM-DD for "today" in the office timezone */
export function todayLocal(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 86_400_000)
  const p = parts(d)
  return `${p.y}-${p.m}-${p.d}`
}

/** UTC ISO instant for local midnight of a YYYY-MM-DD day in the office timezone */
export function startOfLocalDay(day: string): string {
  // Find the UTC instant whose local date/time is day 00:00 (handles any offset)
  const guess = new Date(`${day}T00:00:00Z`)
  const p = parts(guess)
  const localAsUtc = Date.UTC(+p.y, +p.m - 1, +p.d, +p.hh, +p.mm, +p.ss)
  const offset = localAsUtc - guess.getTime()
  return new Date(guess.getTime() - offset).toISOString()
}

export function fmtTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const p = parts(new Date(iso))
  return `${p.hh}:${p.mm}`
}

export function fmtTimeSec(iso: string | null | undefined): string {
  if (!iso) return '—'
  const p = parts(new Date(iso))
  return `${p.hh}:${p.mm}:${p.ss}`
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-IN', {
    timeZone: TZ, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
  })
}

export function fmtDay(day: string): string {
  const d = new Date(`${day}T12:00:00Z`)
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })
}

export function fmtDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds <= 0) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

export function relativeTime(iso: string | null | undefined): string {
  if (!iso) return 'never'
  const secs = Math.round((Date.now() - new Date(iso).getTime()) / 1000)
  if (secs < 10) return 'just now'
  if (secs < 60) return `${secs}s ago`
  const mins = Math.round(secs / 60)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.round(hours / 24)}d ago`
}

export function isOnline(lastSeen: string | null | undefined, withinSec = 180): boolean {
  if (!lastSeen) return false
  return Date.now() - new Date(lastSeen).getTime() < withinSec * 1000
}
