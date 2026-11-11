import { ChevronDown } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { CyberCase, CyberTier, SubmissionKind } from '../types'
import { policyPeriodForCase } from '../utils/policyPeriod'
import { useCyberUwStore, type SubmissionInfoInput } from '../store/cyberUwStore'
import { NewSubmissionOverview } from './NewSubmissionOverview'
import { SubmissionDocumentsPanel } from './SubmissionDocumentsPanel'
import { SubmissionIntakePanel } from './SubmissionIntakePanel'

type StageTab = 'submission' | 'basic'
type Priority = 'Standard' | 'Elevated' | 'High'
type BusinessType = 'New' | 'Renewal'

function priorityFor(tier: number): Priority {
  if (tier <= 2) return 'Standard'
  if (tier === 3) return 'Elevated'
  return 'High'
}

function tierFor(priority: Priority): CyberTier {
  switch (priority) {
    case 'Standard':
      return 2
    case 'Elevated':
      return 3
    case 'High':
      return 4
    default: {
      const neverPriority: never = priority
      return neverPriority
    }
  }
}

function kindFor(businessType: BusinessType): SubmissionKind {
  switch (businessType) {
    case 'New':
      return 'new_business'
    case 'Renewal':
      return 'renewal'
    default: {
      const neverType: never = businessType
      return neverType
    }
  }
}

function businessTypeFor(kind: SubmissionKind): BusinessType {
  switch (kind) {
    case 'new_business':
      return 'New'
    case 'renewal':
      return 'Renewal'
    default: {
      const neverKind: never = kind
      return neverKind
    }
  }
}

function draftFromCase(c: CyberCase): SubmissionInfoInput {
  const period = policyPeriodForCase(c)
  return {
    insured: c.insured,
    broker: c.broker,
    sector: c.sector,
    insuredAddress: c.insuredAddress,
    lobName: c.lobName,
    productName: c.productName,
    productCode: c.productCode,
    productTenure: c.productTenure,
    companyDescription: c.companyDescription ?? '',
    limitRequestedUsd: c.limitRequestedUsd,
    revenueUsd: c.revenueUsd,
    policyStartAt: period.startIso,
    policyEndAt: period.endIso,
    submissionKind: c.submissionKind,
    tier: c.tier,
  }
}

