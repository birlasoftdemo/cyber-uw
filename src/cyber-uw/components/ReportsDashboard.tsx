import { MoreHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase, GapSeverity, ReferralStatus, ReferralTicket } from '../types'

type ReportTab = 'dashboard' | 'risks' | 'tasks'
type StatusId =
  | 'received'
  | 'risk'
  | 'quoting'
  | 'quoted'
  | 'dataEntry'
  | 'signoff'
  | 'complete'
type TaskId =
  | 'compliance'
  | 'authority'
  | 'lic'
  | 'modelling'
  | 'peer'
  | 'policy'
  | 'pricing'
  | 'toba'
type RiskDisposition = 'open' | 'referred'
type RiskSortKey = 'reference' | 'inception' | 'severity' | 'insured' | 'broker'

interface RiskRow {
  key: string
  caseId: string
  control: string
  severity: GapSeverity
  disposition: RiskDisposition
  insured: string
  broker: string
  lobName: string
  productCode: string
  productName: string
  sector: string
  submissionKind: CyberCase['submissionKind']
  inceptionIso: string
  inceptionLabel: string
}

const STATUSES: { id: StatusId; label: string; color: string }[] = [
  { id: 'received', label: 'Submission Received', color: '#c5cad3' },
  { id: 'risk', label: 'Submission Risk Assessment', color: '#3ec6e0' },
  { id: 'quoting', label: 'Quote in Progress', color: '#9aa3ad' },
  { id: 'quoted', label: 'Quoted', color: '#24306e' },
  { id: 'dataEntry', label: 'Live – Data Entry', color: '#e6c84a' },
  { id: 'signoff', label: 'Live – Underwriter Sign-off', color: '#7eb6f6' },
  { id: 'complete', label: 'Live – Underwriter Sign-off Complete', color: '#3cbf6e' },
]

const TASKS: { id: TaskId; label: string; color: string }[] = [
  { id: 'compliance', label: 'Compliance', color: '#e23d3d' },
  { id: 'authority', label: 'Delegated Underwriting Authority', color: '#1e2a78' },
  { id: 'lic', label: 'LIC', color: '#f0a03c' },
  { id: 'modelling', label: 'Modelling', color: '#3cbf6e' },
  { id: 'peer', label: 'Peer Review', color: '#2f3f9f' },
  { id: 'policy', label: 'Policy Entry', color: '#e6c84a' },
  { id: 'pricing', label: 'Pricing', color: '#7b4ea3' },
  { id: 'toba', label: 'TOBA', color: '#3ec6e0' },
]

function statusFor(c: CyberCase): StatusId | null {
  if (c.pasStatus === 'synced') return 'complete'
  switch (c.decision) {
    case 'quote':
      return 'quoted'
    case 'decline':
      return null
    case 'refer':
      return 'signoff'
    case 'pending':
      if (c.workflowStage <= 0) return 'received'
      if (c.workflowStage === 1) return 'risk'
      if (c.workflowStage === 2) return 'quoting'
      return 'dataEntry'
    default: {
      const neverDecision: never = c.decision
      return neverDecision
    }
  }
}

function taskCounts(cases: CyberCase[], referrals: ReferralTicket[]): Record<TaskId, number> {
  const counts: Record<TaskId, number> = {
    compliance: 0,
    authority: 0,
    lic: 0,
    modelling: 0,
    peer: 0,
    policy: 0,
    pricing: 0,
    toba: 0,
  }
  for (const c of cases) {
    counts.compliance += c.gaps.filter((gap) => gap.disposition === 'open').length
    counts.lic += c.appetiteHits.filter((hit) => hit.outcome === 'refer').length
    if (c.decision === 'pending' && c.tier >= 4) counts.authority += 1
    if (c.decision === 'pending' && c.workflowStage === 2) counts.modelling += 1
    if (c.decision === 'pending' && c.workflowStage >= 3 && !c.financialSignOff) counts.pricing += 1
    if (c.decision === 'quote' && c.pasStatus !== 'synced') counts.policy += 1
  }
  for (const ticket of referrals) {
    if (ticket.status === 'resolved') continue
    if (ticket.status === 'awaiting_broker' || ticket.target === 'broker') counts.toba += 1
    else counts.peer += 1
  }
  return counts
}

