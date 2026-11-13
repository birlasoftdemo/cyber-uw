import { Eye } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { openPackageDocument } from '../data/dossierPackage'
import { lossRunForCase } from '../data/lossRunDemo'
import { useCyberUwStore, type SubmissionInfoInput } from '../store/cyberUwStore'
import type { IntakeDocStatus } from '../data/clientFeedbackDemo'
import type { CyberCase, CyberTier, PackageDoc, SubmissionKind } from '../types'
import { policyPeriodForCase } from '../utils/policyPeriod'
import { composeAddress, splitAddress } from '../utils/postalAddress'

type FieldKind = 'text' | 'date' | 'money' | 'priority' | 'business'
type Priority = 'Standard' | 'Elevated' | 'High'
type BusinessType = 'New' | 'Renewal'
/** Only these statuses get a red highlight in the extracted-fields grid. */
type FieldReviewStatus = 'pending' | 'empty' | null

interface DocField {
  key: string
  label: string
  display: string
  edit: string
  kind: FieldKind
  readOnly?: boolean
  /** Pending Review or Field Empty — drives highlight + value chrome. */
  reviewStatus?: Exclude<FieldReviewStatus, null>
}

const EXTRA_KEY = 'extract::documents'
const EMPTY = '—'

function money(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

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

function brokerContact(broker: string): { name: string; email: string; phone: string } {
  const name = broker.toLowerCase()
  if (name.includes('aon')) return { name: 'Priya Shah', email: 'priya.shah@aon.com', phone: '+1 212 555 0148' }
  if (name.includes('wtw') || name.includes('willis')) {
    return { name: 'Sam Chen', email: 'sam.chen@wtwco.com', phone: '+1 212 555 0194' }
  }
  if (name.includes('howden')) {
    return { name: 'Casey Nguyen', email: 'casey.nguyen@howden.com', phone: '+1 212 555 0160' }
  }
  if (name.includes('meridian')) {
    return { name: 'Alex Morgan', email: 'alex.morgan@meridianrisk.com', phone: '+1 415 555 0172' }
  }
  return { name: 'Jordan Lee', email: 'jordan.lee@marsh.com', phone: '+1 3837 191983' }
}

function readExtras(c: CyberCase): Record<string, string> {
  const raw = c.answerOverrides?.[EXTRA_KEY]
  if (!raw) return {}
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    const extras: Record<string, string> = {}
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === 'string') extras[key] = value
    }
    return extras
  } catch {
    return {}
  }
}

function valueNeedsPendingReview(value: string): boolean {
  return /missing|not extracted|not stated|not sure|open item|more info|follow-up required|review required|pending review/i.test(
    value,
  )
}

function reviewStatusFor(value: string): Exclude<FieldReviewStatus, null> | undefined {
  const shown = value.trim() || EMPTY
  if (shown === EMPTY) return 'empty'
  if (valueNeedsPendingReview(shown)) return 'pending'
  return undefined
}

function textField(key: string, label: string, value: string, readOnly = false): DocField {
  const shown = value.trim() || EMPTY
  return {
    key,
    label,
    display: shown,
    edit: shown === EMPTY ? '' : shown,
    kind: 'text',
    readOnly,
    reviewStatus: reviewStatusFor(shown),
  }
}

const INTAKE_DOC_PATTERNS: Record<string, RegExp> = {
  'cyber-app': /application|cyber.?app/i,
  infosec: /infosec|questionnaire|architecture/i,
  irp: /incident|irp/i,
  'loss-runs': /loss/i,
  'broker-corr': /broker|correspond|email|mail/i,
}

const INTAKE_DOC_LABELS: Record<string, string> = {
  'cyber-app': 'Cyber Application',
  infosec: 'InfoSec Questionnaire',
  irp: 'Incident Response Plan',
  'loss-runs': 'Loss Runs',
  'broker-corr': 'Broker Correspondence',
}

