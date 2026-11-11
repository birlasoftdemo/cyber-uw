import {
  Building2,
  ChevronDown,
  CircleDollarSign,
  FileText,
  Landmark,
  List,
  Table2,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { lossRunForCase } from '../data/lossRunDemo'
import { openPackageDocument } from '../data/dossierPackage'
import { useCyberUwStore, type SubmissionInfoInput } from '../store/cyberUwStore'
import type { CyberCase, CyberTier, SubmissionKind } from '../types'
import { policyPeriodForCase } from '../utils/policyPeriod'
import { composeAddress, splitAddress } from '../utils/postalAddress'

type DocTab = 'company' | 'policy' | 'broker' | 'economic' | 'additional' | 'loss' | 'sov'
type FieldKind = 'text' | 'date' | 'money' | 'priority' | 'business'
type Priority = 'Standard' | 'Elevated' | 'High'
type BusinessType = 'New' | 'Renewal'

interface DocField {
  key: string
  label: string
  display: string
  edit: string
  kind: FieldKind
  readOnly?: boolean
}

const EXTRA_KEY = 'extract::documents'
const EMPTY = '—'

const TABS: { id: DocTab; label: string; icon: LucideIcon }[] = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'policy', label: 'Policy', icon: FileText },
  { id: 'broker', label: 'Broker agency', icon: Landmark },
  { id: 'economic', label: 'Economic', icon: CircleDollarSign },
  { id: 'additional', label: 'Additional', icon: List },
  { id: 'loss', label: 'Loss runs', icon: TrendingDown },
  { id: 'sov', label: 'SOV', icon: Table2 },
]

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

function textField(key: string, label: string, value: string, readOnly = false): DocField {
  const shown = value.trim() || EMPTY
  return { key, label, display: shown, edit: shown === EMPTY ? '' : shown, kind: 'text', readOnly }
}

function fieldsFor(c: CyberCase): Record<DocTab, DocField[]> {
  const extras = readExtras(c)
  const address = splitAddress(c.insuredAddress)
  const contact = brokerContact(c.broker)
  const period = policyPeriodForCase(c)
  const premium = c.financialSignOff?.stubPremiumUsd ?? Math.round(c.limitRequestedUsd * 0.012)
  const rate = c.limitRequestedUsd > 0 ? Math.round((premium * 1_000_000) / c.limitRequestedUsd) : 0
  const losses = lossRunForCase(c)
  const pick = (key: string, fallback: string) => extras[key]?.trim() || fallback

  const company: DocField[] = [
    textField('insuredName', 'Insured name', c.insured),
    textField('organization', 'Organization', pick('organization', c.insured)),
    textField('contactName', 'Contact name', pick('contactName', contact.name)),
    textField('email', 'Email', pick('email', contact.email)),
    textField('address1', 'Address line 1', address.line1),
    textField('address2', 'Address line 2', pick('address2', address.line2)),
    textField('address3', 'Address line 3', pick('address3', address.line3)),
    textField('city', 'City', address.city),
    textField('state', 'State', address.state),
    textField('postal', 'Postal code', address.postal),
    textField('country', 'Country', pick('country', address.country)),
    textField('office', 'Office location', pick('office', address.office)),
  ]

  const policy: DocField[] = [
    textField('policyNumber', 'Policy number', c.id, true),
    textField('lobName', 'Line of business', c.lobName),
    textField('productName', 'Product', c.productName),
    {
      key: 'limitRequested',
      label: 'Limit',
      display: money(c.limitRequestedUsd),
      edit: String(c.limitRequestedUsd),
      kind: 'money',
    },
    {
      key: 'effective',
      label: 'Effective date',
      display: period.startIso,
      edit: period.startIso,
      kind: 'date',
    },
    {
      key: 'expiration',
      label: 'Expiration date',
      display: period.endIso,
      edit: period.endIso,
      kind: 'date',
    },
    {
      key: 'businessType',
      label: 'Business type',
      display: businessTypeFor(c.submissionKind),
      edit: businessTypeFor(c.submissionKind),
      kind: 'business',
    },
    textField('tenure', 'Tenure', c.productTenure),
    textField('currency', 'Currency', 'USD', true),
    {
      key: 'priority',
      label: 'Priority',
      display: priorityFor(c.tier),
      edit: priorityFor(c.tier),
      kind: 'priority',
    },
  ]

  const broker: DocField[] = [
    textField('broker', 'Agency', c.broker),
    textField('brokerContact', 'Contact', pick('brokerContact', contact.name)),
    textField('brokerEmail', 'Email', pick('brokerEmail', contact.email)),
    textField('brokerPhone', 'Phone', pick('brokerPhone', contact.phone)),
  ]

  const economic: DocField[] = [
    {
      key: 'revenue',
      label: 'Revenue',
      display: money(c.revenueUsd),
      edit: String(c.revenueUsd),
      kind: 'money',
    },
    textField('premium', 'Premium', money(premium), true),
    {
      key: 'economicLimit',
      label: 'Limit requested',
      display: money(c.limitRequestedUsd),
      edit: String(c.limitRequestedUsd),
      kind: 'money',
    },
    textField('rate', 'Rate per million', money(rate), true),
  ]

  const additional: DocField[] = [
    textField('sector', 'Sector', c.sector),
    textField('productCode', 'Product code', c.productCode),
    textField('description', 'Description', c.companyDescription ?? ''),
  ]

  const loss: DocField[] = [
    textField('lossCount', 'Claims', String(losses.claims.length), true),
    textField('lossIncurred', 'Total incurred', money(losses.totalIncurred), true),
    textField('lossOpen', 'Open claims', String(losses.openCount), true),
    textField('lossAverage', 'Average incurred', money(losses.averageIncurred), true),
    ...losses.claims.map((claim) =>
      textField(
        `loss-${claim.id}`,
        claim.id,
        `${claim.lossDate} · ${claim.status} · ${claim.cause} · ${money(claim.incurred)}`,
        true,
      ),
    ),
  ]

  const sov: DocField[] =
    c.vendors.length === 0
      ? [textField('sovEmpty', 'Schedule', 'No schedule of values on this submission.', true)]
      : c.vendors.flatMap((vendor, index) => [
          textField(`sov-vendor-${index}`, 'Vendor', vendor.vendor, true),
          textField(`sov-category-${index}`, 'Category', vendor.category, true),
          textField(`sov-book-${index}`, 'Book', String(vendor.bookCount), true),
          textField(`sov-hint-${index}`, 'Limit hint', vendor.limitHint, true),
        ])

  return { company, policy, broker, economic, additional, loss, sov }
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
}: {
  field: DocField
  value: string
  editing: boolean
  onChange: (value: string) => void
}) {
  if (!editing || field.readOnly) {
    const shown =
      field.kind === 'date' && value
        ? new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
        : field.kind === 'money' && editing
          ? value
          : field.display
    return <dd>{shown || EMPTY}</dd>
  }

  switch (field.kind) {
    case 'text':
    case 'money':
      return (
        <dd>
          <input value={value} onChange={(event) => onChange(event.target.value)} />
        </dd>
      )
    case 'date':
      return (
        <dd>
          <input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
        </dd>
      )
    case 'priority':
      return (
        <dd>
          <select value={asPriority(value, 'Standard')} onChange={(event) => onChange(event.target.value)}>
            <option>Standard</option>
            <option>Elevated</option>
            <option>High</option>
          </select>
        </dd>
      )
    case 'business':
      return (
        <dd>
          <select value={asBusiness(value, 'New')} onChange={(event) => onChange(event.target.value)}>
            <option>New</option>
            <option>Renewal</option>
          </select>
        </dd>
      )
    default: {
      const neverKind: never = field.kind
      return neverKind
    }
  }
}

