import * as React from 'react'

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export type Tone = 'neutral' | 'brand' | 'ok' | 'warn' | 'danger' | 'info'

const TONE_SOFT: Record<Tone, string> = {
  neutral: 'bg-elevated text-muted ring-1 ring-inset ring-line',
  brand: 'bg-brand-soft text-brand ring-1 ring-inset ring-brand/25',
  ok: 'bg-ok-soft text-ok ring-1 ring-inset ring-ok/25',
  warn: 'bg-warn-soft text-warn ring-1 ring-inset ring-warn/30',
  danger: 'bg-danger-soft text-danger ring-1 ring-inset ring-danger/25',
  info: 'bg-info-soft text-info ring-1 ring-inset ring-info/25',
}

/* ------------------------------------------------------------------ */
/* buttons                                                             */
/* ------------------------------------------------------------------ */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft'
export type ButtonSize = 'sm' | 'md' | 'lg'

const VARIANT: Record<ButtonVariant, string> = {
  primary:
    'bg-brand text-white shadow-sm hover:bg-brand-hover active:translate-y-px dark:text-[rgb(var(--c-canvas))]',
  secondary:
    'bg-surface text-ink border border-line hover:bg-elevated hover:border-line-strong active:translate-y-px',
  ghost: 'text-muted hover:bg-elevated hover:text-ink',
  danger:
    'bg-danger text-white shadow-sm hover:bg-danger-hover active:translate-y-px dark:text-[rgb(var(--c-canvas))]',
  soft: 'bg-brand-soft text-brand hover:brightness-95 dark:hover:brightness-125 active:translate-y-px',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
}

export function btn(variant: ButtonVariant = 'primary', size: ButtonSize = 'md') {
  return cx(
    'focus-ring inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANT[variant],
    SIZE[size],
  )
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cx(btn(variant, size), className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : icon}
      {children}
    </button>
  )
}

/* ------------------------------------------------------------------ */
/* surfaces                                                            */
/* ------------------------------------------------------------------ */

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        'rounded-2xl border border-line bg-surface shadow-card',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  eyebrow?: React.ReactNode
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-1.5 text-xs font-medium uppercase tracking-widest text-subtle">
            {eyebrow}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </header>
  )
}

/** Standard page container: consistent gutters + max width on every screen. */
export function PageBody({
  children,
  width = 'wide',
}: {
  children: React.ReactNode
  width?: 'wide' | 'narrow'
}) {
  return (
    <main
      className={cx(
        'mx-auto w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8',
        width === 'wide' ? 'max-w-7xl' : 'max-w-5xl',
      )}
    >
      <div className="animate-fade-in">{children}</div>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/* badges & status                                                     */
/* ------------------------------------------------------------------ */

export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
}: {
  tone?: Tone
  dot?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium',
        TONE_SOFT[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export function StatusDot({ online }: { online: boolean }) {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      {online && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ok opacity-60" />
      )}
      <span
        className={cx(
          'relative inline-flex h-2 w-2 rounded-full',
          online ? 'bg-ok' : 'bg-subtle',
        )}
      />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* feedback                                                            */
/* ------------------------------------------------------------------ */

export function Spinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={cx('animate-spin', className)} viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"
      />
    </svg>
  )
}

export function PageLoader({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted">
      <Spinner className="h-7 w-7 text-brand" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorBanner({
  children,
  onRetry,
}: {
  children: React.ReactNode
  onRetry?: () => void
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
      <div className="flex items-start gap-2">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="mt-0.5 h-4 w-4 shrink-0"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16.5v.01" />
        </svg>
        <span>{children}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="focus-ring rounded-md px-2 py-1 text-xs font-semibold underline underline-offset-2"
        >
          Retry
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cx(
        'flex flex-col items-center justify-center px-6 py-14 text-center',
        className,
      )}
    >
      {icon && (
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-elevated text-subtle">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* tables — desktop only; pair with a card list on mobile              */
/* ------------------------------------------------------------------ */

export function TableWrap({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cx('-mx-px overflow-x-auto', className)}>
      <table className="w-full min-w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function Th({
  children,
  align = 'left',
  className,
}: {
  children?: React.ReactNode
  align?: 'left' | 'right' | 'center'
  className?: string
}) {
  return (
    <th
      scope="col"
      className={cx(
        'whitespace-nowrap bg-elevated/70 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-subtle first:pl-5 last:pr-5',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
        className,
      )}
    >
      {children}
    </th>
  )
}

export function Td({
  children,
  align = 'left',
  className,
  ...rest
}: React.TdHTMLAttributes<HTMLTableCellElement> & {
  align?: 'left' | 'right' | 'center'
}) {
  return (
    <td
      className={cx(
        'px-4 py-3 align-middle text-ink first:pl-5 last:pr-5',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        className,
      )}
      {...rest}
    >
      {children}
    </td>
  )
}

export function Tr({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cx('border-t border-line transition hover:bg-elevated/60', className)}
      {...rest}
    >
      {children}
    </tr>
  )
}

/* ------------------------------------------------------------------ */
/* forms                                                               */
/* ------------------------------------------------------------------ */

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label?: React.ReactNode
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <label className={cx('block', className)}>
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      )}
      {children}
      {hint && <span className="mt-1 block text-xs text-subtle">{hint}</span>}
    </label>
  )
}

/* ------------------------------------------------------------------ */
/* data display                                                        */
/* ------------------------------------------------------------------ */

/** Small labelled value used across the health panels. */
export function Metric({
  label,
  value,
  tone,
  mono = false,
}: {
  label: React.ReactNode
  value: React.ReactNode
  tone?: Tone
  mono?: boolean
}) {
  const toneText: Record<Tone, string> = {
    neutral: 'text-ink',
    brand: 'text-brand',
    ok: 'text-ok',
    warn: 'text-warn',
    danger: 'text-danger',
    info: 'text-info',
  }
  return (
    <div className="flex items-baseline justify-between gap-3 py-1">
      <span className="text-xs text-muted">{label}</span>
      <span
        className={cx(
          'text-xs font-semibold tabular-nums',
          mono && 'font-mono',
          tone ? toneText[tone] : 'text-ink',
        )}
      >
        {value}
      </span>
    </div>
  )
}

export function Progress({
  value,
  tone = 'brand',
}: {
  value: number
  tone?: Tone
}) {
  const bar: Record<Tone, string> = {
    neutral: 'bg-subtle',
    brand: 'bg-brand',
    ok: 'bg-ok',
    warn: 'bg-warn',
    danger: 'bg-danger',
    info: 'bg-info',
  }
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated ring-1 ring-inset ring-line">
      <div
        className={cx('h-full rounded-full transition-[width] duration-500', bar[tone])}
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  )
}

/** Headline number card used on the devices index and device detail. */
export function Stat({
  label,
  value,
  hint,
  icon,
  tone = 'neutral',
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  icon?: React.ReactNode
  tone?: Tone
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-subtle">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {value}
          </p>
          {hint && <p className="mt-1 truncate text-xs text-muted">{hint}</p>}
        </div>
        {icon && (
          <div
            className={cx(
              'grid h-9 w-9 shrink-0 place-items-center rounded-xl',
              TONE_SOFT[tone],
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}
