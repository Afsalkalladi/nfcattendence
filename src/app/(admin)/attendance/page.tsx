'use client'

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { fetchAttendance, fetchEmployees, fetchTapsForDay } from '@/lib/api'
import type { AttendanceDay, EmployeeWithCards, Tap } from '@/lib/types'
import { fmtDay, fmtDuration, fmtTime, fmtTimeSec, todayLocal } from '@/lib/time'
import {
  Badge, Button, Card, EmptyState, ErrorBanner, Field, PageBody, PageHeader, Spinner, Stat,
  TableWrap, Td, Th, Tr,
} from '@/components/ui'
import { IconCalendar, IconChevronRight } from '@/components/icons'
import { TapBadge, ZohoBadge } from '@/components/TapBadge'

export default function AttendancePage() {
  const [from, setFrom] = useState(todayLocal(-6))
  const [to, setTo] = useState(todayLocal())
  const [emp, setEmp] = useState('')
  const [people, setPeople] = useState<EmployeeWithCards[]>([])
  const [rows, setRows] = useState<AttendanceDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [detail, setDetail] = useState<Tap[] | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setRows(await fetchAttendance(from, to, emp || undefined))
      setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [from, to, emp])

  useEffect(() => { fetchEmployees().then(setPeople).catch(() => {}) }, [])
  useEffect(() => { load() }, [load])

  async function toggle(r: AttendanceDay) {
    const key = `${r.employee_id}|${r.day}`
    if (open === key) { setOpen(null); return }
    setOpen(key)
    setDetail(null)
    try { setDetail(await fetchTapsForDay(r.employee_id, r.day)) } catch { setDetail([]) }
  }

  const totals = useMemo(() => {
    const worked = rows.reduce((s, r) => s + r.worked_seconds, 0)
    return { days: rows.length, late: rows.filter((r) => r.late).length, worked }
  }, [rows])

  function exportCsv() {
    const head = ['Date', 'Employee', 'First in', 'Last out', 'Worked (h:mm)', 'Taps', 'Late', 'Still in']
    const lines = rows.map((r) => {
      const h = Math.floor(r.worked_seconds / 3600)
      const m = Math.floor((r.worked_seconds % 3600) / 60)
      return [r.day, r.employee_name, fmtTime(r.first_in), r.still_in ? '' : fmtTime(r.last_out),
        `${h}:${String(m).padStart(2, '0')}`, r.taps, r.late ? 'yes' : '', r.still_in ? 'yes' : '']
    })
    const csv = [head, ...lines]
      .map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${from}_to_${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PageBody>
      <PageHeader
        title="Attendance"
        subtitle="One row per person per day. Click a row to see every tap. Times are office time."
        actions={<Button variant="secondary" onClick={exportCsv} disabled={!rows.length}>Export CSV</Button>}
      />

      <Card className="mb-5 p-4">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="From"><input type="date" className="field" value={from} onChange={(e) => setFrom(e.target.value)} /></Field>
          <Field label="To"><input type="date" className="field" value={to} onChange={(e) => setTo(e.target.value)} /></Field>
          <Field label="Person">
            <select className="field" value={emp} onChange={(e) => setEmp(e.target.value)}>
              <option value="">Everyone</option>
              {people.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </Field>
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setFrom(todayLocal()); setTo(todayLocal()) }}>Today</Button>
            <Button variant="ghost" size="sm" onClick={() => { setFrom(todayLocal(-6)); setTo(todayLocal()) }}>7 days</Button>
            <Button variant="ghost" size="sm" onClick={() => { setFrom(todayLocal(-29)); setTo(todayLocal()) }}>30 days</Button>
          </div>
        </div>
      </Card>

      {error && <ErrorBanner onRetry={load}>{error}</ErrorBanner>}

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Stat label="Person-days" value={totals.days} />
        <Stat label="Late arrivals" value={totals.late} tone="warn" />
        <Stat label="Total worked" value={fmtDuration(totals.worked)} />
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center py-14"><Spinner className="h-6 w-6 text-brand" /></div>
        ) : rows.length === 0 ? (
          <EmptyState icon={<IconCalendar className="h-5 w-5" />} title="No attendance in this range" />
        ) : (
          <TableWrap>
            <thead>
              <tr><Th /><Th>Date</Th><Th>Name</Th><Th>First in</Th><Th>Last out</Th><Th>Worked</Th><Th align="right">Taps</Th></tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const key = `${r.employee_id}|${r.day}`
                return (
                  <Fragment key={key}>
                    <Tr className="cursor-pointer" onClick={() => toggle(r)}>
                      <Td className="w-6 text-subtle">
                        <IconChevronRight className={`h-4 w-4 transition ${open === key ? 'rotate-90' : ''}`} />
                      </Td>
                      <Td className="whitespace-nowrap text-muted">{fmtDay(r.day)}</Td>
                      <Td className="font-medium">{r.employee_name}</Td>
                      <Td className="tabular-nums">
                        {fmtTime(r.first_in)} {r.late && <Badge tone="warn" className="ml-1">late</Badge>}
                      </Td>
                      <Td className="tabular-nums">
                        {r.still_in ? <Badge tone="ok" dot>{r.day === todayLocal() ? 'still in' : 'no check-out'}</Badge> : fmtTime(r.last_out)}
                      </Td>
                      <Td className="tabular-nums">{fmtDuration(r.worked_seconds)}</Td>
                      <Td align="right" className="tabular-nums">{r.taps}</Td>
                    </Tr>
                    {open === key && (
                      <tr className="bg-elevated/40">
                        <td colSpan={7} className="px-5 py-3">
                          {!detail ? <Spinner className="h-4 w-4 text-brand" /> : (
                            <div className="flex flex-wrap gap-2">
                              {detail.map((t) => (
                                <div key={t.id} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs">
                                  <span className="font-mono tabular-nums">{fmtTimeSec(t.tapped_at)}</span>
                                  <TapBadge status={t.status} />
                                  {(t.status === 'in' || t.status === 'out') && <ZohoBadge status={t.zoho_status} />}
                                  <span className="text-subtle">{t.device?.name ?? t.device_id}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </TableWrap>
        )}
      </Card>
    </PageBody>
  )
}
