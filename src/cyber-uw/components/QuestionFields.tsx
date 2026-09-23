import { type LucideIcon } from 'lucide-react'
import { fieldKey, type SectionField } from '../data/cyberTriageRules'
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

export function IngestQuestionGrid({
  caseId,
  sectionId,
  fields,
  editing,
}: {
  caseId: string
  sectionId: string
  fields: SectionField[]
  editing: boolean
}) {
  const setAnswerOverride = useCyberUwStore((s) => s.setAnswerOverride)

  return (
    <div className="wb-q-grid">
      {fields.map((f) => {
        const key = f.key ?? `${sectionId}::${f.label}`
        return (
          <div
            key={key}
            id={`dossier-anchor-${sectionId}-${f.label}`}
            className="wb-q-cell"
          >
            <p className="wb-q-cell__label">{f.label}</p>
            {editing ? (
              <input
                className="wb-q-cell__input"
                value={f.attested ?? f.value}
                aria-label={f.label}
                onChange={(e) => setAnswerOverride(caseId, key, e.target.value)}
              />
            ) : (
              <p className="wb-q-cell__value">{f.attested ?? f.value}</p>
            )}
          </div>
        )
      })}
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
