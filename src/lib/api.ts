import { supabase } from './supabase'
import { startOfLocalDay, todayLocal } from './time'
import type {
  Admin, AttendanceDay, Card, Device, Employee, EmployeeWithCards,
  Settings, Tap, UnknownCard, ZohoRun,
} from './types'

function check<T>(res: { data: T | null; error: any }): T {
  if (res.error) throw new Error(res.error.message ?? String(res.error))
  return res.data as T
}

/* ------------------------------ employees ------------------------------ */

export async function fetchEmployees(): Promise<EmployeeWithCards[]> {
  return check(
    await supabase.from('employees').select('*, cards(*)').order('name'),
  ) as EmployeeWithCards[]
}

export async function saveEmployee(e: Partial<Employee> & { name: string }): Promise<Employee> {
  const row = {
    name: e.name.trim(),
    email: e.email?.trim() || null,
    zoho_emp_id: e.zoho_emp_id?.trim() || null,
    department: e.department?.trim() || null,
    active: e.active ?? true,
  }
  if (e.id) {
    return check(await supabase.from('employees').update(row).eq('id', e.id).select().single())
  }
  return check(await supabase.from('employees').insert(row).select().single())
}

export async function deleteEmployee(id: string): Promise<void> {
  const { error } = await supabase.from('employees').delete().eq('id', id)
  if (error) {
    if (error.code === '23503') {
      throw new Error('This person has attendance history, so they can’t be deleted. Mark them inactive instead.')
    }
    throw new Error(error.message)
  }
}

/* -------------------------------- cards -------------------------------- */

export function normaliseUid(uid: string): string {
  return uid.replace(/[^0-9a-f]/gi, '').toUpperCase()
}

export async function addCard(uid: string, employeeId: string, label?: string): Promise<Card> {
  const clean = normaliseUid(uid)
  if (!/^[0-9A-F]{8,20}$/.test(clean)) throw new Error('UID must be 8–20 hex characters (e.g. 04A1B2C3)')
  const { data, error } = await supabase
    .from('cards')
    .insert({ uid: clean, employee_id: employeeId, label: label?.trim() || null })
    .select()
    .single()
  if (error) {
    if (error.code === '23505') throw new Error(`Card ${clean} is already assigned to someone.`)
    throw new Error(error.message)
  }
  return data as Card
}

export async function setCardActive(uid: string, active: boolean): Promise<void> {
  check(await supabase.from('cards').update({ active }).eq('uid', uid))
}

export async function removeCard(uid: string): Promise<void> {
  check(await supabase.from('cards').delete().eq('uid', uid))
}

export async function fetchUnknownCards(): Promise<UnknownCard[]> {
  return check(
    await supabase.from('unknown_cards').select('*').order('last_seen', { ascending: false }).limit(50),
  ) as UnknownCard[]
}

/** Re-classify earlier "unknown" taps of a just-registered card (from local day `fromDay`). */
export async function claimUnknownTaps(uid: string, fromDay: string): Promise<number> {
  return check(
    await supabase.rpc('admin_claim_unknown_taps', { p_uid: uid, p_since: startOfLocalDay(fromDay) }),
  ) as number
}

/* --------------------------------- taps -------------------------------- */

const TAP_SELECT = '*, employee:employees(name), device:devices(name)'

export async function fetchRecentTaps(limit = 30): Promise<Tap[]> {
  return check(
    await supabase.from('taps').select(TAP_SELECT).order('tapped_at', { ascending: false }).limit(limit),
  ) as Tap[]
}

export async function fetchTapsForDay(employeeId: string, day: string): Promise<Tap[]> {
  return check(
    await supabase.from('taps').select(TAP_SELECT)
      .eq('employee_id', employeeId).eq('work_day', day)
      .order('tapped_at'),
  ) as Tap[]
}

export async function countUnknownTapsSince(iso: string): Promise<number> {
  const { count, error } = await supabase
    .from('taps').select('id', { count: 'exact', head: true })
    .eq('status', 'unknown').gte('tapped_at', iso)
  if (error) throw new Error(error.message)
  return count ?? 0
}

/* ------------------------------ attendance ----------------------------- */

