import { Mail, Phone } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import type { CyberCase } from '../types'
import { formatPolicyDate, policyPeriodForCase } from '../utils/policyPeriod'

function money(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function premiumFor(c: CyberCase) {
  return c.financialSignOff?.stubPremiumUsd ?? Math.round(c.limitRequestedUsd * 0.012)
}

function priorityFor(tier: number) {
  if (tier <= 2) return 'Standard'
  if (tier === 3) return 'Elevated'
  return 'High'
}

function brokerContact(broker: string): { email: string; phone: string } {
  const name = broker.toLowerCase()
  if (name.includes('aon')) return { email: 'priya.shah@aon.com', phone: '+1 212 555 0148' }
  if (name.includes('wtw') || name.includes('willis')) {
    return { email: 'sam.chen@wtwco.com', phone: '+1 212 555 0194' }
  }
  if (name.includes('howden')) return { email: 'casey.nguyen@howden.com', phone: '+1 212 555 0160' }
  if (name.includes('meridian')) return { email: 'alex.morgan@meridianrisk.com', phone: '+1 415 555 0172' }
  return { email: 'jordan.lee@marsh.com', phone: '+1 3837 191983' }
}

export function NewSubmissionOverview({ c }: { c: CyberCase }) {
  const underwriter = useAuthStore((s) => s.user?.name) ?? 'Underwriter'
  const period = policyPeriodForCase(c)
  const premium = premiumFor(c)
  const businessType = c.submissionKind === 'renewal' ? 'Renewal' : 'Primary'
  const contact = brokerContact(c.broker)

  const points: [string, string][] = [
    ['Insured Parties', c.insured],
    ['Coverage Period', `${formatPolicyDate(period.startIso)} to ${formatPolicyDate(period.endIso)}`],
    ['Coverage Territory', c.insuredAddress],
    ['Currency', 'USD'],
    ['Coverage Details', `${money(c.limitRequestedUsd)} aggregate · ${c.productName}`],
    ['Sum Insured', money(c.limitRequestedUsd)],
    ['Additional Benefits', c.dossierSummary || c.companyDescription || c.sector],
  ]

  return (
    <section className="ns-overview">
      <header className="ns-overview__head">
        <h4>Submission Overview</h4>
      </header>
      <div className="ns-overview__hero">
        <div>
          <p className="ns-overview__name">{c.insured}</p>
          <p className="ns-overview__meta">
            <span>Line of Business: {c.lobName}</span>
            <span>Location: {c.insuredAddress}</span>
            <span>Business Type: {businessType}</span>
          </p>
        </div>
        <div>
          <p className="ns-overview__kicker">Total Premium</p>
          <p className="ns-overview__premium">{money(premium)}</p>
        </div>
        <div>
          <p className="ns-overview__kicker">Broker</p>
          <p className="ns-overview__broker">{c.broker}</p>
          <div className="ns-overview__contacts">
            <a className="ns-overview__contact" href={`mailto:${contact.email}`}>
              <Mail size={14} strokeWidth={2} aria-hidden />
              <span>{contact.email}</span>
            </a>
            <a className="ns-overview__contact" href={`tel:${contact.phone.replace(/\s+/g, '')}`}>
              <Phone size={14} strokeWidth={2} aria-hidden />
              <span>{contact.phone}</span>
            </a>
          </div>
        </div>
      </div>
      <dl className="ns-overview__facts">
        <div>
          <dt>Policy #</dt>
          <dd>{c.id}</dd>
        </div>
        <div>
          <dt>Premium</dt>
          <dd>{money(premium)}</dd>
        </div>
        <div>
          <dt>Priority</dt>
          <dd>{priorityFor(c.tier)}</dd>
        </div>
        <div>
          <dt>Effective Date</dt>
          <dd>{formatPolicyDate(period.startIso)}</dd>
        </div>
        <div>
          <dt>Underwriter</dt>
          <dd>{underwriter}</dd>
        </div>
      </dl>
      <div className="ns-overview__points">
        <div className="ns-overview__points-head">
          <h5>Key Points of the Submission</h5>
          <span>(Gen AI Based)</span>
        </div>
        <dl>
          {points.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
