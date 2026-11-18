import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Eye,
  FileCheck2,
  FileQuestion,
  FileX2,
  Inbox,
  type LucideIcon,
  Minus,
  RefreshCw,
  Sparkles,
  Tags,
  UserRound,
  XCircle,
} from 'lucide-react'
import type { ReactNode } from 'react'
import type { SubmissionStatus } from '../utils/submissionStatus'

export type SpecStatusTone = 'ok' | 'mid' | 'watch' | 'miss' | 'bad' | 'na'

const TONE_CLASS: Record<SpecStatusTone, string> = {
  ok: 'spec-grid-status spec-grid-status--ok',
  mid: 'spec-grid-status spec-grid-status--mid',
  watch: 'spec-grid-status spec-grid-status--watch',
  miss: 'spec-grid-status spec-grid-status--miss',
  bad: 'spec-grid-status spec-grid-status--bad',
  na: 'spec-grid-status spec-grid-status--na',
}

/** Default icon by tone when callers do not pass a specific glyph. */
const TONE_ICON: Record<SpecStatusTone, LucideIcon> = {
  ok: CheckCircle2,
  mid: Tags,
  watch: Clock3,
  miss: AlertCircle,
  bad: XCircle,
  na: Minus,
}

export function SpecStatusPill({
  tone,
  icon: IconProp,
  className,
  children,
}: {
  tone?: SpecStatusTone
  icon?: LucideIcon
  className?: string
  children: ReactNode
}) {
  const Icon = IconProp ?? (tone ? TONE_ICON[tone] : Tags)
  const classes = className ?? (tone ? TONE_CLASS[tone] : 'spec-grid-status')
  return (
    <span className={classes}>
      <Icon className="spec-grid-status__icon" size={14} strokeWidth={2.25} aria-hidden />
      <span className="spec-grid-status__label">{children}</span>
    </span>
  )
}

const SUBMISSION_STATUS_CLASS: Record<SubmissionStatus, string> = {
  New: 'spec-grid-status spec-status spec-status--new',
  Processing: 'spec-grid-status spec-status spec-status--processing',
  'Broker Follow-up': 'spec-grid-status spec-status spec-status--evidence',
  'Under Review': 'spec-grid-status spec-status spec-status--review',
  Referred: 'spec-grid-status spec-status spec-status--referred',
  Approved: 'spec-grid-status spec-status spec-status--approved',
  Declined: 'spec-grid-status spec-status spec-status--declined',
}

const SUBMISSION_STATUS_ICON: Record<SubmissionStatus, LucideIcon> = {
  New: Sparkles,
  Processing: RefreshCw,
  'Broker Follow-up': AlertTriangle,
  'Under Review': Eye,
  Referred: UserRound,
  Approved: CheckCircle2,
  Declined: XCircle,
}

export function SubmissionStatusPill({ status }: { status: SubmissionStatus }) {
  return (
    <SpecStatusPill className={SUBMISSION_STATUS_CLASS[status]} icon={SUBMISSION_STATUS_ICON[status]}>
      {status}
    </SpecStatusPill>
  )
}

export const intakeStatusIcon = {
  Extracted: FileCheck2,
  Classified: Tags,
  Received: Inbox,
  'Review Required': AlertCircle,
  Missing: FileX2,
} as const satisfies Record<string, LucideIcon>

export const followUpIcon = {
  Required: AlertCircle,
  'Not Required': CheckCircle2,
} as const satisfies Record<string, LucideIcon>

export const verificationIcon = {
  Verified: CheckCircle2,
  'Partially Verified': CircleDashed,
  Contradicted: XCircle,
  'Missing Evidence': FileQuestion,
  'Not Applicable': Minus,
} as const satisfies Record<string, LucideIcon>

export const handoffIcon = {
  Success: CheckCircle2,
  Validated: CheckCircle2,
  Submitted: Inbox,
  'Pending Approval': Clock3,
  Retrying: RefreshCw,
  Failed: XCircle,
} as const satisfies Record<string, LucideIcon>
