import { Plus } from 'lucide-react'
import { useId, useRef, type ChangeEvent, type ReactNode } from 'react'

export type ReferralFormMode = 'referral' | 'info'

export interface ReferralFormValues {
  taskType: string
  assignTo: string
  nature: string
  reason: string
  title: string
  priority: string
  dueDate: string
  membersCovered: string
  legalOpinion: 'yes' | 'no'
  masterChecklist: 'yes' | 'no' | 'na'
  comment: string
  documentType: string
  documentDescription: string
}

interface AssigneeOption {
  id: string
  label: string
}

interface Props {
  mode: ReferralFormMode
  values: ReferralFormValues
  assignees: readonly AssigneeOption[]
  onChange: (patch: Partial<ReferralFormValues>) => void
  onClose: () => void
  onSave: () => void
  saveDisabled?: boolean
  saveLabel: string
  footerNote?: ReactNode
}

const TASK_TYPES_REFERRAL = ['Compliance', 'Underwriting', 'Specialist Review', 'Broker Chase']
const TASK_TYPES_INFO = ['Information Request', 'Missing Documents', 'Clarification']
const REASONS = [
  '',
  'Appetite check',
  'Missing underwriting information',
  'Subjectivity review',
  'Pricing exception',
  'Broker follow-up',
]
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent']
const DOC_TYPES = ['Compliance', 'Application', 'Loss run', 'Financials', 'Other']

function FieldLabel({
  htmlFor,
  required,
  children,
}: {
  htmlFor: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="refer-sheet__label" htmlFor={htmlFor}>
      {children}
      {required ? <span aria-hidden>*</span> : null}
    </label>
  )
}

