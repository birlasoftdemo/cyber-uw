import { ToastProvider } from '@heroui/react'
import { CyberUwShell } from './cyber-uw/CyberUwShell'
import { BrokerFormPreviewPage } from './cyber-uw/pages/BrokerFormPreviewPage'
import { LoginPage } from './cyber-uw/pages/LoginPage'
import { useAuthStore } from './cyber-uw/store/authStore'

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

export default function App() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  if (typeof window !== 'undefined' && isBrokerPreviewPath(window.location.pathname)) {
    return (
      <>
        <ToastProvider placement="bottom end" />
        <BrokerFormPreviewPage />
      </>
    )
  }

  return (
    <>
      <ToastProvider placement="bottom end" />
      {isAuthenticated ? <CyberUwShell /> : <LoginPage />}
    </>
  )
}