function sourceDocForIntake(c: CyberCase, docId: string): PackageDoc {
  const pattern = INTAKE_DOC_PATTERNS[docId]
  const found = pattern
    ? c.packageDocs.find((doc) => pattern.test(doc.name) || pattern.test(doc.kind))
    : undefined
  if (found) return found
  const label = INTAKE_DOC_LABELS[docId] ?? docId
  return {
    id: `${c.id}-${docId}-pending-source`,
    name: label,
    kind: 'application',
    previewKind: 'text',
    previewBody: [
      `${label} — source preview`,
      '',
      'This field is pending review. The live connector would open the stored exhibit here.',
      'Confirm or correct the extracted value against the broker package.',
    ].join('\n'),
  }
}

function signalAnswer(c: CyberCase, pattern: RegExp, fallback: string) {
  const hit = c.formSignals.find((signal) => pattern.test(signal.label))
  return hit?.answer?.trim() || fallback
}

/** Extracted fields scoped to each intake document type. */
export function fieldsForIntakeDoc(c: CyberCase, docId: string): DocField[] {
  const extras = readExtras(c)
  const address = splitAddress(c.insuredAddress)
  const contact = brokerContact(c.broker)
  const period = policyPeriodForCase(c)
  const losses = lossRunForCase(c)
  const pick = (key: string, fallback: string) => extras[key]?.trim() || fallback
  const openGaps = c.gaps.filter((gap) => gap.disposition === 'open').length

  switch (docId) {
    case 'cyber-app':
      return [
        textField('insuredName', 'Named insured', c.insured),
        textField('organization', 'Legal entity / DBA', pick('organization', c.insured)),
        textField('address1', 'Applicant address', address.line1),
        textField('city', 'City', address.city),
        textField('state', 'State', address.state),
        textField('postal', 'Postal code', address.postal),
        textField('lobName', 'Line of business', c.lobName),
        textField('productName', 'Product', c.productName),
        {
          key: 'limitRequested',
          label: 'Requested limit',
          display: money(c.limitRequestedUsd),
          edit: String(c.limitRequestedUsd),
          kind: 'money',
        },
        {
          key: 'effective',
          label: 'Proposed effective date',
          display: period.startIso,
          edit: period.startIso,
          kind: 'date',
        },
        {
          key: 'expiration',
          label: 'Proposed expiration date',
          display: period.endIso,
          edit: period.endIso,
          kind: 'date',
        },
        {
          key: 'businessType',
          label: 'New / renewal',
          display: businessTypeFor(c.submissionKind),
          edit: businessTypeFor(c.submissionKind),
          kind: 'business',
        },
        {
          key: 'priority',
          label: 'Submission priority',
          display: priorityFor(c.tier),
          edit: priorityFor(c.tier),
          kind: 'priority',
        },
        textField('tenure', 'Years with product', c.productTenure),
        textField('sector', 'Industry / sub-class', c.sector),
        textField('description', 'Operations summary', c.companyDescription ?? ''),
      ]
    case 'infosec':
      return [
        textField('mfa', 'MFA coverage', signalAnswer(c, /mfa/i, 'Not extracted'), true),
        textField('edr', 'EDR / endpoint controls', signalAnswer(c, /edr|endpoint/i, 'Not extracted'), true),
        textField('backup', 'Backup / immutability', signalAnswer(c, /backup|immutable/i, 'Not extracted'), true),
        textField(
          'encryption',
          'Encryption in transit / at rest',
          signalAnswer(c, /encrypt/i, 'Not extracted'),
          true,
        ),
        textField('infosecComplete', 'Questionnaire completeness', `${c.completenessPct}%`, true),
        textField('openGaps', 'Open control gaps', String(openGaps), true),
        textField(
          'infosecOwner',
          'InfoSec contact',
          pick('contactName', contact.name),
        ),
        textField('infosecEmail', 'InfoSec email', pick('email', contact.email)),
      ]
    case 'irp':
      return [
        textField(
          'irpPresent',
          'IRP on file',
          c.packageDocs.some((doc) => /incident|irp/i.test(doc.name) || /incident|irp/i.test(doc.kind))
            ? 'Yes'
            : 'Missing',
          true,
        ),
        textField('irpTested', 'Last tabletop / test', pick('irpTested', 'Not stated'), true),
        textField('irpRto', 'Recovery RTO', pick('irpRto', 'Not stated'), true),
        textField('irpNotify', 'Breach notification SLA', pick('irpNotify', 'Not stated'), true),
        textField('irpOwner', 'Plan owner', pick('irpOwner', contact.name)),
        textField('irpEmail', 'IR contact email', pick('irpEmail', contact.email)),
      ]
    case 'loss-runs':
      return [
        textField('lossCount', 'Claim count', String(losses.claims.length), true),
        textField('lossIncurred', 'Total incurred', money(losses.totalIncurred), true),
        textField('lossOpen', 'Open claims', String(losses.openCount), true),
        textField('lossAverage', 'Average incurred', money(losses.averageIncurred), true),
        ...losses.claims.slice(0, 4).map((claim) =>
          textField(
            `loss-${claim.id}`,
            claim.id,
            `${claim.lossDate} · ${claim.status} · ${claim.cause} · ${money(claim.incurred)}`,
            true,
          ),
        ),
      ]
    case 'broker-corr':
      return [
        textField('broker', 'Broker agency', c.broker),
        textField('brokerContact', 'Broker contact', pick('brokerContact', contact.name)),
        textField('brokerEmail', 'Broker email', pick('brokerEmail', contact.email)),
        textField('brokerPhone', 'Broker phone', pick('brokerPhone', contact.phone)),
        textField(
          'brokerFollowUp',
          'Follow-up status',
          openGaps > 0 ? `${openGaps} open item(s)` : 'No open follow-ups',
          true,
        ),
        textField('brokerChannel', 'Last channel', pick('brokerChannel', 'Email'), true),
      ]
    default:
      return [
        textField('insuredName', 'Named insured', c.insured, true),
        textField('broker', 'Broker', c.broker, true),
        textField('docId', 'Document id', docId, true),
      ]
  }
}

