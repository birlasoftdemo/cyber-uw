import { Lock, Pencil, type LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { fieldKey, isAnswerSigned, type SectionField } from '../data/cyberTriageRules'
import { useCyberUwStore } from '../store/cyberUwStore'

export function QuestionMetaGrid({
  items,
}: {
  items: { label: string; value: string; icon?: LucideIcon }[]
}) {
  return (
    <div className="wb-q-grid wb-q-grid--meta">
      {items.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="wb-q-cell">
            {Icon ? (
              <span className="wb-q-cell__glyph" aria-hidden>
                <Icon size={15} strokeWidth={1.75} />
              </span>
            ) : null}
            <p className="wb-q-cell__label">{item.label}</p>
            <p className="wb-q-cell__value">{item.value}</p>
          </div>
        )
      })}
    </div>
  )
}

function IngestField({
  caseId,
  sectionId,
  field,
}: {
  caseId: string
  sectionId: string
  field: SectionField
}) {
  const setAnswerOverride = useCyberUwStore((s) => s.setAnswerOverride)
  const toggleAnswerSigned = useCyberUwStore((s) => s.toggleAnswerSigned)
  const signed = useCyberUwStore((s) => {
    const item = s.cases.find((c) => c.id === caseId)
    return item ? isAnswerSigned(item, field.key ?? fieldKey(sectionId, field.label)) : false
  })
  const stored = field.attested ?? field.value
  const key = field.key ?? fieldKey(sectionId, field.label)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(stored)

  const startEdit = () => {
    setDraft(stored)
    setEditing(true)
  }

  const save = () => {
    setAnswerOverride(caseId, key, draft)
    toggleAnswerSigned(caseId, key, true)
    setEditing(false)
  }

  return (
    <div id={`dossier-anchor-${sectionId}-${field.label}`} className="wb-q-cell">
      <div className="wb-q-cell__head">
        <p className="wb-q-cell__label">{field.label}</p>
        <div className="wb-q-cell__actions">
          {editing ? (
            <button type="button" className="wb-q-save" onClick={save}>
              Save
            </button>
          ) : (
            <button
              type="button"
              className="wb-q-pen"
              aria-label={`Edit ${field.label}`}
              onClick={startEdit}
            >
              <Pencil size={13} strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
      {editing ? (
        <input
          className="wb-q-cell__input"
          value={draft}
          aria-label={field.label}
          onChange={(e) => setDraft(e.target.value)}
        />
      ) : (
        <p className="wb-q-cell__value">
          {signed ? <Lock size={12} strokeWidth={2} className="wb-q-lock" aria-hidden /> : null}
          {stored}
        </p>
      )}
    </div>
  )
}

export function IngestQuestionGrid({
  caseId,
  sectionId,
  fields,
}: {
  caseId: string
  sectionId: string
  fields: SectionField[]
}) {
  return (
    <div className="wb-q-grid">
      {fields.map((field) => (
        <IngestField
          key={field.key ?? fieldKey(sectionId, field.label)}
          caseId={caseId}
          sectionId={sectionId}
          field={field}
        />
      ))}
    </div>
  )
}

export function ReviewQuestionGrid({
  sectionId,
  fields,
  showTriage,
}: {
  sectionId: string
  fields: SectionField[]
  showTriage: boolean
}) {
  return (
    <div className="wb-q-grid" id={`review-section-${sectionId}`}>
      {fields.map((f) => {
        const key = f.key ?? fieldKey(sectionId, f.label)
        const fail = showTriage && Boolean(f.failsTriage)
        return (
          <div
            key={key}
            id={`review-q-${key}`}
            data-q-label={f.label}
            className={`wb-q-cell${fail ? ' wb-q-cell--fail' : ''}${showTriage ? ' wb-q-cell--triage' : ''}`}
          >
            <p className="wb-q-cell__label">{f.label}</p>
            {showTriage && f.floor ? <p className="wb-q-cell__floor">Permitted · {f.floor}</p> : null}
            <p className={`wb-q-cell__value${showTriage ? ' wb-q-cell__value--measured' : ''}`}>
              {f.value}
            </p>
            {fail ? (
              <p className="wb-q-cell__warn">{f.signal ?? 'Below the permitted value'}</p>
            ) : f.signal && !showTriage ? (
              <p className="wb-q-cell__note">{f.signal}</p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
