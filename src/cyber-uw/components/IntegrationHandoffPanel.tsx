import { Button } from '@heroui/react'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase } from '../types'

function money(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

function compactLimit(n: number) {
  if (n >= 1_000_000_000) return `$ ${(n / 1_000_000_000).toFixed(n % 1_000_000_000 === 0 ? 0 : 1)}B`
  if (n >= 1_000_000) return `$ ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`
  return money(n)
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="integration-fields__item">
      <span className="integration-fields__label">{label}</span>
      <span className="integration-fields__value">{value}</span>
    </div>
  )
}

/** Limits / aggregation + PAS push. Status table lives on Decision after sign-off. */
export function IntegrationHandoffPanel({ c }: { c: CyberCase }) {
  const pushToPas = useCyberUwStore((s) => s.pushToPas)
  const underwriter = useAuthStore((s) => s.user?.name) ?? 'Underwriter'
  const synced = c.pasStatus === 'synced'
  const aggregateLimit = compactLimit(c.limitRequestedUsd)
  const excess =
    c.financialSignOff?.sirUsd != null ? compactLimit(c.financialSignOff.sirUsd) : 'None'
  const approvalUw = c.financialSignOff?.signedOffBy?.trim() || underwriter
  const approvalLimit =
    c.financialSignOff?.limitUsd != null
      ? compactLimit(c.financialSignOff.limitUsd)
      : compactLimit(c.limitRequestedUsd)

  return (
    <div className="integration-panel">
      <section className="spec-info-panel" aria-label="Integration">
        <header className="spec-info-panel__bar">
          <h3>Integration</h3>
          <p>Submission request limits and policy-center handoff</p>
        </header>
      </section>

      <section className="spec-info-panel" aria-label="Submission Request Limits & Aggregation">
        <header className="spec-info-panel__bar">
          <h3>Submission Request Limits & Aggregation</h3>
        </header>
        <div className="integration-fields integration-fields--4">
          <Field label="Aggregate Whole Limit Amount" value={aggregateLimit} />
          <Field label="Currency" value="USD" />
          <Field label="Aggregate Whole Excess Amount" value={excess} />
          <Field label="Currency" value="USD" />
          <Field label="Approval Underwriter" value={approvalUw} />
          <Field label="Approval Limit" value={approvalLimit} />
          <Field label="Underwriter" value={underwriter} />
          <Field label="Limit" value={aggregateLimit} />
        </div>
      </section>

      <div className="integration-panel__actions">
        <Button
          variant="secondary"
          className="integration-panel__cta"
          isDisabled={synced}
          onPress={() => pushToPas(c.id)}
        >
          {synced ? 'Policy Center Updated' : 'Update Policy Center'}
        </Button>
      </div>
    </div>
  )
}
