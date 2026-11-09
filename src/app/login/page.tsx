'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ThemeToggle from '@/components/ThemeToggle'
import { Button, Card, ErrorBanner, Field } from '@/components/ui'
import { IconCalendar } from '@/components/icons'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace('/today')
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setBusy(false)
    } else {
      router.replace('/today')
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-7 flex flex-col items-center text-center">
          <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white shadow-pop dark:text-[rgb(var(--c-canvas))]">
            <IconCalendar className="h-7 w-7" />
          </span>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Attendance Admin</h1>
          <p className="mt-1.5 text-sm text-muted">Sign in to manage people, cards and Zoho sync</p>
        </div>
        <Card className="p-6 sm:p-7">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <ErrorBanner>{error}</ErrorBanner>}
            <Field label="Email">
              <input type="email" required autoComplete="email" value={email}
                onChange={(e) => setEmail(e.target.value)} className="field" placeholder="you@company.com" />
            </Field>
            <Field label="Password">
              <input type="password" required autoComplete="current-password" value={password}
                onChange={(e) => setPassword(e.target.value)} className="field" placeholder="••••••••" />
            </Field>
            <Button type="submit" size="lg" loading={busy} className="w-full">
              {busy ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
