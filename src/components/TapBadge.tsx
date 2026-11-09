import { Badge, type Tone } from '@/components/ui'
import type { TapStatus } from '@/lib/types'

const MAP: Record<TapStatus, { tone: Tone; label: string }> = {
  in: { tone: 'ok', label: 'In' },
  out: { tone: 'info', label: 'Out' },
  debounced: { tone: 'neutral', label: 'Double tap' },
  unknown: { tone: 'warn', label: 'Unregistered' },
  inactive: { tone: 'danger', label: 'Inactive' },
}

export function TapBadge({ status }: { status: TapStatus }) {
  const m = MAP[status] ?? { tone: 'neutral' as Tone, label: status }
  return <Badge tone={m.tone} dot>{m.label}</Badge>
}

export function ZohoBadge({ status }: { status: string | null }) {
  if (!status) return <Badge tone="brand">Queued</Badge>
  if (status === 'OK') return <Badge tone="ok">Sent</Badge>
  if (status === 'SKIPPED:no-zoho-id') return <Badge tone="warn">No Zoho ID</Badge>
  if (status === 'ERROR') return <Badge tone="danger">Zoho error</Badge>
  if (status === 'FAILED') return <Badge tone="danger">Failed</Badge>
  return <Badge>{status.replace('SKIPPED:', 'Skipped: ')}</Badge>
}