export async function fetchAttendance(fromDay: string, toDay: string, employeeId?: string): Promise<AttendanceDay[]> {
  let q = supabase.from('attendance_daily').select('*')
    .gte('day', fromDay).lte('day', toDay)
    .order('day', { ascending: false }).order('employee_name')
  if (employeeId) q = q.eq('employee_id', employeeId)
  return check(await q) as AttendanceDay[]
}

/* -------------------------------- devices ------------------------------ */

export async function fetchDevices(): Promise<Device[]> {
  return check(await supabase.from('devices').select('*').order('device_id')) as Device[]
}

export async function registerDevice(deviceId: string, name: string, email: string, location: string) {
  check(await supabase.rpc('admin_register_device', {
    p_device_id: deviceId, p_name: name, p_device_email: email, p_location: location || null,
  }))
}

export async function setDeviceActive(deviceId: string, active: boolean) {
  check(await supabase.from('devices').update({ active }).eq('device_id', deviceId))
}

export async function deleteDevice(deviceId: string) {
  check(await supabase.from('devices').delete().eq('device_id', deviceId))
}

/* --------------------------------- zoho -------------------------------- */

export async function fetchZohoRuns(limit = 20): Promise<ZohoRun[]> {
  return check(
    await supabase.from('zoho_sync_runs').select('*').order('ran_at', { ascending: false }).limit(limit),
  ) as ZohoRun[]
}

export async function fetchZohoTaps(filter: 'all' | 'pending' | 'problems', limit = 100): Promise<Tap[]> {
  let q = supabase.from('taps').select(TAP_SELECT).in('status', ['in', 'out'])
  if (filter === 'pending') q = q.is('zoho_synced_at', null)
  if (filter === 'problems') q = q.in('zoho_status', ['SKIPPED:no-zoho-id', 'ERROR', 'FAILED'])
  return check(await q.order('tapped_at', { ascending: false }).limit(limit)) as Tap[]
}

export async function zohoCounts(): Promise<{ pending: number; noId: number; errors: number; okToday: number }> {
  const head = { count: 'exact' as const, head: true }
  const todayStart = startOfLocalDay(todayLocal())
  const [p, n, e, o] = await Promise.all([
    supabase.from('taps').select('id', head).in('status', ['in', 'out']).is('zoho_synced_at', null),
    supabase.from('taps').select('id', head).eq('zoho_status', 'SKIPPED:no-zoho-id'),
    supabase.from('taps').select('id', head).in('zoho_status', ['ERROR', 'FAILED']),
    supabase.from('taps').select('id', head).eq('zoho_status', 'OK').gte('zoho_synced_at', todayStart),
  ])
  for (const r of [p, n, e, o]) if (r.error) throw new Error(r.error.message)
  return { pending: p.count ?? 0, noId: n.count ?? 0, errors: e.count ?? 0, okToday: o.count ?? 0 }
}

export async function runZohoSync(): Promise<any> {
  const { data, error } = await supabase.functions.invoke('zoho-attendance-sync', { body: { trigger: 'manual' } })
  if (error) {
    // FunctionsHttpError carries the response body
    const ctx: any = (error as any).context
    let detail = ''
    try { detail = ctx ? JSON.stringify(await ctx.json()) : '' } catch { /* ignore */ }
    throw new Error(`${error.message}${detail ? ` — ${detail}` : ''}`)
  }
  return data
}

export async function zohoRetry(kind: 'no-zoho-id' | 'error' | 'all'): Promise<number> {
  return check(await supabase.rpc('admin_zoho_retry', { p_kind: kind })) as number
}

/* ------------------------------- settings ------------------------------ */

export async function fetchSettings(): Promise<Settings> {
  return check(await supabase.from('settings').select('*').eq('id', 1).single()) as Settings
}

export async function saveSettings(s: Pick<Settings, 'debounce_seconds' | 'late_after' | 'zoho_enabled'>) {
  check(await supabase.from('settings').update(s).eq('id', 1))
}

export async function fetchAdmins(): Promise<Admin[]> {
  return check(await supabase.from('admins').select('*').order('email')) as Admin[]
}

export async function addAdmin(email: string) {
  check(await supabase.from('admins').insert({ email: email.trim().toLowerCase() }))
}

export async function removeAdmin(email: string) {
  check(await supabase.from('admins').delete().eq('email', email))
}

/** True when the signed-in user is listed in public.admins (RLS hides everything otherwise). */
export async function amIAdmin(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_admin')
  return !error && data === true
}
