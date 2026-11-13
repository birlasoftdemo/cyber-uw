import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase } from '../types'
import { formatPolicyDate, policyPeriodForCase } from '../utils/policyPeriod'
import { splitAddress } from '../utils/postalAddress'

function money(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function compactLimit(n: number) {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000
    return `$${millions.toFixed(1)}M`
  }
  return money(n)
}

function priorityFor(tier: number) {
  if (tier <= 2) return 'Standard'
  if (tier === 3) return 'Elevated'
  return 'High'
}

function layerStatus(c: CyberCase) {
  if (c.pasStatus === 'synced') return 'Synced'
  switch (c.decision) {
    case 'quote':
      return 'Quoted'
    case 'refer':
      return 'Refer'
    case 'decline':
      return 'Decline'
    case 'pending':
      return 'Prequal'
    default: {
      const neverDecision: never = c.decision
      return neverDecision
    }
  }
}

export function PolicyAdminSyncPanel({ c }: { c: CyberCase }) {
  const pushToPas = useCyberUwStore((s) => s.pushToPas)
  const underwriter = useAuthStore((s) => s.user?.name) ?? 'Underwriter'
  const [open, setOpen] = useState(true)
  const synced = c.pasStatus === 'synced'
  const status = layerStatus(c)
  const period = policyPeriodForCase(c)
  const premium = c.financialSignOff?.stubPremiumUsd ?? Math.round(c.limitRequestedUsd * 0.012)
  const attachment = c.financialSignOff?.sirUsd
  const location = splitAddress(c.insuredAddress).office

  const fields: [string, string][] = [
    ['Named insured', c.insured],
    ['Broker', c.broker],
    ['Line of business', c.lobName],
    ['Effective date', formatPolicyDate(period.startIso)],
    ['Limits', compactLimit(c.limitRequestedUsd)],
    ['Premium', money(premium)],
    ['Priority', priorityFor(c.tier)],
    ['Underwriter', underwriter],
    ['Attachment', attachment == null ? '—' : money(attachment)],
    ['UW reference', c.id],
    ['Unique viewer reference (UUID)', c.id],
    ['Location', location],
  ]

  return (
    <div className="pas-sheet">
      <div className="pas-sheet__bar">
        <span className="pas-sheet__layer">Layer {c.id}</span>
        <span className="pas-sheet__status">{status}</span>
        <button type="button" disabled={synced} onClick={() => pushToPas(c.id)}>
          {synced ? 'Synced' : 'Confirm sync'}
        </button>
      </div>
      <section className="pas-refs">
        <button type="button" className="pas-refs__bar" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span>References</span>
          <ChevronDown size={16} className={open ? 'is-open' : ''} aria-hidden />
        </button>
        {open ? (
          <dl>
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || '—'}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </section>
      <p className="pas-sheet__note">
        Lock the human decision above, then confirm sync to push {status} to policy center.
      </p>
    </div>
  )
}
