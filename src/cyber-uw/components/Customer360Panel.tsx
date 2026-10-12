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
  Pencil,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { CyberCase } from '../types'
import { useCyberUwStore, type CaseInsightPatch } from '../store/cyberUwStore'
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

function EditableInsight({
  icon: Icon,
  label,
  display,
  editor,
}: {
  icon: LucideIcon
  label: string
  display: string
  editor: (done: () => void) => ReactNode
}) {
  const [editing, setEditing] = useState(false)
  return (
    <div className="cuw-c360-kpi">
      <div className="cuw-c360-kpi__top">
        <dt className="cuw-c360-kpi__label">
          <span className="cuw-c360-kpi__glyph" aria-hidden>
            <Icon size={13} strokeWidth={1.9} />
          </span>
          {label}
        </dt>
        {editing ? null : (
          <button
            type="button"
            className="wb-q-pen"
            aria-label={`Edit ${label}`}
            onClick={() => setEditing(true)}
          >
            <Pencil size={13} strokeWidth={1.75} />
          </button>
        )}
      </div>
      {editing ? (
        editor(() => setEditing(false))
      ) : (
        <dd className="cuw-c360-kpi__value">{display}</dd>
      )}
    </div>
  )
}

function TextEditor({
  label,
  initial,
  onSave,
  done,
  type = 'text',
}: {
  label: string
  initial: string
  onSave: (value: string) => void
  done: () => void
  type?: 'text' | 'number' | 'date'
}) {
  const [draft, setDraft] = useState(initial)
  return (
    <dd className="cuw-c360-edit">
      <input
        className="wb-q-cell__input"
        type={type}
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button
        type="button"
        className="wb-q-save"
        onClick={() => {
          onSave(draft)
          done()
        }}
      >
        Save
      </button>
    </dd>
  )
}

function RenewalEditor({
  value,
  done,
  onSave,
}: {
  value: boolean
  done: () => void
  onSave: (patch: CaseInsightPatch) => void
}) {
  const [draft, setDraft] = useState(value ? 'yes' : 'no')
  return (
    <dd className="cuw-c360-edit">
      <select
        className="wb-q-cell__input"
        aria-label="Renewal applicable"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      >
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      <button
        type="button"
        className="wb-q-save"
        onClick={() => {
          onSave({ renewalApplicable: draft === 'yes' })
          done()
        }}
      >
        Save
      </button>
    </dd>
  )
}

function LobEditor({
  c,
  done,
  onSave,
}: {
  c: CyberCase
  done: () => void
  onSave: (patch: CaseInsightPatch) => void
}) {
  const [name, setName] = useState(c.lobName)
  const [code, setCode] = useState(c.lobCode)
  return (
    <dd className="cuw-c360-edit">
      <input
        className="wb-q-cell__input"
        aria-label="Line of business"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="wb-q-cell__input"
        aria-label="LOB code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <button
        type="button"
        className="wb-q-save"
        onClick={() => {
          onSave({ lobName: name, lobCode: code })
          done()
        }}
      >
        Save
      </button>
    </dd>
  )
}

export function Customer360Panel({ c }: Props) {
  const missing = missingDocsForCase(c)
  const aiSummary = buildC360AiSummary(c)
  const period = policyPeriodForCase(c)
  const updateCaseInsight = useCyberUwStore((s) => s.updateCaseInsight)

  const save = (patch: CaseInsightPatch) => updateCaseInsight(c.id, patch)

  const fields: {
    key: string
    icon: LucideIcon
    label: string
    display: string
    editor: (done: () => void) => ReactNode
  }[] = [
    {
      key: 'address',
      icon: MapPin,
      label: 'Address',
      display: c.insuredAddress,
      editor: (done) => (
        <TextEditor
          label="Address"
          initial={c.insuredAddress}
          done={done}
          onSave={(value) => save({ insuredAddress: value })}
        />
      ),
    },
    {
      key: 'productName',
      icon: Package,
      label: 'Product name',
      display: c.productName,
      editor: (done) => (
        <TextEditor
          label="Product name"
          initial={c.productName}
          done={done}
          onSave={(value) => save({ productName: value })}
        />
      ),
    },
    {
      key: 'productCode',
      icon: Hash,
      label: 'Product code',
      display: c.productCode,
      editor: (done) => (
        <TextEditor
          label="Product code"
          initial={c.productCode}
          done={done}
          onSave={(value) => save({ productCode: value })}
        />
      ),
    },
    {
      key: 'lob',
      icon: Layers,
      label: 'LOB & code',
      display: `${c.lobName} · ${c.lobCode}`,
      editor: (done) => <LobEditor c={c} done={done} onSave={save} />,
    },
    {
      key: 'version',
      icon: GitBranch,
      label: 'Product version',
      display: c.productVersion,
      editor: (done) => (
        <TextEditor
          label="Product version"
          initial={c.productVersion}
          done={done}
          onSave={(value) => save({ productVersion: value })}
        />
      ),
    },
    {
      key: 'renewal',
      icon: RefreshCw,
      label: 'Renewal applicable',
      display: c.renewalApplicable ? 'Yes' : 'No',
      editor: (done) => (
        <RenewalEditor value={c.renewalApplicable} done={done} onSave={save} />
      ),
    },
    {
      key: 'sector',
      icon: Building2,
      label: 'Sector',
      display: c.sector,
      editor: (done) => (
        <TextEditor
          label="Sector"
          initial={c.sector}
          done={done}
          onSave={(value) => save({ sector: value })}
        />
      ),
    },
    {
      key: 'broker',
      icon: Handshake,
      label: 'Broker',
      display: c.broker,
      editor: (done) => (
        <TextEditor
          label="Broker"
          initial={c.broker}
          done={done}
          onSave={(value) => save({ broker: value })}
        />
      ),
    },
    {
      key: 'limit',
      icon: Landmark,
      label: 'Limit requested',
      display: money(c.limitRequestedUsd),
      editor: (done) => (
        <TextEditor
          label="Limit requested"
          type="number"
          initial={String(c.limitRequestedUsd)}
          done={done}
          onSave={(value) => save({ limitRequestedUsd: Number(value) || 0 })}
        />
      ),
    },
    {
      key: 'revenue',
      icon: CircleDollarSign,
      label: 'Revenue',
      display: money(c.revenueUsd),
      editor: (done) => (
        <TextEditor
          label="Revenue"
          type="number"
          initial={String(c.revenueUsd)}
          done={done}
          onSave={(value) => save({ revenueUsd: Number(value) || 0 })}
        />
      ),
    },
    {
      key: 'start',
      icon: CalendarRange,
      label: 'Proposed start date',
      display: formatPolicyDate(period.startIso),
      editor: (done) => (
        <TextEditor
          label="Proposed start date"
          type="date"
          initial={period.startIso}
          done={done}
          onSave={(value) => save({ policyStartAt: value })}
        />
      ),
    },
    {
      key: 'end',
      icon: CalendarCheck2,
      label: 'Proposed end date',
      display: formatPolicyDate(period.endIso),
      editor: (done) => (
        <TextEditor
          label="Proposed end date"
          type="date"
          initial={period.endIso}
          done={done}
          onSave={(value) => save({ policyEndAt: value })}
        />
      ),
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
        {fields.map((field) => (
          <EditableInsight
            key={field.key}
            icon={field.icon}
            label={field.label}
            display={field.display}
            editor={field.editor}
          />
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
