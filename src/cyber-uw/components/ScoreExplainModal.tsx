import { Button } from '@heroui/react'
import {
  CircleCheck,
  CircleHelp,
  ListChecks,
  ShieldAlert,
  X,
  type LucideIcon,
} from 'lucide-react'

export type ScoreExplainKind =
  | 'confidence'
  | 'completeness'
  | 'evidenceConfidence'
  | 'cyberRisk'
  | 'controlEffectiveness'
  | 'appetiteResult'

export type ScoreExplainContent = {
  title: string
  /** Three key explanations shown with bullet icons. */
  points: [string, string, string]
  /** One or two sentences of supporting explainer. */
  explainer: string
}

const POINT_ICONS: LucideIcon[] = [CircleCheck, ListChecks, ShieldAlert]

const COPY: Record<ScoreExplainKind, ScoreExplainContent> = {
  confidence: {
    title: 'How Confidence is scored',
    points: [
      'Clear, fully extracted values score in the mid-to-high 90s.',
      'Thin extraction or review-required fields drop into the 50s.',
      'Missing documents score 0% — nothing reliable to underwrite from.',
    ],
    explainer:
      'Confidence answers “can I trust this field?” Higher means the intake reader is more sure the extracted value is usable.',
  },
  completeness: {
    title: 'How Completeness is scored',
    points: [
      'Extracted documents score 100% when expected sections are populated.',
      'Received or review-required files sit lower until content is confirmed.',
      'Missing documents score 0% on the package checklist.',
    ],
    explainer:
      'Completeness answers “how full is this document for intake?” Higher means more of the expected package content is present.',
  },
  evidenceConfidence: {
    title: 'How Evidence Confidence is scored',
    points: [
      'Aligned document and external sources typically score in the mid-to-high 80s.',
      'Thin or incomplete sources sit in the 70s as Partially Verified.',
      'Clear disagreements stay high-confidence because the conflict itself is reliable.',
    ],
    explainer:
      'Evidence Confidence answers “can I trust this field’s value?” Higher means stronger agreement between declaration and observation.',
  },
  cyberRisk: {
    title: 'How Cyber Risk is scored',
    points: [
      'Starts from a residual base, then adds weight for failed application fields.',
      'Elevated findings and open control gaps increase the adverse load.',
      'Incomplete packages are forced into an adverse band until docs arrive.',
    ],
    explainer:
      'Cyber Risk is document risk load from the ingested package — not an external security rating. Higher is more adverse.',
  },
  controlEffectiveness: {
    title: 'How Control Effectiveness is scored',
    points: [
      'Starts at 100 for a clean, complete package.',
      'Open gaps and contradicted attestations pull the score down.',
      'HITL Approve/Ignore on findings recovers a small credit.',
    ],
    explainer:
      'Control Effectiveness measures how strongly attested controls hold up against extracted evidence. Higher is stronger.',
  },
  appetiteResult: {
    title: 'How Appetite Result is scored',
    points: [
      'Within Appetite maps to 100 when no refer/decline rule fires.',
      'Refer maps to 55 when at least one rule needs escalation.',
      'Decline maps to 20 for a hard rule failure or incomplete package.',
    ],
    explainer:
      'Appetite Result maps carrier rules on this submission to a 0–100 desk score. Use Why this score? for the exact rule that fired.',
  },
}

/** Normalize dynamic why content into the shared three-point layout. */
export function toScoreExplainContent(input: {
  title: string
  points?: string[]
  steps?: string[]
  explainer?: string
  summary?: string
  note?: string
}): ScoreExplainContent {
  const raw = (input.points ?? input.steps ?? []).map((line) => line.trim()).filter(Boolean)
  const fallback = [
    input.summary?.trim(),
    input.note?.trim(),
    'See the supporting detail on this submission for drivers of the score.',
  ].filter((line): line is string => Boolean(line))
  const filled = [...raw, ...fallback]
  while (filled.length < 3) {
    filled.push('Additional scoring detail is available in the underwriting package.')
  }
  const points: [string, string, string] = [filled[0]!, filled[1]!, filled[2]!]
  const explainer =
    input.explainer?.trim() ||
    input.note?.trim() ||
    input.summary?.trim() ||
    'These points summarize how this score was derived for the current submission.'
  return { title: input.title, points, explainer }
}

interface Props {
  kind?: ScoreExplainKind | null
  content?: ScoreExplainContent | null
  open: boolean
  onClose: () => void
}

/** Full-height left slide-in for scoring method and Why this score? explainers. */
export function ScoreExplainModal({ kind = null, content = null, open, onClose }: Props) {
  const resolved = content ?? (kind ? COPY[kind] : null)

  if (!resolved || !open) return null

  return (
    <div
      className="score-explain-overlay"
      role="presentation"
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose()
      }}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={resolved.title}
        className="score-explain-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="score-explain-drawer__head">
          <div className="score-explain-drawer__title">
            <span className="score-explain-drawer__icon" aria-hidden>
              <CircleHelp size={20} strokeWidth={2.25} />
            </span>
            <h2>{resolved.title}</h2>
          </div>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Close" onPress={onClose}>
            <X size={16} />
          </Button>
        </header>

        <div className="score-explain-drawer__body">
          <ul className="score-explain-drawer__points">
            {resolved.points.map((point, index) => {
              const Icon = POINT_ICONS[index] ?? CircleCheck
              return (
                <li key={point}>
                  <span className="score-explain-drawer__bullet" aria-hidden>
                    <Icon size={16} strokeWidth={2.25} />
                  </span>
                  <span>{point}</span>
                </li>
              )
            })}
          </ul>
          <p className="score-explain-drawer__explainer">{resolved.explainer}</p>
        </div>

        <footer className="score-explain-drawer__foot">
          <Button variant="secondary" onPress={onClose}>
            Close
          </Button>
          <Button variant="primary" isDisabled>
            Learn More
          </Button>
        </footer>
      </aside>
    </div>
  )
}