function Fold({ title, children }: { title: string; children: ReactNode }) {
  const [open, setOpen] = useState(true)
  return (
    <section className="ns-info-fold">
      <button type="button" className="ns-info-fold__bar" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>{title}</span>
        <ChevronDown size={16} className={open ? 'is-open' : ''} aria-hidden />
      </button>
      {open ? <div className="ns-info-fold__body">{children}</div> : null}
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'date'
}) {
  return (
    <label className="ns-info-field">
      <span>{label}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (value: T) => void
}) {
  return (
    <label className="ns-info-field">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value as T)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function BasicInformationForm({ c }: { c: CyberCase }) {
  const saveSubmissionInfo = useCyberUwStore((s) => s.saveSubmissionInfo)
  const [draft, setDraft] = useState(() => draftFromCase(c))
  const [showBroker, setShowBroker] = useState(Boolean(c.broker))

  useEffect(() => {
    setDraft(draftFromCase(c))
    setShowBroker(Boolean(c.broker))
  }, [c.id])

  const setText = (key: keyof SubmissionInfoInput, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const setAmount = (key: 'limitRequestedUsd' | 'revenueUsd', value: string) => {
    const amount = Number(value.replace(/[^0-9.]/g, ''))
    setDraft((current) => ({
      ...current,
      [key]: Number.isFinite(amount) ? Math.round(amount) : 0,
    }))
  }

  return (
    <div className="ns-info-stack">
      <Fold title="Basic information">
        <div className="ns-info-fields">
          <Field label="Account" value={draft.insured} onChange={(value) => setText('insured', value)} />
          <Field label="Line of business" value={draft.lobName} onChange={(value) => setText('lobName', value)} />
          <Field label="Sector" value={draft.sector} onChange={(value) => setText('sector', value)} />
          <Field
            label="Effective date"
            type="date"
            value={draft.policyStartAt}
            onChange={(value) => setText('policyStartAt', value)}
          />
          <Field label="Address" value={draft.insuredAddress} onChange={(value) => setText('insuredAddress', value)} />
          <Field
            label="Expiration date"
            type="date"
            value={draft.policyEndAt}
            onChange={(value) => setText('policyEndAt', value)}
          />
          <Field label="Product" value={draft.productName} onChange={(value) => setText('productName', value)} />
          <SelectField
            label="Business type"
            value={businessTypeFor(draft.submissionKind)}
            options={['New', 'Renewal'] as const}
            onChange={(value) => setDraft((current) => ({ ...current, submissionKind: kindFor(value) }))}
          />
          <SelectField
            label="Priority"
            value={priorityFor(draft.tier)}
            options={['Standard', 'Elevated', 'High'] as const}
            onChange={(value) => setDraft((current) => ({ ...current, tier: tierFor(value) }))}
          />
        </div>
      </Fold>
      <Fold title="Risk details">
        <div className="ns-info-fields">
          <Field
            label="Limit requested"
            value={String(draft.limitRequestedUsd)}
            onChange={(value) => setAmount('limitRequestedUsd', value)}
          />
          <Field label="Revenue" value={String(draft.revenueUsd)} onChange={(value) => setAmount('revenueUsd', value)} />
          <Field label="Product code" value={draft.productCode} onChange={(value) => setText('productCode', value)} />
          <Field label="Tenure" value={draft.productTenure} onChange={(value) => setText('productTenure', value)} />
        </div>
      </Fold>
      <Fold title="Broker details">
        <label className="ns-info-check">
          <input
            type="checkbox"
            checked={showBroker}
            onChange={(event) => setShowBroker(event.target.checked)}
          />
          Show details
        </label>
        {showBroker ? (
          <div className="ns-info-fields">
            <Field label="Broker" value={draft.broker} onChange={(value) => setText('broker', value)} />
          </div>
        ) : (
          <p className="ns-info-empty">No broker details shown</p>
        )}
      </Fold>
      <Fold title="Additional info">
        <label className="ns-info-field">
          <span>Description</span>
          <textarea
            rows={3}
            value={draft.companyDescription}
            onChange={(event) => setText('companyDescription', event.target.value)}
          />
        </label>
      </Fold>
      <div className="ns-info-save-row">
        <button type="button" className="ns-info-save" onClick={() => saveSubmissionInfo(c.id, draft)}>
          Save
        </button>
      </div>
    </div>
  )
}

function StageBody({ tab, c }: { tab: StageTab; c: CyberCase }) {
  switch (tab) {
    case 'submission':
      return (
        <div className="ns-submission">
          <NewSubmissionOverview c={c} />
          <SubmissionIntakePanel c={c} />
          <SubmissionDocumentsPanel c={c} />
        </div>
      )
    case 'basic':
      return <BasicInformationForm c={c} />
    default: {
      const neverTab: never = tab
      return neverTab
    }
  }
}

export function NewSubmissionStage({ c }: { c: CyberCase }) {
  const [tab, setTab] = useState<StageTab>('submission')

  useEffect(() => {
    setTab('submission')
  }, [c.id])

  return (
    <div className="ns-stage">
      <div className="ns-stage-tabs" role="tablist" aria-label="New submission">
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'submission'}
          className={tab === 'submission' ? 'is-active' : ''}
          onClick={() => setTab('submission')}
        >
          Submission Information
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === 'basic'}
          className={tab === 'basic' ? 'is-active' : ''}
          onClick={() => setTab('basic')}
        >
          Basic Information
        </button>
      </div>
      <StageBody tab={tab} c={c} />
    </div>
  )
}
