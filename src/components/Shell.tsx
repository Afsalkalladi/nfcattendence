'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { amIAdmin } from '@/lib/api'
import ThemeToggle from '@/components/ThemeToggle'
import { Button, Card, Spinner, cx } from '@/components/ui'
import {
  IconActivity,
  IconCalendar,
  IconUsers,
  IconChip,
  IconSync,
  IconShield,
  IconSignOut,
} from '@/components/icons'

const NAV = [
  { href: '/today', label: 'Today', Icon: IconActivity },
  { href: '/attendance', label: 'Attendance', Icon: IconCalendar },
  { href: '/people', label: 'People', Icon: IconUsers },
  { href: '/devices', label: 'Readers', Icon: IconChip },
  { href: '/zoho', label: 'Zoho', Icon: IconSync },
  { href: '/settings', label: 'Settings', Icon: IconShield },
]

/**
 * Auth guard + navigation for every admin page.
 * Real enforcement is RLS in the database; this is the UX layer.
 */
export default function Shell({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<'checking' | 'ok' | 'not-admin'>('checking')
  const [email, setEmail] = useState<string | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace('/login')
        return
      }
      setEmail(data.session.user.email ?? null)
      setState((await amIAdmin()) ? 'ok' : 'not-admin')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace('/login')
    })
    return () => sub.subscription.unsubscribe()
  }, [router])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (state === 'checking') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-muted">
        <Spinner className="h-7 w-7 text-brand" />
        <p className="text-sm">Checking session…</p>
      </div>
    )
  }

  if (state === 'not-admin') {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md p-6 text-center">
          <h1 className="text-lg font-semibold text-ink">Not an admin</h1>
          <p className="mt-2 text-sm text-muted">
            <span className="font-mono">{email}</span> is signed in but isn’t listed in the
            <span className="font-mono"> admins</span> table. Ask an existing admin to add you
            under Settings, or insert the email in Supabase.
          </p>
          <Button className="mt-5" variant="secondary" onClick={signOut}>Sign out</Button>
        </Card>
      </div>
    )
  }

  const isActive = (href: string) => pathname?.startsWith(href)

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/80 backdrop-blur-xl supports-[backdrop-filter]:bg-surface/65">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/today" className="focus-ring flex shrink-0 items-center gap-2.5 rounded-lg py-1 pr-1">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand text-white shadow-sm dark:text-[rgb(var(--c-canvas))]">
              <IconCalendar className="h-[18px] w-[18px]" />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-sm font-semibold tracking-tight text-ink">Attendance</span>
              <span className="mt-0.5 hidden text-[10px] font-medium uppercase tracking-widest text-subtle sm:block">
                NFC · Zoho
              </span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? 'page' : undefined}
                className={cx(
                  'focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                  isActive(href) ? 'bg-brand-soft text-brand' : 'text-muted hover:bg-elevated hover:text-ink',
                )}
              >
                <Icon className="h-[17px] w-[17px]" />
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {email && <span className="hidden max-w-[18ch] truncate text-xs text-subtle lg:block">{email}</span>}
            <ThemeToggle />
            <button
              onClick={signOut}
              title="Sign out"
              className="focus-ring flex h-9 items-center gap-2 rounded-lg border border-line px-2.5 text-sm font-medium text-muted transition hover:border-danger/40 hover:bg-danger-soft hover:text-danger sm:px-3"
            >
              <IconSignOut className="h-[17px] w-[17px]" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-6">
          {NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? 'page' : undefined}
              className={cx(
                'flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition',
                isActive(href) ? 'text-brand' : 'text-subtle active:text-ink',
              )}
            >
              <span className={cx('grid h-7 w-10 place-items-center rounded-full transition', isActive(href) && 'bg-brand-soft')}>
                <Icon className="h-[18px] w-[18px]" />
              </span>
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