export function ReferralFormSheet({
  mode,
  values,
  assignees,
  onChange,
  onClose,
  onSave,
  saveDisabled,
  saveLabel,
  footerNote,
}: Props) {
  const uid = useId()
  const fileRef = useRef<HTMLInputElement>(null)
  const taskTypes = mode === 'info' ? TASK_TYPES_INFO : TASK_TYPES_REFERRAL
  const heading = mode === 'info' ? 'More Info Required' : 'Referral Details'

  const onBrowse = () => fileRef.current?.click()
  const onFiles = (_event: ChangeEvent<HTMLInputElement>) => {
    // Demo-only capture; files are not uploaded in this session.
  }

  return (
    <div className="refer-sheet">
      <header className="refer-sheet__banner">
        <h2 id={`${uid}-title`}>{heading}</h2>
      </header>

      <div className="refer-sheet__body">
        <div className="refer-sheet__grid">
          <div className="refer-sheet__field">
            <FieldLabel htmlFor={`${uid}-task-type`} required>
              Task Type
            </FieldLabel>
            <select
              id={`${uid}-task-type`}
              value={values.taskType}
              onChange={(e) => onChange({ taskType: e.target.value })}
            >
              {taskTypes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="refer-sheet__field">
            <FieldLabel htmlFor={`${uid}-assign`} required>
              Assign To
            </FieldLabel>
            <select
              id={`${uid}-assign`}
              value={values.assignTo}
              onChange={(e) => onChange({ assignTo: e.target.value })}
            >
              {assignees.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="refer-sheet__field">
            <FieldLabel htmlFor={`${uid}-nature`} required>
              Nature of Task
            </FieldLabel>
            <select
              id={`${uid}-nature`}
              value={values.nature}
              onChange={(e) =>
                onChange({
                  nature: e.target.value,
                  title: values.title.trim() ? values.title : e.target.value,
                })
              }
            >
              {taskTypes.map((option) => {
                const nature = mode === 'referral' ? `${option}-Referral` : option
                return (
                  <option key={option} value={nature}>
                    {nature}
                  </option>
                )
              })}
            </select>
          </div>

          <div className="refer-sheet__field">
            <FieldLabel htmlFor={`${uid}-reason`}>Referral Reason</FieldLabel>
            <select
              id={`${uid}-reason`}
              value={values.reason}
              onChange={(e) => onChange({ reason: e.target.value })}
            >
              <option value="">Select reason</option>
              {REASONS.filter(Boolean).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="refer-sheet__field refer-sheet__field--span-2">
            <FieldLabel htmlFor={`${uid}-title`}>Task Title</FieldLabel>
            <input
              id={`${uid}-title`}
              type="text"
              value={values.title}
              onChange={(e) => onChange({ title: e.target.value })}
            />
          </div>

          <div className="refer-sheet__field">
            <FieldLabel htmlFor={`${uid}-priority`}>Task Priority</FieldLabel>
            <select
              id={`${uid}-priority`}
              value={values.priority}
              onChange={(e) => onChange({ priority: e.target.value })}
            >
              {PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="refer-sheet__field">
            <FieldLabel htmlFor={`${uid}-due`} required>
              Due Date
            </FieldLabel>
            <input
              id={`${uid}-due`}
              type="date"
              value={values.dueDate}
              onChange={(e) => onChange({ dueDate: e.target.value })}
            />
          </div>
        </div>

        <section className="refer-sheet__section">
          <h3>Additional Questions</h3>
          <div className="refer-sheet__field">
            <FieldLabel htmlFor={`${uid}-members`}>
              Number of members covered under this policy
            </FieldLabel>
            <input
              id={`${uid}-members`}
              type="text"
              value={values.membersCovered}
              onChange={(e) => onChange({ membersCovered: e.target.value })}
            />
          </div>

          <fieldset className="refer-sheet__choice">
            <legend>External Legal Opinion Required?</legend>
            <label>
              <input
                type="radio"
                name={`${uid}-legal`}
                checked={values.legalOpinion === 'yes'}
                onChange={() => onChange({ legalOpinion: 'yes' })}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`${uid}-legal`}
                checked={values.legalOpinion === 'no'}
                onChange={() => onChange({ legalOpinion: 'no' })}
              />
              No
            </label>
          </fieldset>

          <fieldset className="refer-sheet__choice">
            <legend>Master Policy Checklist Required?</legend>
            <label>
              <input
                type="radio"
                name={`${uid}-master`}
                checked={values.masterChecklist === 'yes'}
                onChange={() => onChange({ masterChecklist: 'yes' })}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name={`${uid}-master`}
                checked={values.masterChecklist === 'no'}
                onChange={() => onChange({ masterChecklist: 'no' })}
              />
              No
            </label>
            <label>
              <input
                type="radio"
                name={`${uid}-master`}
                checked={values.masterChecklist === 'na'}
                onChange={() => onChange({ masterChecklist: 'na' })}
              />
              N/A
            </label>
          </fieldset>
        </section>

        <section className="refer-sheet__section">
          <h3>Task Comment</h3>
          <div className="refer-sheet__editor" aria-label="Task comment editor">
            <div className="refer-sheet__toolbar" aria-hidden>
              <span>Normal text</span>
              <i />
              <strong>B</strong>
              <em>I</em>
              <u>U</u>
              <s>S</s>
              <b>•</b>
              <b>1.</b>
            </div>
            <textarea
              id={`${uid}-comment`}
              value={values.comment}
              onChange={(e) => onChange({ comment: e.target.value })}
              placeholder={
                mode === 'info'
                  ? 'Documents, answers, or clarifications the broker should return…'
                  : 'Add context for the receiving desk…'
              }
            />
          </div>
        </section>

        <section className="refer-sheet__section">
          <h3>Attach Documents</h3>
          <button type="button" className="refer-sheet__dropzone" onClick={onBrowse}>
            <p>
              Drag and drop your files here or <span>browse your files</span>
            </p>
            <p className="refer-sheet__hint">
              Allowed Extensions (pdf, csv, doc, png, docx, txt, xlsx, xls) - 10MB Max
            </p>
          </button>
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            multiple
            accept=".pdf,.csv,.doc,.png,.docx,.txt,.xlsx,.xls"
            onChange={onFiles}
          />

          <div className="refer-sheet__grid refer-sheet__grid--docs">
            <div className="refer-sheet__field">
              <FieldLabel htmlFor={`${uid}-doc-type`} required>
                Document Type
              </FieldLabel>
              <select
                id={`${uid}-doc-type`}
                value={values.documentType}
                onChange={(e) => onChange({ documentType: e.target.value })}
              >
                {DOC_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="refer-sheet__field refer-sheet__field--span-2">
              <FieldLabel htmlFor={`${uid}-doc-desc`}>Document Description</FieldLabel>
              <textarea
                id={`${uid}-doc-desc`}
                rows={3}
                value={values.documentDescription}
                onChange={(e) => onChange({ documentDescription: e.target.value })}
                placeholder="Text Placeholder"
              />
            </div>
          </div>

          <div className="refer-sheet__doc-actions">
            <button type="button" className="refer-sheet__add-doc" onClick={onBrowse}>
              <Plus size={14} aria-hidden />
              Add Document
            </button>
          </div>
        </section>
      </div>

      <footer className="refer-sheet__footer">
        {footerNote ? <p className="refer-sheet__footer-note">{footerNote}</p> : <span />}
        <div className="refer-sheet__actions">
          <button type="button" className="refer-sheet__btn refer-sheet__btn--ghost" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="refer-sheet__btn refer-sheet__btn--solid"
            disabled={saveDisabled}
            onClick={onSave}
          >
            {saveLabel}
          </button>
        </div>
      </footer>
    </div>
  )
}

export function defaultReferralFormValues(mode: ReferralFormMode, assignTo: string): ReferralFormValues {
  const due = new Date()
  due.setDate(due.getDate() + 7)
  const dueDate = due.toISOString().slice(0, 10)
  if (mode === 'info') {
    return {
      taskType: 'Information Request',
      assignTo,
      nature: 'Information Request',
      reason: 'Missing underwriting information',
      title: 'Information Request',
      priority: 'Medium',
      dueDate,
      membersCovered: '',
      legalOpinion: 'no',
      masterChecklist: 'na',
      comment: '',
      documentType: 'Application',
      documentDescription: '',
    }
  }
  return {
    taskType: 'Compliance',
    assignTo,
    nature: 'Compliance-Referral',
    reason: '',
    title: 'Compliance-Referral',
    priority: 'Medium',
    dueDate,
    membersCovered: '',
    legalOpinion: 'yes',
    masterChecklist: 'yes',
    comment: '',
    documentType: 'Compliance',
    documentDescription: '',
  }
}

export function composeReferralNote(values: ReferralFormValues): string {
  const lines = [
    values.title.trim() || values.nature,
    values.reason ? `Reason: ${values.reason}` : null,
    `Priority: ${values.priority}`,
    `Due: ${values.dueDate}`,
    values.membersCovered.trim()
      ? `Members covered: ${values.membersCovered.trim()}`
      : null,
    `External legal opinion: ${values.legalOpinion}`,
    `Master policy checklist: ${values.masterChecklist}`,
    values.comment.trim() || null,
  ].filter(Boolean)
  return lines.join('\n')
}
