'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  fetchAttendance, fetchDevices, fetchEmployees, fetchRecentTaps, fetchUnknownCards,
} from '@/lib/api'
import type { AttendanceDay, Device, EmployeeWithCards, Tap, UnknownCard } from '@/lib/types'
import { fmtDuration, fmtTime, fmtTimeSec, isOnline, relativeTime, todayLocal } from '@/lib/time'
import {
  Badge, Card, CardHeader, EmptyState, ErrorBanner, PageBody, PageHeader, PageLoader, Stat, StatusDot,
  TableWrap, Td, Th, Tr, btn,
} from '@/components/ui'
import { IconActivity, IconChip, IconClock, IconInbox, IconUsers } from '@/components/icons'
import { TapBadge } from '@/components/TapBadge'

export default function TodayPage() {
  const [rows, setRows] = useState<AttendanceDay[]>([])
  const [taps, setTaps] = useState<Tap[]>([])
  const [devices, setDevices] = useState<Device[]>([])
  const [people, setPeople] = useState<EmployeeWithCards[]>([])
  const [unknown, setUnknown] = useState<UnknownCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const today = todayLocal()
      const [a, t, d, p, u] = await Promise.all([
        fetchAttendance(today, today), fetchRecentTaps(25), fetchDevices(), fetchEmployees(), fetchUnknownCards(),
      ])
      setRows(a); setTaps(t); setDevices(d); setPeople(p); setUnknown(u)
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 5000)
    return () => clearInterval(t)
  }, [load])

  if (loading) return <PageLoader />

  const present = rows.filter((r) => r.still_in)
  const late = rows.filter((r) => r.late)
  const seen = new Set(rows.map((r) => r.employee_id))
  const absent = people.filter((p) => p.active && !seen.has(p.id))
  const online = devices.filter((d) => d.active && isOnline(d.last_seen_at))
  const activeDevices = devices.filter((d) => d.active)

  return (
    <PageBody>
      <PageHeader
        eyebrow={new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        title="Today"
        subtitle="Live view of who has tapped in. Refreshes every 5 seconds."
      />
      {error && <ErrorBanner onRetry={load}>{error}</ErrorBanner>}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="In office now" value={present.length} hint={`of ${people.filter((p) => p.active).length} active`} icon={<IconUsers className="h-[18px] w-[18px]" />} tone="ok" />
        <Stat label="Came in today" value={rows.length} hint={`${late.length} late`} icon={<IconClock className="h-[18px] w-[18px]" />} tone={late.length ? 'warn' : 'brand'} />
        <Stat label="Unregistered cards" value={unknown.length} hint={unknown.length ? 'assign them in People' : 'all cards known'} icon={<IconInbox className="h-[18px] w-[18px]" />} tone={unknown.length ? 'warn' : 'neutral'} />
        <Stat label="Readers online" value={`${online.length}/${activeDevices.length}`} hint={activeDevices.length ? undefined : 'add one in Readers'} icon={<IconChip className="h-[18px] w-[18px]" />} tone={online.length === activeDevices.length && activeDevices.length ? 'ok' : 'danger'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader title="Attendance today" subtitle="First in, last out and time inside (in→out pairs)" />
          {rows.length === 0 ? (
            <EmptyState icon={<IconUsers className="h-5 w-5" />} title="Nobody has tapped in yet" />
          ) : (
            <TableWrap>
              <thead>
                <tr><Th>Name</Th><Th>In</Th><Th>Out</Th><Th>Worked</Th><Th>Status</Th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <Tr key={r.employee_id}>
                    <Td className="font-medium">{r.employee_name}</Td>
                    <Td className="tabular-nums">
                      {fmtTime(r.first_in)} {r.late && <Badge tone="warn" className="ml-1">late</Badge>}
                    </Td>
                    <Td className="tabular-nums">{r.still_in ? '—' : fmtTime(r.last_out)}</Td>
                    <Td className="tabular-nums">{fmtDuration(r.worked_seconds)}</Td>
                    <Td>{r.still_in ? <Badge tone="ok" dot>In office</Badge> : <Badge>Left</Badge>}</Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}
          {absent.length > 0 && (
            <div className="border-t border-line px-5 py-3 text-xs text-muted">
              <span className="font-medium text-subtle">Not in yet: </span>
              {absent.map((p) => p.name).join(', ')}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Live taps" subtitle="Most recent first" actions={<IconActivity className="h-4 w-4 text-subtle" />} />
          {taps.length === 0 ? (
            <EmptyState title="No taps yet" description="Tap a card on a reader to see it here." />
          ) : (
            <ul className="divide-y divide-line">
              {taps.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {t.employee?.name ?? <span className="font-mono text-warn">{t.uid}</span>}
                    </p>
                    <p className="truncate text-xs text-subtle">
                      {fmtTimeSec(t.tapped_at)} · {t.device?.name ?? t.device_id ?? '—'}
                      {t.source === 'offline' && ' · uploaded later'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <TapBadge status={t.status} />
                    {t.status === 'unknown' && (
                      <Link href={`/people?assign=${t.uid}`} className={btn('soft', 'sm')}>Assign</Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {devices.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {devices.map((d) => (
            <span key={d.device_id} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-muted">
              <StatusDot online={d.active && isOnline(d.last_seen_at)} />
              {d.name ?? d.device_id}
              <span className="text-subtle">· {relativeTime(d.last_seen_at)}</span>
              {!!d.queue_len && <Badge tone="warn">{d.queue_len} queued</Badge>}
            </span>
          ))}
        </div>
      )}
    </PageBody>
  )
}
