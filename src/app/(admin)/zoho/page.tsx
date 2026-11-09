'use client'

import { useCallback, useEffect, useState } from 'react'
import { fetchZohoRuns, fetchZohoTaps, runZohoSync, zohoCounts, zohoRetry } from '@/lib/api'
import type { Tap, ZohoRun } from '@/lib/types'
import { fmtDateTime, relativeTime } from '@/lib/time'
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, PageBody, PageHeader, PageLoader, Stat,
  TableWrap, Td, Th, Tr, cx,
} from '@/components/ui'
import { IconSync } from '@/components/icons'
import { TapBadge, ZohoBadge } from '@/components/TapBadge'

type Filter = 'all' | 'pending' | 'problems'

export default function ZohoPage() {
  const [counts, setCounts] = useState({ pending: 0, noId: 0, errors: 0, okToday: 0 })
  const [runs, setRuns] = useState<ZohoRun[]>([])
  const [taps, setTaps] = useState<Tap[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)

  const load = useCallback(async () => {
    try {
      const [c, r, t] = await Promise.all([zohoCounts(), fetchZohoRuns(), fetchZohoTaps(filter)])
      setCounts(c); setRuns(r); setTaps(t); setError(null)
    } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  async function syncNow() {
    setSyncing(true); setNotice(null); setError(null)
    try {
      const res = await runZohoSync()
      setNotice(res?.ok ? `Sync done: ${res.synced ?? 0} sent${res.skipped ? `, ${res.skipped} skipped (no Zoho ID)` : ''}.` : `Sync reported: ${JSON.stringify(res)}`)
    } catch (e: any) { setError(e.message) } finally { setSyncing(false); load() }
  }

  async function retry(kind: 'no-zoho-id' | 'error') {
    try {
      const n = await zohoRetry(kind)
      setNotice(`${n} tap(s) put back in the queue. They go out on the next sync (or press Sync now).`)
      load()
    } catch (e: any) { setError(e.message) }
  }

  if (loading) return <PageLoader />
  const last = runs[0]

  return (
    <PageBody>
      <PageHeader
        title="Zoho People sync"
        subtitle="Check-ins and check-outs are pushed to Zoho People every 5 minutes. Double taps and unregistered cards are never sent."
        actions={<Button icon={<IconSync className="h-4 w-4" />} loading={syncing} onClick={syncNow}>Sync now</Button>}
      />
      {error && <ErrorBanner onRetry={load}>{error}</ErrorBanner>}
      {notice && <div className="mb-5 rounded-xl border border-ok/30 bg-ok-soft px-4 py-3 text-sm text-ok">{notice}</div>}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Waiting to send" value={counts.pending} tone="brand" hint={last ? `last run ${relativeTime(last.ran_at)}` : 'never ran'} />
        <Stat label="Sent today" value={counts.okToday} tone="ok" />
        <Stat label="No Zoho ID" value={counts.noId} tone={counts.noId ? 'warn' : 'neutral'} hint={counts.noId ? 'fill ID in People, then retry' : undefined} />
        <Stat label="Errors" value={counts.errors} tone={counts.errors ? 'danger' : 'neutral'} hint={counts.errors ? 'check in Zoho before retrying' : undefined} />
      </div>

      {(counts.noId > 0 || counts.errors > 0) && (
        <Card className="mb-6 flex flex-wrap items-center gap-3 p-4">
          <p className="mr-auto text-sm text-muted">Fixed the cause? Put those taps back in the queue:</p>
          {counts.noId > 0 && <Button size="sm" variant="secondary" onClick={() => retry('no-zoho-id')}>Retry {counts.noId} without Zoho ID</Button>}
          {counts.errors > 0 && <Button size="sm" variant="secondary" onClick={() => retry('error')}>Retry {counts.errors} errors</Button>}
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader
            title="Check-ins / check-outs"
            actions={
              <div className="flex rounded-lg border border-line p-0.5 text-xs">
                {(['all', 'pending', 'problems'] as Filter[]).map((f) => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={cx('rounded-md px-2.5 py-1 font-medium capitalize', filter === f ? 'bg-brand-soft text-brand' : 'text-muted hover:text-ink')}>
                    {f}
                  </button>
                ))}
              </div>
            }
          />
          {taps.length === 0 ? <EmptyState title="Nothing here" /> : (
            <TableWrap>
              <thead><tr><Th>Time</Th><Th>Person</Th><Th>Type</Th><Th>Zoho</Th></tr></thead>
              <tbody>
                {taps.map((t) => (
                  <Tr key={t.id}>
                    <Td className="whitespace-nowrap tabular-nums text-muted">{fmtDateTime(t.tapped_at)}</Td>
                    <Td className="font-medium">{t.employee?.name ?? t.uid}</Td>
                    <Td><TapBadge status={t.status} /></Td>
                    <Td>
                      <ZohoBadge status={t.zoho_status} />
                      {t.zoho_error && <div className="mt-1 max-w-xs truncate text-xs text-danger" title={t.zoho_error}>{t.zoho_error}</div>}
                    </Td>
                  </Tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title="Recent sync runs" subtitle="Kept for 30 days" />
          {runs.length === 0 ? (
            <EmptyState title="No runs yet" description="Deploy the Edge Function and schedule it (README step 4), or press Sync now." />
          ) : (
            <ul className="divide-y divide-line">
              {runs.map((r) => (
                <li key={r.id} className="px-5 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs tabular-nums text-muted">{fmtDateTime(r.ran_at)} · {r.trigger}</span>
                    {r.ok ? <Badge tone="ok">ok</Badge> : <Badge tone="danger">failed{r.http_status ? ` ${r.http_status}` : ''}</Badge>}
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink" title={r.message ?? ''}>{r.message}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </PageBody>
  )
}
