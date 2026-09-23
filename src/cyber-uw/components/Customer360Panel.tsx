import { Typography } from '@heroui/react'
import {
  Building2,
  CalendarCheck2,
  CalendarRange,
  CircleDollarSign,
  GitBranch,
  Handshake,
  Hash,
  Landmark,
  Layers,
  MapPin,
  Package,
  Percent,
  RefreshCw,
  Sparkles,
  Tag,
  Timer,
} from 'lucide-react'
import type { CyberCase } from '../types'
import { missingDocsForCase } from '../utils/missingDocs'
import { buildC360AiSummary } from '../utils/c360AiSummary'
import { formatPolicyDate, policyPeriodForCase } from '../utils/policyPeriod'
import { BirlasoftCustomer360Mark } from './BirlasoftCustomer360Mark'

function money(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

interface Props {
  c: CyberCase
}

export function Customer360Panel({ c }: Props) {
  const missing = missingDocsForCase(c)
  const aiSummary = buildC360AiSummary(c)
  const period = policyPeriodForCase(c)

  const kpis = [
    { icon: MapPin, label: 'Address', value: c.insuredAddress },
    { icon: Package, label: 'Product name', value: c.productName },
    { icon: Hash, label: 'Product code', value: c.productCode },
    { icon: Layers, label: 'LOB code', value: c.lobCode },
    { icon: Tag, label: 'LOB name', value: c.lobName },
    { icon: GitBranch, label: 'Product version', value: c.productVersion },
    { icon: Timer, label: 'Product tenure', value: c.productTenure },
    {
      icon: RefreshCw,
      label: 'Renewal applicable',
      value: c.renewalApplicable ? 'Yes' : 'No',
    },
    { icon: Building2, label: 'Sector', value: c.sector },
    { icon: Handshake, label: 'Broker', value: c.broker },
    { icon: Landmark, label: 'Limit requested', value: money(c.limitRequestedUsd) },
    { icon: CircleDollarSign, label: 'Revenue', value: money(c.revenueUsd) },
    {
      icon: CalendarRange,
      label: 'Proposed start date',
      value: formatPolicyDate(period.startIso),
    },
    {
      icon: CalendarCheck2,
      label: 'Proposed end date',
      value: formatPolicyDate(period.endIso),
    },
    { icon: Percent, label: 'Completeness', value: `${c.completenessPct}%` },
    {
      icon: Sparkles,
      label: 'Signal score',
      value: String(c.signalScore),
    },
  ]

  return (
    <div className="cuw-c360" id="cuw-c360-root">
      <BirlasoftCustomer360Mark />

      <Typography.Heading level={2} className="cuw-c360__insured">
        {c.insured}
      </Typography.Heading>

      <section className="cuw-c360-ai-summary" aria-label="AI summary">
        <header className="cuw-c360-ai-summary__head">
          <h3 className="cuw-c360-ai-summary__title">AI summary</h3>
          <Sparkles className="cuw-c360-ai-summary__spark" size={16} strokeWidth={1.75} aria-hidden />
        </header>
        <p className="cuw-c360-ai-summary__body">{aiSummary.paragraph}</p>
      </section>

      <dl className="cuw-c360__kpis">
        {kpis.map((row) => (
          <div key={row.label} className="cuw-c360-kpi">
            <dt className="cuw-c360-kpi__label">
              <span className="cuw-c360-kpi__glyph" aria-hidden>
                <row.icon size={13} strokeWidth={1.9} />
              </span>
              {row.label}
            </dt>
            <dd className="cuw-c360-kpi__value">{row.value}</dd>
          </div>
        ))}
      </dl>

      {missing.length > 0 ? (
        <section className="cuw-c360__glass cuw-c360__glass--warn">
          <h3>Open checklist items</h3>
          <ul className="mt-2 list-inside list-disc text-sm">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
