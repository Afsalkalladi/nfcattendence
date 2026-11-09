'use client'

import { useCallback, useEffect, useState } from 'react'
import { deleteDevice, fetchDevices, registerDevice, setDeviceActive } from '@/lib/api'
import type { Device } from '@/lib/types'
import { isOnline, relativeTime } from '@/lib/time'
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, Field, Metric, PageBody, PageHeader,
  PageLoader, StatusDot,
} from '@/components/ui'
import { IconChip, IconPlus } from '@/components/icons'
import Dialog from '@/components/Dialog'

function uptime(s: number | null) {
  if (!s) return '—'
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60)
  return d ? `${d}d ${h}h` : h ? `${h}h ${m}m` : `${m}m`
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<{ id: string; name: string; email: string; location: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [dlgError, setDlgError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try { setDevices(await fetchDevices()); setError(null) } catch (e: any) { setError(e.message) } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 15000)
    return () => clearInterval(t)
  }, [load])

  async function submit() {
    if (!form) return
    setBusy(true); setDlgError(null)
    try {
      await registerDevice(form.id, form.name, form.email, form.location)
      setForm(null); await load()
    } catch (e: any) { setDlgError(e.message) } finally { setBusy(false) }
  }

  async function act(fn: () => Promise<unknown>, msg?: string) {
    if (msg && !confirm(msg)) return
    try { await fn(); await load() } catch (e: any) { setError(e.message) }
  }

  if (loading) return <PageLoader />

  return (
    <PageBody>
      <PageHeader
        title="Readers"
        subtitle="Each ESP32 reader signs in with its own Supabase user. A reader is online if it sent a heartbeat in the last 3 minutes."
        actions={<Button icon={<IconPlus className="h-4 w-4" />} onClick={() => { setDlgError(null); setForm({ id: '', name: '', email: '', location: '' }) }}>Add reader</Button>}
      />
      {error && <ErrorBanner onRetry={load}>{error}</ErrorBanner>}

      {devices.length === 0 ? (
        <Card>
          <EmptyState icon={<IconChip className="h-5 w-5" />} title="No readers yet"
            description="Create a login for the reader in Supabase (Authentication → Users → Add user), put it in the firmware's secrets.h, then add it here." />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((d) => {
            const online = d.active && isOnline(d.last_seen_at)
            return (
              <Card key={d.device_id} className={d.active ? '' : 'opacity-60'}>
                <CardHeader
                  title={<span className="flex items-center gap-2"><StatusDot online={online} />{d.name ?? d.device_id}</span>}
                  subtitle={<span className="font-mono">{d.device_id}{d.location ? ` · ${d.location}` : ''}</span>}
                  actions={!d.active ? <Badge>disabled</Badge> : online ? <Badge tone="ok">online</Badge> : <Badge tone="danger">offline</Badge>}
                />
                <div className="px-5 py-3">
                  <Metric label="Last seen" value={relativeTime(d.last_seen_at)} />
                  <Metric label="NFC reader" value={d.reader_ok == null ? '—' : d.reader_ok ? 'OK' : 'NOT RESPONDING'} tone={d.reader_ok === false ? 'danger' : undefined} />
                  <Metric label="Offline taps waiting" value={d.queue_len ?? '—'} tone={d.queue_len ? 'warn' : undefined} />
                  <Metric label="Wi-Fi signal" value={d.wifi_rssi != null ? `${d.wifi_rssi} dBm` : '—'} tone={d.wifi_rssi != null && d.wifi_rssi < -75 ? 'warn' : undefined} />
                  <Metric label="IP / MAC" value={`${d.ip ?? '—'} · ${d.mac ?? '—'}`} mono />
                  <Metric label="Firmware" value={d.firmware_version ?? '—'} mono />
                  <Metric label="Uptime" value={uptime(d.uptime_s)} />
                  <Metric label="Free memory" value={d.free_heap ? `${Math.round(d.free_heap / 1024)} KB` : '—'} />
                  {!d.auth_user_id && <p className="mt-2 text-xs text-danger">No login linked — re-add this reader with its device email.</p>}
                </div>
                <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
                  <Button size="sm" variant="ghost" onClick={() => act(() => setDeviceActive(d.device_id, !d.active))}>
                    {d.active ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-danger"
                    onClick={() => act(() => deleteDevice(d.device_id), `Delete reader ${d.device_id}? Its past taps are kept.`)}>
                    Delete
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={!!form} title="Add reader" onClose={() => setForm(null)}
        footer={<><Button variant="secondary" onClick={() => setForm(null)}>Cancel</Button><Button loading={busy} onClick={submit}>Save</Button></>}>
        {dlgError && <ErrorBanner>{dlgError}</ErrorBanner>}
        {form && (
          <>
            <ol className="list-decimal space-y-1 pl-4 text-xs text-muted">
              <li>Supabase → Authentication → Users → <b>Add user</b> (email + password, auto-confirm).</li>
              <li>Put that email/password in the firmware <span className="font-mono">include/secrets.h</span>.</li>
              <li>Fill this form with the same email. Re-adding an existing ID updates it.</li>
            </ol>
            <Field label="Reader ID" hint="Any short label, e.g. FRONT-DESK. Shown on every tap.">
              <input className="field font-mono uppercase" autoFocus value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} />
            </Field>
            <Field label="Display name"><input className="field" placeholder="Front desk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Location (optional)"><input className="field" placeholder="Ground floor entrance" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            <Field label="Reader login email" hint="DEVICE_EMAIL from secrets.h">
              <input className="field" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
          </>
        )}
      </Dialog>
    </PageBody>
  )
}
