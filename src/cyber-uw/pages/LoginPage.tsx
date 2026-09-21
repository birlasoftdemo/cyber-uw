import { Alert, Button, Card, Input, Label, TextField, Typography } from '@heroui/react'
import { LogIn, Shield } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { BirlasoftLogo } from '../components/BirlasoftLogo'

function GoogleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function OutlookIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
      <path fill="#0078D4" d="M24 7.5v9l-5.5 3.25L13 16.5V7.5l5.5-3.25L24 7.5z" />
      <path fill="#28A8EA" d="M13 7.5v9l-5.5 3.25L2 16.5V7.5l5.5-3.25L13 7.5z" />
      <path fill="#0364B8" d="M13 4.25 7.5 7.5 2 4.25 7.5 1 13 4.25z" />
      <path fill="#0078D4" d="M10.5 12a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0z" />
      <path fill="#fff" d="M7 12a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5z" />
    </svg>
  )
}

export function LoginPage() {
  const { login, loginWithSso, loginError } = useAuthStore()
  const [email, setEmail] = useState('uw@cyber.internal')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    login(email, password)
  }

  return (
    <div className="flex min-h-screen">
      <aside className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-900 md:flex md:flex-col md:justify-between md:p-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, rgba(59,130,246,0.45) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(99,102,241,0.35) 0%, transparent 45%), linear-gradient(110deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
          }}
        />
        <div className="relative z-10 self-start">
          <BirlasoftLogo />
        </div>
        <div className="relative z-10 max-w-md space-y-4">
          <Typography.Heading level={2} className="text-white">
            Cyber Underwriting Dashboard
          </Typography.Heading>
          <Typography.Paragraph className="text-lg font-semibold text-slate-200">
            Manage form submissions, run decision workflows, and track cyber portfolio
            insights in one place.
          </Typography.Paragraph>
          <div className="flex items-center gap-2 text-lg text-blue-200">
            <Shield size={16} className="shrink-0" />
            <span>Reliable, Secure and Compliant</span>
          </div>
        </div>
        <Typography.Paragraph size="xs" className="relative z-10 text-slate-500">
          © Birlasoft · Cyber underwriting operations
        </Typography.Paragraph>
      </aside>

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-100 px-4 py-10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 60% at 20% 10%, rgba(37,99,235,0.16) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 90% 90%, rgba(29,78,216,0.14) 0%, transparent 50%), linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.4) 50%, transparent 65%)',
          }}
        />

        <div className="relative z-10 mb-8 text-center md:hidden">
          <BirlasoftLogo className="mx-auto mb-4" />
          <Typography.Heading level={4}>Cyber Underwriting Dashboard</Typography.Heading>
          <Typography.Paragraph color="muted" size="xs" className="mt-1">
            Sign in to continue
          </Typography.Paragraph>
        </div>

        <Card className="relative z-10 w-full max-w-md border border-blue-200/70 bg-white/95 p-8 shadow-[0_24px_48px_rgba(37,99,235,0.14)] backdrop-blur-sm">
          <div className="mb-7 hidden md:block">
            <BirlasoftLogo className="mb-7" />
            <Typography.Heading level={3} className="tracking-tight text-slate-950">
              Sign in
            </Typography.Heading>
            <Typography.Paragraph size="xs" className="mt-1 font-medium text-slate-600">
              UW: uw@cyber.internal / uw123 · Ops: ops@cyber.internal / ops123
            </Typography.Paragraph>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField fullWidth>
              <Label>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground,#64748b)]">
                  Email
                </span>
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@cyber.internal"
                autoComplete="username"
              />
            </TextField>

            <TextField fullWidth>
              <Label>
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground,#64748b)]">
                  Password
                </span>
              </Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </TextField>

            {loginError ? (
              <Alert status="danger">
                <Alert.Indicator />
                <Alert.Content>
                  <Alert.Description>{loginError}</Alert.Description>
                </Alert.Content>
              </Alert>
            ) : null}

            <Button type="submit" variant="primary" fullWidth className="mt-2">
              <LogIn size={16} />
              Sign in
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-xs text-slate-500">or</span>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onPress={() => loginWithSso('outlook')}
            >
              <OutlookIcon />
              Sign in with Outlook
            </Button>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onPress={() => loginWithSso('google')}
            >
              <GoogleIcon />
              Sign in with Google
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
