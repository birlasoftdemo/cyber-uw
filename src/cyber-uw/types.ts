import type { QualificationBucketId } from './constants/qualificationBuckets'

export type CyberDecision = 'pending' | 'quote' | 'refer' | 'decline'
export type CyberTier = 1 | 2 | 3 | 4 | 5
export type GapSeverity = 'critical' | 'high' | 'medium' | 'info'
export type GapDisposition = 'open' | 'resolved' | 'referred'
export type PasStatus = 'idle' | 'pushing' | 'synced' | 'error'
export type SignalStatus = 'idle' | 'scanning' | 'ready'

export type RiskJudgmentStatus = 'pending' | 'accepted' | 'escalated' | 'noted'
export type PlatformCardType =
  | 'shared_idp'
  | 'critical_saas_api'
  | 'msp_rmm_path'
  | 'cloud_concentration'
  | 'sector_limit_aggregate'
export type PlatformSignOff = 'pending' | 'ignore' | 'block' | 'escalate'
export type PlatformOutcome = 'pending' | 'clear' | 'ignore' | 'escalate' | 'blocks'

export type ReferralKind = 'gap' | 'risk' | 'platform' | 'ingest' | 'submission'
export type ReferralTarget = 'specialist' | 'broker' | 'senior_uw'
export type ReferralStatus = 'open' | 'awaiting_broker' | 'resolved' | 'returned'

export interface ReferralTicket {
  id: string
  caseId: string
  kind: ReferralKind
  sourceId: string
  sourceLabel: string
  target: ReferralTarget
  assigneeLabel: string
  note: string
  status: ReferralStatus
  createdAt: string
  resolvedAt?: string
  resolutionNote?: string
}

export interface ControlGap {
  id: string
  control: string
  attested: string
  signal: string
  severity: GapSeverity
  rfiDraft: string
  disposition: GapDisposition
  qualificationBucket: QualificationBucketId
  referredTo?: string
  signedOffAt?: string
  signedOffBy?: string
  /** Appetite / control floor (Ideal column). */
  idealFloor?: string
  /** Dossier package doc or form-signal anchor for Ideal click. */
  idealDocId?: string
  /** Dossier anchor for Detected click (usually form signal / evidence). */
  detectedDocId?: string
}

export interface VendorExposure {
  vendor: string
  category: string
  bookCount: number
  limitHint: string
}

export interface AppetiteHit {
  ruleId: string
  label: string
  outcome: 'pass' | 'refer' | 'decline'
  detail: string
}

export interface RiskJudgment {
  status: RiskJudgmentStatus
  note?: string
  signedOffAt?: string
}

export interface PlatformCard {
  id: string
  type: PlatformCardType
  label: string
  finding: string
  portfolioMeaning: string
  signOff: PlatformSignOff
  termEffect?: string
  signedOffAt?: string
}

export type PackageDocPreviewKind = 'pdf' | 'image' | 'text'

export interface PackageDoc {
  id: string
  name: string
  kind: string
  /** Demo in-pane preview. */
  previewKind?: PackageDocPreviewKind
  previewBody?: string
}

export type SubmissionKind = 'new_business' | 'renewal'

export interface FormSignal {
  id: string
  moduleId: string
  label: string
  answer: string
  signal?: string
  gapId?: string
}

export interface FinancialSignOff {
  limitUsd: number
  sirUsd: number
  pricingTier: 1 | 2 | 3 | 4 | 5
  stubPremiumUsd?: number
  withinAuthority: boolean
  managerCosign: boolean
  cosignReason?: string
  signedOffAt?: string
  signedOffBy?: string
}

export interface PackageSignOff {
  acceptedDocIds: string[]
  /** Field keys (`sectionId::label`) signed on Policy Documents. `*` = all. */
  signedAnswerKeys?: string[]
  signedOffAt?: string
  signedOffBy?: string
}

export interface CyberCase {
  id: string
  insured: string
  broker: string
  sector: string
  /** Insured mailing / HQ address for Customer Insights. */
  insuredAddress: string
  /** Short company blurb for Customer Insights AI summary (~10–20 words). */
  companyDescription?: string
  productName: string
  productCode: string
  lobCode: string
  lobName: string
  productVersion: string
  /** Human-readable tenure, e.g. "12 months". */
  productTenure: string
  /** Whether the product supports renewal (shown as Y/N in C360). */
  renewalApplicable: boolean
  revenueUsd: number
  limitRequestedUsd: number
  receivedAt: string
  completenessPct: number
  tier: CyberTier
  recommendation: CyberDecision
  decision: CyberDecision
  decisionReason?: string
  /** New business vs renewal — drives Insights and queue filters. */
  submissionKind: SubmissionKind
  gaps: ControlGap[]
  appetiteHits: AppetiteHit[]
  vendors: VendorExposure[]
  platformCards: PlatformCard[]
  /** Per threat/impact item id → UW judgment */
  riskJudgments: Record<string, RiskJudgment>
  /** Docs still needed before package is decision ready */
  missingDocs?: string[]
  packageDocs: PackageDoc[]
  formSignals: FormSignal[]
  dossierSummary: string
  signalScore: number
  pasStatus: PasStatus
  signalStatus: SignalStatus
  /** UW advanced stage cursor (0 Policy Documents … 3 Getting Ready to Quote). */
  workflowStage: number
  /** Ops to UW handoff timestamp */
  opsHandoffAt?: string
  /** UW financial / authority confirmation before Quote */
  financialSignOff?: FinancialSignOff
  /** Policy period (Q18 effective date → expiry). */
  policyStartAt?: string
  policyEndAt?: string
  /** UW / Ops confirmation that ingested documents are the right package. */
  packageSignOff?: PackageSignOff
  /** UW edits to extracted application answers (`sectionId::label`). */
  answerOverrides?: Record<string, string>
  /** When true, skip Customer Insights and open workflow stages. */
  customer360Dismissed?: boolean
  audit: { at: string; actor: string; action: string }[]
}