function draftFrom(fields: DocField[]): Record<string, string> {
  return Object.fromEntries(fields.map((field) => [field.key, field.edit]))
}

function amount(value: string | undefined, fallback: number) {
  const parsed = Number((value ?? '').replace(/[^0-9.]/g, ''))
  if (!Number.isFinite(parsed)) return fallback
  return Math.round(parsed)
}

function asPriority(value: string | undefined, fallback: Priority): Priority {
  if (value === 'Standard' || value === 'Elevated' || value === 'High') return value
  return fallback
}

function asBusiness(value: string | undefined, fallback: BusinessType): BusinessType {
  if (value === 'New' || value === 'Renewal') return value
  return fallback
}

function FieldControl({
  field,
  value,
  editing,
  onChange,
  onOpenSource,
}: {
  field: DocField
  value: string
  editing: boolean
  onChange: (value: string) => void
  onOpenSource: () => void
}) {
  if (!editing || field.readOnly) {
    if (field.reviewStatus === 'empty') {
      return <span className="doc-extract__status doc-extract__status--empty">Field Empty</span>
    }
    if (field.reviewStatus === 'pending') {
      return (
        <button
          type="button"
          className="doc-extract__pending"
          aria-label="Pending Review — open source document"
          onClick={(event) => {
            event.stopPropagation()
            onOpenSource()
          }}
        >
          <Eye size={14} strokeWidth={2.25} aria-hidden />
          <span>Pending Review</span>
        </button>
      )
    }
    const shown =
      field.kind === 'date' && value
        ? new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : field.display
    return <span>{shown || EMPTY}</span>
  }

  switch (field.kind) {
    case 'text':
    case 'money':
      return <input value={value} onChange={(event) => onChange(event.target.value)} />
    case 'date':
      return <input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    case 'priority':
      return (
        <select value={asPriority(value, 'Standard')} onChange={(event) => onChange(event.target.value)}>
          <option>Standard</option>
          <option>Elevated</option>
          <option>High</option>
        </select>
      )
    case 'business':
      return (
        <select value={asBusiness(value, 'New')} onChange={(event) => onChange(event.target.value)}>
          <option>New</option>
          <option>Renewal</option>
        </select>
      )
    default: {
      const neverKind: never = field.kind
      return neverKind
    }
  }
}