export function SubmissionDocumentsPanel({ c }: { c: CyberCase }) {
  const saveSubmissionInfo = useCyberUwStore((s) => s.saveSubmissionInfo)
  const setAnswerOverride = useCyberUwStore((s) => s.setAnswerOverride)
  const [open, setOpen] = useState(true)
  const [tab, setTab] = useState<DocTab>('company')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<Record<string, string>>({})

  useEffect(() => {
    setTab('company')
    setEditing(false)
    setDraft({})
  }, [c.id])

  const grouped = fieldsFor(c)
  const active = grouped[tab]

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
      productCode: value('productCode', c.productCode),
      productTenure: value('tenure', c.productTenure),
      companyDescription: value('description', c.companyDescription ?? ''),
      limitRequestedUsd:
        draft.limitRequested != null && draft.limitRequested !== String(c.limitRequestedUsd)
          ? amount(draft.limitRequested, c.limitRequestedUsd)
          : amount(draft.economicLimit, c.limitRequestedUsd),
      revenueUsd: amount(draft.revenue, c.revenueUsd),
      policyStartAt: value('effective', period.startIso) || period.startIso,
      policyEndAt: value('expiration', period.endIso) || period.endIso,
      submissionKind: kindFor(business),
      tier: tierFor(priority),
    }
    const extras = {
      ...readExtras(c),
      organization: value('organization', c.insured),
      contactName: value('contactName', ''),
      email: value('email', ''),
      address2: value('address2', ''),
      address3: value('address3', ''),
      country: value('country', ''),
      office: value('office', ''),
      brokerContact: value('brokerContact', ''),
      brokerEmail: value('brokerEmail', ''),
      brokerPhone: value('brokerPhone', ''),
    }
    saveSubmissionInfo(c.id, input)
    setAnswerOverride(c.id, EXTRA_KEY, JSON.stringify(extras))
    setEditing(false)
  }

  const viewSource = () => {
    const doc =
      c.packageDocs.find((item) => /app/i.test(item.kind) || /app/i.test(item.name)) ?? c.packageDocs[0]
    if (doc) openPackageDocument(doc)
  }

  return (
    <section className="doc-sheet">
      <button type="button" className="doc-sheet__head" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span>Documents</span>
        <ChevronDown size={16} className={open ? 'is-open' : ''} aria-hidden />
      </button>
      {open ? (
        <div className="doc-sheet__body">
          <div className="doc-sheet__tools">
            <p>Extracted fields</p>
            <div>
              <button type="button" className={editing ? 'is-on' : ''} onClick={() => {
                setDraft(draftFrom(Object.values(grouped).flat()))
                setEditing(true)
              }}>
                Edit
              </button>
              <button type="button" onClick={save} disabled={!editing}>
                Save
              </button>
            </div>
          </div>
          <div className="doc-tabs" role="tablist" aria-label="Extracted fields">
            {TABS.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={tab === item.id}
                  className={tab === item.id ? 'is-active' : ''}
                  onClick={() => setTab(item.id)}
                >
                  <Icon size={16} strokeWidth={1.75} aria-hidden />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>
          <dl className="doc-fields">
            {active.map((field) => (
              <div key={field.key}>
                <dt>{field.label}</dt>
                <FieldControl
                  field={field}
                  value={draft[field.key] ?? field.edit}
                  editing={editing}
                  onChange={(next) => setDraft((current) => ({ ...current, [field.key]: next }))}
                />
              </div>
            ))}
          </dl>
          <button type="button" className="doc-source" onClick={viewSource} disabled={c.packageDocs.length === 0}>
            View source
          </button>
        </div>
      ) : null}
    </section>
  )
}
