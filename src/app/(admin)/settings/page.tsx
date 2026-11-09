'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { addAdmin, fetchAdmins, fetchSettings, removeAdmin, saveSettings } from '@/lib/api'
import type { Admin, Settings } from '@/lib/types'
import {
  Button, Card, CardHeader, ErrorBanner, Field, PageBody, PageHeader, PageLoader,
} from '@/components/ui'

export default function SettingsPage() {
  const [s, setS] = useState<Settings | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [me, setMe] = useState<string | null>(null)
  const [newAdmin, setNewAdmin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    try {
      const [st, ad, sess] = await Promise.all([fetchSettings(), fetchAdmins(), supabase.auth.getSession()])
      setS(st); setAdmins(ad); setMe(sess.data.session?.user.email?.toLowerCase() ?? null); setError(null)
    } catch (e: any) { setError(e.message) }
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    if (!s) return
    setBusy(true); setSaved(false)
    try {
      await saveSettings({ debounce_seconds: s.debounce_seconds, late_after: s.late_after, zoho_enabled: s.zoho_enabled })
      setSaved(true)
    } catch (e: any) { setError(e.message) } finally { setBusy(false) }
  }

  if (!s) return error ? <PageBody><ErrorBanner onRetry={load}>{error}</ErrorBanner></PageBody> : <PageLoader />

  return (
    <PageBody width="narrow">
      <PageHeader title="Settings" subtitle={`Office timezone: ${s.timezone} (change it in the settings table if you ever need to).`} />
      {error && <ErrorBanner>{error}</ErrorBanner>}

      <Card className="mb-6">
        <CardHeader title="Attendance rules" />
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Ignore repeat taps within (seconds)"
            hint="A second tap by the same person inside this window beeps “already recorded” and is not counted as check-out.">
            <input type="number" min={0} max={3600} className="field" value={s.debounce_seconds}
              onChange={(e) => setS({ ...s, debounce_seconds: Number(e.target.value) })} />
          </Field>
          <Field label="Late after" hint="First check-in after this time is flagged late (dashboard only).">
            <input type="time" className="field" value={s.late_after.slice(0, 5)}
              onChange={(e) => setS({ ...s, late_after: e.target.value })} />
          </Field>
          <label className="flex items-start gap-2 text-sm text-muted sm:col-span-2">
            <input type="checkbox" className="mt-1" checked={s.zoho_enabled} onChange={(e) => setS({ ...s, zoho_enabled: e.target.checked })} />
            <span><b className="text-ink">Send attendance to Zoho People.</b> When off, taps are still recorded and queued; they’re sent once you turn it back on.</span>
          </label>
          <p className="text-xs text-subtle sm:col-span-2">
            How in/out works: with one reader the system alternates — 1st tap of the day = check-in, 2nd = check-out, 3rd = check-in…
            Repeat taps inside the window above don’t flip it.
          </p>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-line px-5 py-3">
          {saved && <span className="text-xs text-ok">Saved</span>}
          <Button loading={busy} onClick={save}>Save</Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Admins" subtitle="These emails can sign in here. Each needs a Supabase Auth user (Authentication → Users)." />
        <ul className="divide-y divide-line">
          {admins.map((a) => (
            <li key={a.email} className="flex items-center justify-between px-5 py-2.5 text-sm">
              <span>{a.email}{a.email === me && <span className="ml-2 text-xs text-subtle">(you)</span>}</span>
              <Button size="sm" variant="ghost" className="text-danger" disabled={a.email === me || admins.length <= 1}
                onClick={async () => {
                  if (!confirm(`Remove admin ${a.email}?`)) return
                  try { await removeAdmin(a.email); load() } catch (e: any) { setError(e.message) }
                }}>Remove</Button>
            </li>
          ))}
        </ul>
        <form className="flex gap-2 border-t border-line px-5 py-3"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!newAdmin.trim()) return
            try { await addAdmin(newAdmin); setNewAdmin(''); load() } catch (err: any) { setError(err.message) }
          }}>
          <input className="field" type="email" placeholder="name@sketchrobotics.in" value={newAdmin} onChange={(e) => setNewAdmin(e.target.value)} />
          <Button type="submit" variant="secondary">Add</Button>
        </form>
      </Card>
    </PageBody>
  )
}