/** Per-document extracted fields in the shared spec-grid layout. */
export function DocSheetExtractedFields({
  c,
  docId,
}: {
  c: CyberCase
  docId: string
  docStatus?: IntakeDocStatus
}) {
  const saveSubmissionInfo = useCyberUwStore((s) => s.saveSubmissionInfo)
  const setAnswerOverride = useCyberUwStore((s) => s.setAnswerOverride)
  const fields = useMemo(() => fieldsForIntakeDoc(c, docId), [c, docId])
  const sourceDoc = useMemo(() => sourceDocForIntake(c, docId), [c, docId])
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})
  useEffect(() => {
    setEditing(false)
    setDraft({})
  }, [c.id, docId])

  const editable = fields.some((field) => !field.readOnly)

  const save = () => {
    const value = (key: string, fallback: string) => (draft[key] ?? fallback).trim()
    const priority = asPriority(draft.priority, priorityFor(c.tier))
    const business = asBusiness(draft.businessType, businessTypeFor(c.submissionKind))
    const period = policyPeriodForCase(c)
    const input: SubmissionInfoInput = {
      insured: value('insuredName', c.insured) || c.insured,
      broker: value('broker', c.broker),
      sector: value('sector', c.sector),
      insuredAddress: composeAddress({
        line1: value('address1', splitAddress(c.insuredAddress).line1),
        city: value('city', splitAddress(c.insuredAddress).city),
        state: value('state', splitAddress(c.insuredAddress).state),
        postal: value('postal', splitAddress(c.insuredAddress).postal),
        fallback: c.insuredAddress,
      }),
      lobName: value('lobName', c.lobName) || c.lobName,
      productName: value('productName', c.productName) || c.productName,
      productCode: c.productCode,
      productTenure: value('tenure', c.productTenure),
      companyDescription: value('description', c.companyDescription ?? ''),
      limitRequestedUsd: amount(draft.limitRequested, c.limitRequestedUsd),
      revenueUsd: c.revenueUsd,
      policyStartAt: value('effective', period.startIso) || period.startIso,
      policyEndAt: value('expiration', period.endIso) || period.endIso,
      submissionKind: kindFor(business),
      tier: tierFor(priority),
    }
    const extras = {
      ...readExtras(c),
      organization: value('organization', c.insured),
      contactName: value('infosecOwner', value('contactName', '')),
      email: value('infosecEmail', value('email', '')),
      brokerContact: value('brokerContact', ''),
      brokerEmail: value('brokerEmail', ''),
      brokerPhone: value('brokerPhone', ''),
      irpOwner: value('irpOwner', ''),
      irpEmail: value('irpEmail', ''),
      irpTested: value('irpTested', ''),
      irpRto: value('irpRto', ''),
      irpNotify: value('irpNotify', ''),
    }
    saveSubmissionInfo(c.id, input)
    setAnswerOverride(c.id, EXTRA_KEY, JSON.stringify(extras))
    setEditing(false)
  }

  return (
    <div className="doc-extract">
      <div className="doc-sheet__tools">
        <p>Extracted fields</p>
        {editable ? (
          <div>
            <button
              type="button"
              className={editing ? 'is-on' : ''}
              onClick={() => {
                setDraft(draftFrom(fields))
                setEditing(true)
              }}
            >
              Edit
            </button>
            <button type="button" onClick={save} disabled={!editing}>
              Save
            </button>
          </div>
        ) : null}
      </div>
      <div className="spec-grid-wrap spec-grid-wrap--nested">
        <table className="spec-grid spec-grid--extract">
          <thead>
            <tr className="spec-grid__groups">
              <th colSpan={2}>extracted fields</th>
            </tr>
            <tr className="spec-grid__cols">
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => {
              const highlight =
                field.reviewStatus === 'pending' || field.reviewStatus === 'empty'
              return (
                <tr key={field.key} className={highlight ? 'spec-grid__row--review' : undefined}>
                  <td>
                    <strong>{field.label}</strong>
                  </td>
                  <td>
                    <FieldControl
                      field={field}
                      value={draft[field.key] ?? field.edit}
                      editing={editing}
                      onChange={(next) => setDraft((current) => ({ ...current, [field.key]: next }))}
                      onOpenSource={() => openPackageDocument(sourceDoc)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
