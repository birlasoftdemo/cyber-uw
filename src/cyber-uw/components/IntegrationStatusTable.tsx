import { integrationHandoffsForCase } from '../data/integrationHandoffs'
import type { CyberCase, IntegrationHandoffStatus } from '../types'
import { SpecStatusPill, handoffIcon, type SpecStatusTone } from './SpecStatusPill'

function statusTone(status: IntegrationHandoffStatus): SpecStatusTone {
  switch (status) {
    case 'Success':
    case 'Validated':
      return 'ok'
    case 'Submitted':
    case 'Pending Approval':
      return 'mid'
    case 'Retrying':
      return 'watch'
    case 'Failed':
      return 'bad'
    default: {
      const neverStatus: never = status
      return neverStatus
    }
  }
}

/** Integration status grid — shown after decision sign-off on the Decision stage. */
export function IntegrationStatusTable({ c }: { c: CyberCase }) {
  const handoffs = integrationHandoffsForCase(c)

  return (
    <section className="spec-info-panel" aria-label="Integration status">
      <header className="spec-info-panel__bar">
        <h3>Integration Status</h3>
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
                  <SpecStatusPill tone={statusTone(row.status)} icon={handoffIcon[row.status]}>
                    {row.status}
                  </SpecStatusPill>
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
  )
}
