import { ToastProvider } from '@heroui/react'
import { useEffect } from 'react'
import { CyberUwShell } from './cyber-uw/CyberUwShell'
import { BrokerFormPreviewPage } from './cyber-uw/pages/BrokerFormPreviewPage'
import { LoginPage } from './cyber-uw/pages/LoginPage'
import { useAuthStore } from './cyber-uw/store/authStore'
import { ConsoleV2Shell } from './pages/console-v2/ConsoleV2Shell'
import { useConsoleV2Store } from './store/consoleV2Store'

function stripBase(pathname: string) {
  const base = import.meta.env.BASE_URL
  let path = pathname
  if (base && base !== '/') {
    const prefix = base.replace(/\/+$/, '')
    if (path.startsWith(prefix)) path = path.slice(prefix.length) || '/'
  }
  return path.replace(/\/+$/, '') || '/'
}

function isBrokerPreviewPath(pathname: string) {
  const path = stripBase(pathname)
  return path === '/broker' || path === '/broker/form' || path === '/preview/broker'
}

function AppContent() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const appScreen = useAuthStore((s) => s.appScreen)

  if (!isAuthenticated) {
    return <LoginPage />
  }

  if (appScreen === 'admin') {
    return <ConsoleV2Shell />
  }

  return <CyberUwShell />
}

export default function App() {
  const hydrate = useAuthStore((s) => s.hydrate)
  const hydrateConsoleV2 = useConsoleV2Store((s) => s.hydrate)

  useEffect(() => {
    hydrate()
    hydrateConsoleV2()
  }, [hydrate, hydrateConsoleV2])

  if (typeof window !== 'undefined' && isBrokerPreviewPath(window.location.pathname)) {
    return (
      <>
        <ToastProvider placement="bottom end" maxVisibleToasts={4} />
        <BrokerFormPreviewPage />
      </>
    )
  }

  return (
    <>
      <ToastProvider placement="bottom end" maxVisibleToasts={4} />
      <AppContent />
    </>
  )
}