function isOpenTask(status: ReferralStatus) {
  switch (status) {
    case 'open':
    case 'awaiting_broker':
    case 'returned':
      return true
    case 'resolved':
      return false
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

function inceptionLabel(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function submissionTypeLabel(kind: CyberCase['submissionKind']) {
  switch (kind) {
    case 'new_business':
      return 'Submission'
    case 'renewal':
      return 'Renewal'
    default: {
      const neverKind: never = kind
      return neverKind
    }
  }
}

function severityRank(severity: GapSeverity) {
  switch (severity) {
    case 'critical':
      return 0
    case 'high':
      return 1
    case 'medium':
      return 2
    case 'info':
      return 3
    default: {
      const neverSeverity: never = severity
      return neverSeverity
    }
  }
}

function dispositionLabel(disposition: RiskDisposition) {
  switch (disposition) {
    case 'open':
      return 'Open'
    case 'referred':
      return 'Referred'
    default: {
      const neverDisposition: never = disposition
      return neverDisposition
    }
  }
}

function buildRiskRows(cases: CyberCase[]): RiskRow[] {
  return cases.flatMap((c) =>
    c.gaps
      .filter((gap): gap is typeof gap & { disposition: RiskDisposition } => {
        return gap.disposition === 'open' || gap.disposition === 'referred'
      })
      .map((gap) => {
        const inceptionIso = c.policyStartAt ?? c.receivedAt
        return {
          key: `${c.id}-${gap.id}`,
          caseId: c.id,
          control: gap.control,
          severity: gap.severity,
          disposition: gap.disposition,
          insured: c.insured,
          broker: c.broker,
          lobName: c.lobName,
          productCode: c.productCode,
          productName: c.productName,
          sector: c.sector,
          submissionKind: c.submissionKind,
          inceptionIso,
          inceptionLabel: inceptionLabel(inceptionIso),
        }
      }),
  )
}

function Donut({ slices }: { slices: { color: string; value: number }[] }) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const radius = 42
  const circumference = 2 * Math.PI * radius
  let cursor = 0
  const rings =
    total === 0
      ? [{ color: '#e6e9f0', dash: `${circumference} 0`, offset: 0 }]
      : slices
          .filter((slice) => slice.value > 0)
          .map((slice) => {
            const length = (slice.value / total) * circumference
            const ring = { color: slice.color, dash: `${length} ${circumference - length}`, offset: -cursor }
            cursor += length
            return ring
          })

  return (
    <svg className="rpt-donut" viewBox="0 0 120 120" aria-hidden>
      {rings.map((ring) => (
        <circle
          key={`${ring.color}-${ring.offset}`}
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={ring.color}
          strokeWidth="18"
          strokeDasharray={ring.dash}
          strokeDashoffset={ring.offset}
          transform="rotate(-90 60 60)"
        />
      ))}
    </svg>
  )
}

function Legend({ rows }: { rows: { label: string; color: string; value: number }[] }) {
  return (
    <ul className="rpt-legend">
      {rows.map((row) => (
        <li key={row.label}>
          <i style={{ background: row.color }} />
          <span title={row.label}>{row.label}</span>
          <strong>{row.value}</strong>
        </li>
      ))}
    </ul>
  )
}

export function ReportsDashboard({
  onOpenCase,
}: {
  onOpenCase: (caseId: string, origin?: 'tasks') => void
}) {
  const cases = useCyberUwStore((s) => s.cases)
  const referrals = useCyberUwStore((s) => s.referrals)
  const [tab, setTab] = useState<ReportTab>('dashboard')
  const [lobFilter, setLobFilter] = useState('All')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [brokerFilter, setBrokerFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState<RiskSortKey | ''>('')
  const [menuFor, setMenuFor] = useState<string | null>(null)
  const today = new Date().toISOString().slice(0, 10)
  const createdToday = cases.filter((c) => c.receivedAt.slice(0, 10) === today).length
  const statusCounts = new Map<StatusId, number>(STATUSES.map((status) => [status.id, 0]))
  for (const c of cases) {
    const status = statusFor(c)
    if (!status) continue
    statusCounts.set(status, (statusCounts.get(status) ?? 0) + 1)
  }
  const received = statusCounts.get('received') ?? 0
  const tasks = taskCounts(cases, referrals)
  const riskRows = useMemo(() => buildRiskRows(cases), [cases])
  const lobOptions = useMemo(
    () => ['All', ...Array.from(new Set(riskRows.map((row) => row.lobName))).sort()],
    [riskRows],
  )
  const severityOptions = useMemo(() => {
    const values = Array.from(new Set(riskRows.map((row) => row.severity))).sort(
      (a, b) => severityRank(a) - severityRank(b),
    )
    return ['All', ...values] as const
  }, [riskRows])
  const brokerOptions = useMemo(
    () => ['All', ...Array.from(new Set(riskRows.map((row) => row.broker))).sort()],
    [riskRows],
  )
  const filteredRisks = useMemo(() => {
    const rows = riskRows.filter((row) => {
      if (lobFilter !== 'All' && row.lobName !== lobFilter) return false
      if (severityFilter !== 'All' && row.severity !== severityFilter) return false
      if (brokerFilter !== 'All' && row.broker !== brokerFilter) return false
      if (statusFilter !== 'All' && row.disposition !== statusFilter) return false
      return true
    })
    if (!sortBy) return rows
    return [...rows].sort((a, b) => {
      switch (sortBy) {
        case 'reference':
          return a.caseId.localeCompare(b.caseId)
        case 'inception':
          return a.inceptionIso.localeCompare(b.inceptionIso)
        case 'severity':
          return severityRank(a.severity) - severityRank(b.severity)
        case 'insured':
          return a.insured.localeCompare(b.insured)
        case 'broker':
          return a.broker.localeCompare(b.broker)
        default: {
          const neverSort: never = sortBy
          return neverSort
        }
      }
    })
  }, [riskRows, lobFilter, severityFilter, brokerFilter, statusFilter, sortBy])
  const filtersActive =
    lobFilter !== 'All' || severityFilter !== 'All' || brokerFilter !== 'All' || statusFilter !== 'All'
  const clearFilters = () => {
    setLobFilter('All')
    setSeverityFilter('All')
    setBrokerFilter('All')
    setStatusFilter('All')
    setSortBy('')
  }
  const openTasks = referrals.filter((ticket) => isOpenTask(ticket.status))

  return (
    <div className="rpt-page">
      <div className="rpt-tabs" role="tablist" aria-label="Reports">
        <button type="button" role="tab" aria-selected={tab === 'dashboard'} onClick={() => setTab('dashboard')}>
          Dashboard
        </button>
        <button type="button" role="tab" aria-selected={tab === 'risks'} onClick={() => setTab('risks')}>
          Risks <em>{riskRows.length}</em>
        </button>
        <button type="button" role="tab" aria-selected={tab === 'tasks'} onClick={() => setTab('tasks')}>
          Tasks <em>{openTasks.length}</em>
        </button>
      </div>

      {tab === 'dashboard' ? (
        <div className="rpt-grid">
          <section className="rpt-card">
            <h2>Quick Stats</h2>
            <div className="rpt-stat">
              <strong>{createdToday}</strong>
              <span>No. of Submissions created today</span>
            </div>
            <div className="rpt-stat">
              <strong>{received}</strong>
              <span>No. of items at &apos;Submission Received&apos;</span>
            </div>
          </section>
          <section className="rpt-card">
            <h2>Task In Progress</h2>
            <div className="rpt-chart">
              <Donut slices={TASKS.map((task) => ({ color: task.color, value: tasks[task.id] }))} />
              <Legend rows={TASKS.map((task) => ({ label: task.label, color: task.color, value: tasks[task.id] }))} />
            </div>
          </section>
          <section className="rpt-card">
            <h2>Submission Statuses</h2>
            <div className="rpt-chart">
              <Donut
                slices={STATUSES.map((status) => ({
                  color: status.color,
                  value: statusCounts.get(status.id) ?? 0,
                }))}
              />
              <Legend
                rows={STATUSES.map((status) => ({
                  label: status.label,
                  color: status.color,
                  value: statusCounts.get(status.id) ?? 0,
                }))}
              />
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'risks' ? (
        <section className="rpt-card rpt-risks">
          <div className="rpt-filters">
            <label className="rpt-filter">
              <span>Line of Business</span>
              <select value={lobFilter} onChange={(e) => setLobFilter(e.target.value)} aria-label="Line of Business">
                {lobOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="rpt-filter">
              <span>Severity</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                aria-label="Severity"
              >
                {severityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All' ? 'All' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="rpt-filter">
              <span>Broker Name</span>
              <select
                value={brokerFilter}
                onChange={(e) => setBrokerFilter(e.target.value)}
                aria-label="Broker Name"
              >
                {brokerOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="rpt-filter">
              <span>Workflow Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Workflow Status"
              >
                <option value="All">All</option>
                <option value="open">Open</option>
                <option value="referred">Referred</option>
              </select>
            </label>
            <div className="rpt-filters__links">
              <button type="button" className="rpt-link" disabled title="All primary filters are shown">
                View All Filters
              </button>
              <button type="button" className="rpt-link" onClick={clearFilters} disabled={!filtersActive && !sortBy}>
                Clear All
              </button>
            </div>
            <label className="rpt-filter rpt-filter--sort">
              <span>Sort By</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as RiskSortKey | '')}
                aria-label="Sort By"
              >
                <option value="">Select</option>
                <option value="reference">Reference</option>
                <option value="inception">Proposed Inception</option>
                <option value="severity">Severity</option>
                <option value="insured">Organization Name</option>
                <option value="broker">Broker Name</option>
              </select>
            </label>
          </div>

          <div className="rpt-table-wrap">
            <table className="rpt-table">
              <thead>
                <tr>
                  <th className="rpt-table__action">Action</th>
                  <th>Reference</th>
                  <th>Risk</th>
                  <th>Severity</th>
                  <th>Submission Type</th>
                  <th>Proposed Inception</th>
                  <th>Line of Business</th>
                  <th>Product</th>
                  <th>Organization Name</th>
                  <th>Sector</th>
                  <th>Broker Name</th>
                  <th>Workflow Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRisks.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="rpt-table__empty">
                      {riskRows.length === 0 ? 'No open risks.' : 'No risks match the current filters.'}
                    </td>
                  </tr>
                ) : (
                  filteredRisks.map((risk) => (
                    <tr key={risk.key} onClick={() => onOpenCase(risk.caseId)}>
                      <td className="rpt-table__action" onClick={(e) => e.stopPropagation()}>
                        <div className="rpt-row-menu">
                          <button
                            type="button"
                            className="rpt-row-menu__btn"
                            aria-label={`Actions for ${risk.caseId}`}
                            aria-expanded={menuFor === risk.key}
                            onClick={() => setMenuFor((cur) => (cur === risk.key ? null : risk.key))}
                          >
                            <MoreHorizontal size={16} aria-hidden />
                          </button>
                          {menuFor === risk.key ? (
                            <div className="rpt-row-menu__panel" role="menu">
                              <button
                                type="button"
                                role="menuitem"
                                onClick={() => {
                                  setMenuFor(null)
                                  onOpenCase(risk.caseId)
                                }}
                              >
                                Open submission
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="rpt-table__id">{risk.caseId}</td>
                      <td title={risk.control}>{risk.control}</td>
                      <td>
                        <span className={`rpt-severity rpt-severity--${risk.severity}`}>
                          {risk.severity}
                        </span>
                      </td>
                      <td>{submissionTypeLabel(risk.submissionKind)}</td>
                      <td>{risk.inceptionLabel}</td>
                      <td title={risk.lobName}>{risk.lobName}</td>
                      <td title={risk.productName}>{risk.productCode}</td>
                      <td title={risk.insured}>{risk.insured}</td>
                      <td title={risk.sector}>{risk.sector || '—'}</td>
                      <td title={risk.broker}>{risk.broker}</td>
                      <td>{dispositionLabel(risk.disposition)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {tab === 'tasks' ? (
        <section className="rpt-card rpt-list">
          <h2>Tasks</h2>
          {openTasks.length === 0 ? <p>No open tasks.</p> : null}
          <ul>
            {openTasks.map((task) => {
              const insured = cases.find((c) => c.id === task.caseId)?.insured ?? task.caseId
              return (
                <li key={task.id}>
                  <button type="button" onClick={() => onOpenCase(task.caseId, 'tasks')}>
                    <strong>{task.sourceLabel}</strong>
                    <span>
                      {insured} · {task.assigneeLabel}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
