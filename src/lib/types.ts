export type TapStatus = 'in' | 'out' | 'debounced' | 'unknown' | 'inactive'

export interface Employee {
  id: string
  name: string
  email: string | null
  zoho_emp_id: string | null
  department: string | null
  active: boolean
  created_at: string
}

export interface Card {
  uid: string
  employee_id: string
  label: string | null
  active: boolean
  created_at: string
}

export interface EmployeeWithCards extends Employee {
  cards: Card[]
}

export interface Tap {
  id: number
  device_id: string | null
  uid: string
  tapped_at: string
  received_at: string
  source: 'live' | 'offline'
  employee_id: string | null
  work_day: string | null
  status: TapStatus
  zoho_status: string | null
  zoho_synced_at: string | null
  zoho_attempts: number
  zoho_error: string | null
  employee?: { name: string } | null
  device?: { name: string | null } | null
}

export interface AttendanceDay {
  employee_id: string
  employee_name: string
  day: string
  first_in: string | null
  last_out: string | null
  taps: number
  worked_seconds: number
  still_in: boolean
  late: boolean
}

export interface UnknownCard {
  uid: string
  tap_count: number
  first_seen: string
  last_seen: string
  last_device: string | null
}

export interface Device {
  device_id: string
  name: string | null
  location: string | null
  auth_user_id: string | null
  active: boolean
  firmware_version: string | null
  ip: string | null
  mac: string | null
  wifi_rssi: number | null
  uptime_s: number | null
  free_heap: number | null
  reader_ok: boolean | null
  queue_len: number | null
  last_seen_at: string | null
  created_at: string
}

export interface Settings {
  id: 1
  timezone: string
  debounce_seconds: number
  late_after: string
  zoho_enabled: boolean
  updated_at: string
}

export interface Admin {
  email: string
  created_at: string
}

export interface ZohoRun {
  id: number
  ran_at: string
  trigger: string
  sent: number
  ok: boolean
  http_status: number | null
  message: string | null
}
