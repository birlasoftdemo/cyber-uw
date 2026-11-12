import { integrationHandoffsForCase } from '../data/integrationHandoffs'
import type { CyberCase, CyberDecision, IntegrationHandoffStatus } from '../types'
import { HitlDecisionPanel } from './HitlDecisionPanel'

function statusClass(status: IntegrationHandoffStatus) {
  switch (status) {
    case 'Success':
    case 'Validated':
      return 'spec-grid-status spec-grid-status--ok'
    case 'Submitted':
    case 'Pending Approval':
      return 'spec-grid-status spec-grid-status--mid'
    case 'Retrying':
      return 'spec-grid-status spec-grid-status--watch'
    case 'Failed':
      return 'spec-grid-status spec-grid-status--bad'
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

export function IntegrationHandoffPanel({
  c,
  onDecide,
  onRequestInfo,
}: {
  c: CyberCase
  onDecide: (decision: Exclude<CyberDecision, 'pending'>, rationale: string) => void
  onRequestInfo: () => void
}) {
  const handoffs = integrationHandoffsForCase(c)

  return (
    <div className="integration-panel">
      <HitlDecisionPanel c={c} onDecide={onDecide} onRequestInfo={onRequestInfo} />

      <section className="spec-info-panel" aria-label="Controlled handoff">
        <header className="spec-info-panel__bar">
          <h3>Controlled handoff</h3>
          <p>Policy Administration · Rating/Pricing · Broker CRM</p>
        </header>

        <div className="spec-grid-wrap">
          <table className="spec-grid">
            <thead>
              <tr className="spec-grid__groups">
                <th colSpan={2}>Target</th>
                <th colSpan={2}>Status</th>
              </tr>
              <tr className="spec-grid__cols">
                <th>System</th>
                <th>Channel</th>
                <th>Integration status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {handoffs.map((row) => (
                <tr key={row.target}>
                  <td>
                    <strong>{row.label}</strong>
                  </td>
                  <td>{row.target.replace(/_/g, ' ')}</td>
                  <td>
                    <span className={statusClass(row.status)}>{row.status}</span>
                  </td>
                  <td className="spec-grid__num">
                    {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
