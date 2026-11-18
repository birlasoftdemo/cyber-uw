import { useState } from 'react'
import type { CyberCase } from '../types'

const RATE_MINIMUM = 15_000
const LIMIT_CAP = 50_000_000
const COMPLETENESS_MINIMUM = 80

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

function ratePerMillion(c: CyberCase) {
  if (c.limitRequestedUsd <= 0) return 0
  return Math.round((premiumFor(c) * 1_000_000) / c.limitRequestedUsd)
}

function isUsLocation(address: string) {
  return /united states|\b(AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|IA|ID|IL|IN|KS|KY|LA|MA|MD|ME|MI|MN|MO|MS|MT|NC|ND|NE|NH|NJ|NM|NV|NY|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VA|VT|WA|WI|WV|WY)\b/i.test(
    address,
  )
}

function StatusMark({ state }: { state: 'pass' | 'fail' | 'unchecked' }) {
  const label = state === 'pass' ? 'Pass' : state === 'fail' ? 'Fail' : 'Not checked'
  return <span className={`triage-status triage-status--${state}`}>{label}</span>
}

function CompareRow({
  title,
  rows,
  state,
}: {
  title: string
  rows: { label: string; value: string; amount: number }[]
  state: 'pass' | 'fail' | 'unchecked'
}) {
  const max = Math.max(...rows.map((row) => row.amount), 1)
  return (
    <div className="triage-row">
      <div className="triage-row__main">
        <p className="triage-row__title">{title}</p>
        <div className="triage-meters">
          {rows.map((row) => (
            <div key={row.label} className="triage-meter">
              <span>{row.label}</span>
              <strong>{row.value}</strong>
              <i>
                <b style={{ width: `${Math.min(100, (row.amount / max) * 100)}%` }} />
              </i>
            </div>
          ))}
        </div>
      </div>
      <StatusMark state={state} />
    </div>
  )
}

export function TriageAnalysisPanel({ c }: { c: CyberCase }) {
  const [saved, setSaved] = useState(false)
  const rate = ratePerMillion(c)
  const us = isUsLocation(c.insuredAddress)
  const accountOk = Boolean(c.insured && c.broker)
  const lobOk = Boolean(c.lobName)

  return (
    <section className="triage-sheet">
      <header className="triage-sheet__head">
        <h4>Triage Submission</h4>
      </header>
      <div className="triage-row">
        <div>
          <p className="triage-row__title">Account information</p>
        </div>
        <StatusMark state={accountOk ? 'pass' : 'fail'} />
      </div>
      <div className="triage-row">
        <div>
          <p className="triage-row__title">Accepted line of business</p>
          <p className="triage-row__detail">{c.lobName}</p>
        </div>
        <StatusMark state={lobOk ? 'pass' : 'fail'} />
      </div>
      <div className="triage-row">
        <div>
          <p className="triage-row__title">United States location</p>
          <p className="triage-row__detail">{c.insuredAddress}</p>
        </div>
        <StatusMark state={us ? 'pass' : 'fail'} />
      </div>
      <div className="triage-row">
        <div>
          <p className="triage-row__title">Minimum attachment</p>
          <p className="triage-row__detail">Not applied on insurance submissions</p>
        </div>
        <StatusMark state="unchecked" />
      </div>
      <CompareRow
        title="Rate per million"
        state={rate >= RATE_MINIMUM ? 'pass' : 'fail'}
        rows={[
          { label: 'This submission', value: money(rate), amount: rate },
          { label: 'Triage minimum', value: money(RATE_MINIMUM), amount: RATE_MINIMUM },
        ]}
      />
      <CompareRow
        title="Requested limit"
        state={c.limitRequestedUsd <= LIMIT_CAP ? 'pass' : 'fail'}
        rows={[
          { label: 'This submission', value: money(c.limitRequestedUsd), amount: c.limitRequestedUsd },
          { label: 'Triage cap', value: money(LIMIT_CAP), amount: LIMIT_CAP },
        ]}
      />
      <CompareRow
        title="Completeness"
        state={c.completenessPct >= COMPLETENESS_MINIMUM ? 'pass' : 'fail'}
        rows={[
          { label: 'This submission', value: `${c.completenessPct}%`, amount: c.completenessPct },
          {
            label: 'Triage minimum',
            value: `${COMPLETENESS_MINIMUM}%`,
            amount: COMPLETENESS_MINIMUM,
          },
        ]}
      />
      <footer className="triage-sheet__foot">
        <span>cyber-uw-triage-v1</span>
        <button type="button" className="triage-sheet__save" onClick={() => setSaved(true)}>
          {saved ? 'Saved' : 'Save'}
        </button>
      </footer>
    </section>
  )
}
