'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  addCard, claimUnknownTaps, deleteEmployee, fetchEmployees, fetchUnknownCards, normaliseUid,
  removeCard, saveEmployee, setCardActive,
} from '@/lib/api'
import type { EmployeeWithCards, UnknownCard } from '@/lib/types'
import { fmtDateTime, relativeTime, todayLocal } from '@/lib/time'
import {
  Badge, Button, Card, CardHeader, EmptyState, ErrorBanner, Field, PageBody, PageHeader, PageLoader,
  TableWrap, Td, Th, Tr,
} from '@/components/ui'
import { IconInbox, IconPencil, IconPlus, IconSearch, IconUsers } from '@/components/icons'
import Dialog from '@/components/Dialog'

type EmpForm = { id?: string; name: string; email: string; zoho_emp_id: string; department: string; active: boolean }
const EMPTY: EmpForm = { name: '', email: '', zoho_emp_id: '', department: '', active: true }

export default function PeoplePage() {
  const [people, setPeople] = useState<EmployeeWithCards[]>([])
  const [unknown, setUnknown] = useState<UnknownCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  // dialogs
  const [empForm, setEmpForm] = useState<EmpForm | null>(null)
  const [cardFor, setCardFor] = useState<{ uid: string; employeeId: string; newName: string; label: string; claim: boolean; fromUnknown: boolean } | null>(null)
  const [busy, setBusy] = useState(false)
  const [dlgError, setDlgError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [p, u] = await Promise.all([fetchEmployees(), fetchUnknownCards()])
      setPeople(p); setUnknown(u); setError(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(() => fetchUnknownCards().then(setUnknown).catch(() => {}), 4000)
    return () => clearInterval(t)
  }, [load])

  // /people?assign=UID  (from the Today page "Assign" button)
  useEffect(() => {
    const uid = new URLSearchParams(window.location.search).get('assign')
    if (uid) openAssign(uid, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function openAssign(uid: string, fromUnknown: boolean, employeeId = '') {
    setDlgError(null)
    setCardFor({ uid, employeeId, newName: '', label: '', claim: true, fromUnknown })
  }

  async function submitEmployee() {
    if (!empForm || !empForm.name.trim()) return
    setBusy(true); setDlgError(null)
    try {
      await saveEmployee(empForm)
      setEmpForm(null)
      await load()
    } catch (e: any) { setDlgError(e.message) } finally { setBusy(false) }
  }

  async function submitCard() {
    if (!cardFor) return
    setBusy(true); setDlgError(null)
    try {
      let employeeId = cardFor.employeeId
      if (employeeId === '__new') {
        if (!cardFor.newName.trim()) throw new Error('Enter the new person’s name')
        employeeId = (await saveEmployee({ name: cardFor.newName })).id
      }
      if (!employeeId) throw new Error('Choose who this card belongs to')
      const uid = normaliseUid(cardFor.uid)
      await addCard(uid, employeeId, cardFor.label)
      if (cardFor.fromUnknown && cardFor.claim) await claimUnknownTaps(uid, todayLocal())
      setCardFor(null)
      if (window.location.search) window.history.replaceState(null, '', '/people')
      await load()
    } catch (e: any) { setDlgError(e.message) } finally { setBusy(false) }
  }

  async function act(fn: () => Promise<unknown>, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return
    try { await fn(); await load() } catch (e: any) { setError(e.message) }
  }

  const list = useMemo(() => {
    const s = q.trim().toLowerCase()
    return people.filter((p) =>
      (showInactive || p.active) &&
      (!s || p.name.toLowerCase().includes(s) || p.email?.toLowerCase().includes(s) ||
        p.zoho_emp_id?.toLowerCase().includes(s) || p.cards.some((c) => c.uid.toLowerCase().includes(s))))
  }, [people, q, showInactive])

  if (loading) return <PageLoader />

  return (
    <PageBody>
      <PageHeader
        title="People & cards"
        subtitle="Add employees, link their Zoho identity, and assign NFC cards. A person can have several cards."
        actions={<Button icon={<IconPlus className="h-4 w-4" />} onClick={() => { setDlgError(null); setEmpForm({ ...EMPTY }) }}>Add person</Button>}
      />
      {error && <ErrorBanner onRetry={load}>{error}</ErrorBanner>}

      {/* ---------- unregistered cards ---------- */}
      <Card className="mb-6">
        <CardHeader
          title="Unregistered cards"
          subtitle="Tap a new card on any reader — it appears here within a few seconds. Then assign it."
          actions={<Badge tone={unknown.length ? 'warn' : 'neutral'}>{unknown.length}</Badge>}
        />
        {unknown.length === 0 ? (
          <EmptyState icon={<IconInbox className="h-5 w-5" />} title="No unregistered cards" description="Every card that has been tapped belongs to someone." />
        ) : (
          <ul className="divide-y divide-line">
            {unknown.map((u) => (
              <li key={u.uid} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-ink">{u.uid}</p>
                  <p className="text-xs text-subtle">
                    {u.tap_count} tap{u.tap_count > 1 ? 's' : ''} · last {relativeTime(u.last_seen)} on {u.last_device ?? '—'}
                  </p>
                </div>
                <Button size="sm" onClick={() => openAssign(u.uid, true)}>Assign</Button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* ---------- employees ---------- */}
      <Card>
        <CardHeader
          title={`People (${list.length})`}
          actions={
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-muted">
                <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
                Show inactive
              </label>
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-subtle" />
                <input className="field h-9 w-44 pl-8" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
            </div>
          }
        />
        {list.length === 0 ? (
          <EmptyState icon={<IconUsers className="h-5 w-5" />} title="No people yet" description="Add your team, then assign cards." />
        ) : (
          <TableWrap>
            <thead>
              <tr><Th>Name</Th><Th>Zoho</Th><Th>Cards</Th><Th align="right">Actions</Th></tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <Tr key={p.id} className={p.active ? '' : 'opacity-60'}>
                  <Td>
                    <div className="font-medium">{p.name} {!p.active && <Badge className="ml-1">inactive</Badge>}</div>
                    {p.department && <div className="text-xs text-subtle">{p.department}</div>}
                  </Td>
                  <Td className="text-xs">
                    {p.zoho_emp_id ? <div>ID <span className="font-mono">{p.zoho_emp_id}</span></div> : null}
                    {p.email ? <div className="text-muted">{p.email}</div> : null}
                    {!p.zoho_emp_id && !p.email && <Badge tone="warn">not linked – won’t sync</Badge>}
                  </Td>
                  <Td>
                    <div className="flex flex-wrap gap-1.5">
                      {p.cards.map((c) => (
                        <span key={c.uid} className={`inline-flex items-center gap-1.5 rounded-md border border-line px-2 py-0.5 text-xs ${c.active ? '' : 'line-through opacity-60'}`}
                          title={`added ${fmtDateTime(c.created_at)}`}>
                          <span className="font-mono">{c.uid}</span>
                          {c.label && <span className="text-subtle">{c.label}</span>}
                          <button className="text-subtle hover:text-warn" title={c.active ? 'Disable card (lost?)' : 'Enable card'}
                            onClick={() => act(() => setCardActive(c.uid, !c.active))}>{c.active ? '⏸' : '▶'}</button>
                          <button className="text-subtle hover:text-danger" title="Remove card"
                            onClick={() => act(() => removeCard(c.uid), `Remove card ${c.uid} from ${p.name}?`)}>×</button>
                        </span>
                      ))}
                      <button className="rounded-md border border-dashed border-line px-2 py-0.5 text-xs text-muted hover:border-brand hover:text-brand"
                        onClick={() => openAssign('', false, p.id)}>+ card</button>
                    </div>
                  </Td>
                  <Td align="right" className="whitespace-nowrap">
                    <Button size="sm" variant="ghost" icon={<IconPencil className="h-3.5 w-3.5" />}
                      onClick={() => { setDlgError(null); setEmpForm({ id: p.id, name: p.name, email: p.email ?? '', zoho_emp_id: p.zoho_emp_id ?? '', department: p.department ?? '', active: p.active }) }}>
                      Edit
                    </Button>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </Card>

      {/* ---------- employee dialog ---------- */}
      <Dialog
        open={!!empForm}
        title={empForm?.id ? 'Edit person' : 'Add person'}
        onClose={() => setEmpForm(null)}
        footer={
          <>
            {empForm?.id && (
              <Button variant="ghost" className="mr-auto text-danger" onClick={async () => {
                if (!empForm.id || !confirm(`Delete ${empForm.name}? Their cards are removed too.`)) return
                try { await deleteEmployee(empForm.id); setEmpForm(null); await load() } catch (e: any) { setDlgError(e.message) }
              }}>Delete</Button>
            )}
            <Button variant="secondary" onClick={() => setEmpForm(null)}>Cancel</Button>
            <Button loading={busy} onClick={submitEmployee}>Save</Button>
          </>
        }
      >
        {dlgError && <ErrorBanner>{dlgError}</ErrorBanner>}
        {empForm && (
          <>
            <Field label="Full name"><input className="field" autoFocus value={empForm.name} onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })} /></Field>
            <Field label="Zoho People Employee ID" hint="Preferred. Zoho → Employee profile → Employee ID.">
              <input className="field font-mono" value={empForm.zoho_emp_id} onChange={(e) => setEmpForm({ ...empForm, zoho_emp_id: e.target.value })} />
            </Field>
            <Field label="Zoho email" hint="Used when there is no Employee ID.">
              <input className="field" type="email" value={empForm.email} onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })} />
            </Field>
            <Field label="Department (optional)"><input className="field" value={empForm.department} onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" checked={empForm.active} onChange={(e) => setEmpForm({ ...empForm, active: e.target.checked })} />
              Active (inactive people’s taps are ignored)
            </label>
          </>
        )}
      </Dialog>

      {/* ---------- card dialog ---------- */}
      <Dialog
        open={!!cardFor}
        title={cardFor?.fromUnknown ? `Assign card ${cardFor.uid}` : 'Add card'}
        onClose={() => { setCardFor(null); if (window.location.search) window.history.replaceState(null, '', '/people') }}
        footer={
          <>
            <Button variant="secondary" onClick={() => setCardFor(null)}>Cancel</Button>
            <Button loading={busy} onClick={submitCard}>Assign</Button>
          </>
        }
      >
        {dlgError && <ErrorBanner>{dlgError}</ErrorBanner>}
        {cardFor && (
          <>
            {!cardFor.fromUnknown && (
              <Field label="Card UID" hint="Easiest: tap the card on a reader and use “Assign” under Unregistered cards. Or type the hex UID.">
                <input className="field font-mono uppercase" autoFocus value={cardFor.uid} onChange={(e) => setCardFor({ ...cardFor, uid: e.target.value })} placeholder="04A1B2C3D4E5F6" />
              </Field>
            )}
            <Field label="Belongs to">
              <select className="field" value={cardFor.employeeId} onChange={(e) => setCardFor({ ...cardFor, employeeId: e.target.value })}>
                <option value="">Choose a person…</option>
                <option value="__new">+ New person</option>
                {people.filter((p) => p.active).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </Field>
            {cardFor.employeeId === '__new' && (
              <Field label="New person’s name" hint="You can add their Zoho ID afterwards with Edit.">
                <input className="field" value={cardFor.newName} onChange={(e) => setCardFor({ ...cardFor, newName: e.target.value })} />
              </Field>
            )}
            <Field label="Label (optional)"><input className="field" placeholder="e.g. white card, keychain" value={cardFor.label} onChange={(e) => setCardFor({ ...cardFor, label: e.target.value })} /></Field>
            {cardFor.fromUnknown && (
              <label className="flex items-start gap-2 text-sm text-muted">
                <input type="checkbox" className="mt-1" checked={cardFor.claim} onChange={(e) => setCardFor({ ...cardFor, claim: e.target.checked })} />
                <span>Count this card’s earlier taps from today as attendance (e.g. they tapped in before you registered the card).</span>
              </label>
            )}
          </>
        )}
      </Dialog>
    </PageBody>
  )
}
