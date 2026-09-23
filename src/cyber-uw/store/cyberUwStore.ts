import { create } from 'zustand'
import {
  canLeavePolicyDocuments,
  canLeaveRiskInformation,
  canOpsMarkReadyForUw,
  isFinancialSignOffComplete,
  isWithinJuniorAuthority,
  needsManagerCosign,
} from '../constants/cyberFlow'
import { inferBucketFromControl } from '../constants/qualificationBuckets'
import { buildDemoIngestedCase } from '../data/demoIngest'
import { defaultFormSignals, packageDocsFromNames } from '../data/dossierPackage'
import { inferExtractedSubmission } from '../utils/ingestExtract'
import { missingDocsForCase } from '../utils/missingDocs'
import { MOCK_CYBER_CASES } from '../data/mockCases'
import { allAnswerKeysForCase } from '../data/cyberTriageRules'
import {
  buildOpsDemoIngestedCase,
  buildOpsDemoReferral,
} from '../data/opsDemoIngest'
import { buildPlatformCards } from '../data/platformDemo'
import { CYBER_PRODUCT_DEFAULTS, defaultInsuredAddress } from '../data/productIdentity'
import { SEED_REFERRALS } from '../data/seedReferrals'
import type {
  CyberCase,
  CyberDecision,
  CyberTier,
  FinancialSignOff,
  PlatformSignOff,
  ReferralKind,
  ReferralStatus,
  ReferralTicket,
  RiskJudgmentStatus,
} from '../types'

export type CyberRecFilter = 'all' | Exclude<CyberDecision, 'pending'>
export type CyberDecisionFilter = 'all' | CyberDecision
export type CyberSectorFilter = 'all' | string
export type CyberSubmissionKindFilter = 'all' | 'new_business' | 'renewal'

export type DemoPackageKind = boolean | 'uw' | 'ops'

function expandSignedAnswerKeys(c: CyberCase): string[] {
  const prev = c.packageSignOff?.signedAnswerKeys ?? []
  if (prev.includes('*')) return allAnswerKeysForCase(c)
  return prev.filter((k) => k !== '*')
}

function signedKeysWithout(c: CyberCase, dropKey: string): string[] {
  return expandSignedAnswerKeys(c).filter((k) => k !== dropKey)
}

export interface CyberUploadInput {
  insured?: string
  broker?: string
  sector?: string
  limitRequestedUsd?: number
  fileNames: string[]
  sourceOuttakeId?: string
  /** Brightcare UW dossier (`true`/`uw`) or Meridian Ops incomplete (`ops`). */
  demoPackage?: DemoPackageKind
}

export interface DiscussionReferralInput {
  caseId: string
  kind: ReferralKind
  sourceId: string
  sourceLabel: string
  target: import('../types').ReferralTarget
  assigneeLabel: string
  note: string
}

export type FinancialSignOffInput = Omit<
  FinancialSignOff,
  'signedOffAt' | 'signedOffBy' | 'withinAuthority'
> & { withinAuthority?: boolean }

interface CyberUwState {
  cases: CyberCase[]
  referrals: ReferralTicket[]
  selectedId: string | null
  activeTab: 'workflow' | 'dossier'
  /** Scroll/highlight target in Dossier (package doc id or signal-* id). */
  dossierFocusId: string | null
  toastMessage: string | null
  toastTone: 'info' | 'warn'
  searchQuery: string
  filterRecommendation: CyberRecFilter
  filterDecision: CyberDecisionFilter
  filterSector: CyberSectorFilter
  filterSubmissionKind: CyberSubmissionKindFilter
  uploadOpen: boolean
  /** List-view AI pill → open confirm for this disposition */
  listDecisionPrompt: Exclude<CyberDecision, 'pending'> | null
  selectCase: (id: string) => void
  clearCaseSelection: () => void
  setTab: (tab: CyberUwState['activeTab']) => void
  openDossierFocus: (anchorId: string) => void
  clearDossierFocus: () => void
  clearToast: () => void
  setSearchQuery: (q: string) => void
  setFilterRecommendation: (v: CyberRecFilter) => void
  setFilterDecision: (v: CyberDecisionFilter) => void
  setFilterSector: (v: CyberSectorFilter) => void
  setFilterSubmissionKind: (v: CyberSubmissionKindFilter) => void
  clearFilters: () => void
  dismissCustomer360: (id: string) => void
  /** Re-open Customer 360 for a case (tab switch). */
  showCustomer360: (id: string) => void
  setUploadOpen: (open: boolean) => void
  createSubmission: (input: CyberUploadInput) => string
  /** Lock Quote + sync mock PAS for demo completion. */
  completeDemoPath: (id: string) => void
  actOnAiRecommendation: (id: string) => void
  clearListDecisionPrompt: () => void
  runMockSignal: (id: string) => void
  pushToPas: (id: string) => void
  applyDecision: (id: string, decision: Exclude<CyberDecision, 'pending'>, reason: string) => void
  undoDecision: (id: string) => void
  resolveGap: (caseId: string, gapId: string) => void
  /** @deprecated Prefer submitDiscussionReferral for gap refers with inbox handoff */
  referGap: (caseId: string, gapId: string, referredTo: string) => void
  signRiskItem: (
    caseId: string,
    itemId: string,
    status: Exclude<RiskJudgmentStatus, 'pending'>,
    note?: string,
  ) => void
  /** Bulk disposition for Open Risks queue (single toast + audit). */
  signRiskItems: (
    caseId: string,
    itemIds: string[],
    status: Exclude<RiskJudgmentStatus, 'pending'>,
    note?: string,
  ) => void
  signPlatformCard: (
    caseId: string,
    cardId: string,
    signOff: Exclude<PlatformSignOff, 'pending'>,
    termEffect?: string,
  ) => void
  submitDiscussionReferral: (input: DiscussionReferralInput) => void
  resolveReferral: (ticketId: string, resolutionNote?: string) => void
  chaseReferral: (ticketId: string) => void
  returnReferral: (ticketId: string, resolutionNote?: string) => void
  markPackageComplete: (id: string) => void
  markReadyForUw: (id: string) => void
  saveFinancialSignOff: (id: string, input: FinancialSignOffInput) => void
  togglePackageDocAccepted: (caseId: string, docId: string, accepted: boolean) => void
  setPackageDocKind: (caseId: string, docId: string, kind: string) => void
  setAnswerOverride: (caseId: string, key: string, value: string) => void
  toggleAnswerSigned: (caseId: string, key: string, signed: boolean) => void
  signSectionAnswers: (caseId: string, keys: string[]) => void
  signOffPackage: (caseId: string) => void
  /** Advance UW through Policy Documents → Risk Information → Risk Analysis → Getting Ready to Quote. */
  advanceWorkflowStage: (id: string) => void
  /** Jump to a stage. */
  setWorkflowStage: (id: string, stage: number) => void
}

function cloneCases(): CyberCase[] {
  return MOCK_CYBER_CASES.map((c) => ({
    ...c,
    gaps: [...c.gaps],
    vendors: [...c.vendors],
    platformCards: c.platformCards.map((p) => ({ ...p })),
    packageDocs: [...c.packageDocs],
    formSignals: [...c.formSignals],
    packageSignOff: c.packageSignOff
      ? {
          ...c.packageSignOff,
          acceptedDocIds: [...c.packageSignOff.acceptedDocIds],
          signedAnswerKeys: c.packageSignOff.signedAnswerKeys
            ? [...c.packageSignOff.signedAnswerKeys]
            : undefined,
        }
      : undefined,
    answerOverrides: c.answerOverrides ? { ...c.answerOverrides } : undefined,
    riskJudgments: { ...c.riskJudgments },
    appetiteHits: [...c.appetiteHits],
    audit: [...c.audit],
  }))
}

function cloneReferrals(): ReferralTicket[] {
  return SEED_REFERRALS.map((r) => ({ ...r }))
}

let cyberSeq = 2500
let referralSeq = 100

function nextReferralId() {
  referralSeq += 1
  return `ref-${referralSeq}`
}

export const useCyberUwStore = create<CyberUwState>((set, get) => ({
  cases: cloneCases(),
  referrals: cloneReferrals(),
  selectedId: null,
  activeTab: 'workflow',
  dossierFocusId: null,
  toastMessage: null,
  toastTone: 'info',
  searchQuery: '',
  filterRecommendation: 'all',
  filterDecision: 'all',
  filterSector: 'all',
  filterSubmissionKind: 'all',
  uploadOpen: false,
  listDecisionPrompt: null,

  selectCase: (id) => {
    set({
      selectedId: id,
      activeTab: 'workflow',
      dossierFocusId: null,
      toastMessage: null,
      listDecisionPrompt: null,
    })
  },

  clearCaseSelection: () =>
    set({
      selectedId: null,
      dossierFocusId: null,
      toastMessage: null,
      listDecisionPrompt: null,
    }),

  setTab: (tab) => set({ activeTab: tab }),

  openDossierFocus: (anchorId) =>
    set((s) => ({
      activeTab: 'workflow',
      dossierFocusId: anchorId,
      cases: s.cases.map((c) =>
        c.id === s.selectedId ? { ...c, customer360Dismissed: true } : c,
      ),
    })),

  clearDossierFocus: () => set({ dossierFocusId: null }),

  dismissCustomer360: (id) =>
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id ? { ...c, customer360Dismissed: true } : c,
      ),
    })),

  showCustomer360: (id) =>
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id ? { ...c, customer360Dismissed: false } : c,
      ),
      dossierFocusId: null,
    })),

  clearToast: () => set({ toastMessage: null }),

  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilterRecommendation: (v) => set({ filterRecommendation: v }),
  setFilterDecision: (v) => set({ filterDecision: v }),
  setFilterSector: (v) => set({ filterSector: v }),
  setFilterSubmissionKind: (v) => set({ filterSubmissionKind: v }),
  clearFilters: () =>
    set({
      searchQuery: '',
      filterRecommendation: 'all',
      filterDecision: 'all',
      filterSector: 'all',
      filterSubmissionKind: 'all',
    }),

  setUploadOpen: (open) => set({ uploadOpen: open }),

  createSubmission: (input) => {
    cyberSeq += 1
    const id = `CYB-${cyberSeq}`
    const now = new Date().toISOString()
    const extracted = inferExtractedSubmission({ fileNames: input.fileNames })
    const insured = input.insured?.trim() || extracted.insured
    const broker = input.broker?.trim() || extracted.broker
    const sector = input.sector || extracted.sector
    const limitRequestedUsd = input.limitRequestedUsd || extracted.limitRequestedUsd
    const resolvedDemo = input.demoPackage ?? extracted.demoPackage
    const demoKind =
      resolvedDemo === true || resolvedDemo === 'uw'
        ? 'uw'
        : resolvedDemo === 'ops'
          ? 'ops'
          : null

    let next: CyberCase
    let seededReferral: ReferralTicket | null = null

    if (demoKind === 'uw') {
      next = buildDemoIngestedCase(id, now)
      next.insured = insured || next.insured
      next.broker = broker || next.broker
      next.sector = sector || next.sector
      next.limitRequestedUsd = limitRequestedUsd || next.limitRequestedUsd
    } else if (demoKind === 'ops') {
      next = buildOpsDemoIngestedCase(id, now)
      next.insured = insured || next.insured
      next.broker = broker || next.broker
      next.sector = sector || next.sector
      next.limitRequestedUsd = limitRequestedUsd || next.limitRequestedUsd
      seededReferral = buildOpsDemoReferral(id, now)
    } else {
      next = {
        id,
        insured,
        broker: broker || 'Direct',
        sector,
        insuredAddress: defaultInsuredAddress(insured, sector),
        ...CYBER_PRODUCT_DEFAULTS,
        revenueUsd: 50_000_000,
        limitRequestedUsd,
        receivedAt: now,
        policyStartAt: now.slice(0, 10),
        policyEndAt: new Date(new Date(now).setFullYear(new Date(now).getFullYear() + 1))
          .toISOString()
          .slice(0, 10),
        completenessPct: input.fileNames.length ? 70 : 40,
        tier: 3 as CyberTier,
        recommendation: 'refer',
        decision: 'pending',
        submissionKind: 'new_business',
        signalScore: 65,
        signalStatus: 'ready',
        pasStatus: 'idle',
        workflowStage: 0,
        riskJudgments: {},
        gaps: [
          {
            id: `${id}-g1`,
            control: 'MFA on external admin',
            attested: 'Pending review',
            signal: 'Mock scan queued — re-run signal after intake',
            severity: 'medium',
            rfiDraft: 'Complete security questionnaire and attach MFA evidence.',
            disposition: 'open',
            qualificationBucket: inferBucketFromControl('MFA on external admin'),
          },
        ],
        appetiteHits: [
          {
            ruleId: 'APP-INTAKE-01',
            label: 'New submission — review Policy Documents',
            outcome: 'refer',
            detail: 'Package received; AI defaults to escalate until Policy Documents and Risk Analysis are complete.',
          },
        ],
        vendors: [
          { vendor: 'TBD', category: 'Unknown', bookCount: 0, limitHint: 'Disclose vendors' },
        ],
        platformCards: buildPlatformCards(
          id,
          [{ vendor: 'TBD', category: 'Unknown', bookCount: 0, limitHint: 'Disclose vendors' }],
          sector,
          limitRequestedUsd,
        ),
        packageDocs: packageDocsFromNames(
          id,
          input.fileNames.length ? input.fileNames : ['Submission_package.pdf'],
        ),
        missingDocs:
          input.fileNames.length < 3
            ? [
                'Architecture',
                'SOC report',
                'Incident Response Plan',
                'Disaster Recovery Drill report',
                'ISO report',
                'Compliance certifications',
              ]
            : undefined,
        formSignals: defaultFormSignals(id, {
          insured,
          sector,
          limitUsd: limitRequestedUsd,
          mfaAnswer: 'Pending review',
          mfaSignal: 'Mock scan queued — re-run signal after intake',
          mfaGapId: `${id}-g1`,
        }),
        dossierSummary: `New package for ${insured}. ${input.fileNames.length} file(s) attached${
          input.sourceOuttakeId ? ` (from outtake ${input.sourceOuttakeId})` : ''
        }. Complete Policy Documents and Risk Analysis before Quote.`,
        audit: [
          {
            at: now,
            actor: 'Intake Agent',
            action: input.sourceOuttakeId
              ? `Returned intake ${input.sourceOuttakeId} — ${input.fileNames.join(', ') || 'no files'}`
              : `Manual upload — ${input.fileNames.join(', ') || 'no files'}`,
          },
        ],
      }
    }

    set((s) => ({
      cases: [next, ...s.cases],
      referrals: seededReferral ? [seededReferral, ...s.referrals] : s.referrals,
      selectedId: id,
      activeTab: 'workflow',
      toastMessage:
        demoKind === 'uw'
          ? `${id} ready. AI recommends QUOTE. Open the case to review Policy Documents.`
          : demoKind === 'ops'
            ? `${id} Ops package. Complete intake and chase, then Ready for UW.`
            : `${id} created. Review extracted fields in Policy Documents.`,
      toastTone: 'info',
      listDecisionPrompt: null,
    }))
    return id
  },

  completeDemoPath: (id) => {
    const now = new Date().toISOString()
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              decision: 'quote' as const,
              decisionReason:
                'Demo path — AI quote recommendation accepted after ingest (control floors met).',
              pasStatus: 'synced' as const,
              completenessPct: Math.max(c.completenessPct, 96),
              audit: [
                ...c.audit,
                {
                  at: now,
                  actor: 'Underwriter',
                  action: 'Decision QUOTE — demo path completion',
                },
              ],
            }
          : c,
      ),
      selectedId: id,
      activeTab: 'workflow',
      toastMessage: `${id} demo complete. Quote locked.`,
      toastTone: 'info',
      listDecisionPrompt: null,
      uploadOpen: false,
    }))
  },

  actOnAiRecommendation: (id) => {
    const c = get().cases.find((x) => x.id === id)
    if (!c || c.recommendation === 'pending') return
    if (c.decision !== 'pending') {
      set({
        selectedId: id,
        activeTab: 'workflow',
        toastMessage: 'UW decision already locked. Undo first to change it.',
        toastTone: 'warn',
        listDecisionPrompt: null,
      })
      return
    }
    set({
      selectedId: id,
      activeTab: 'workflow',
      listDecisionPrompt: c.recommendation,
      toastMessage: `AI recommends ${c.recommendation.toUpperCase()}. Confirm to lock as UW decision.`,
      toastTone: 'info',
    })
  },

  clearListDecisionPrompt: () => set({ listDecisionPrompt: null }),

  runMockSignal: (id) => {
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id ? { ...c, signalStatus: 'scanning' as const } : c,
      ),
      toastMessage: 'Mock signal scanning. Comparing attestation to external posture…',
      toastTone: 'info',
    }))
    window.setTimeout(() => {
      const openRefs = get().referrals.filter(
        (r) =>
          r.caseId === id &&
          (r.status === 'open' || r.status === 'awaiting_broker' || r.status === 'returned'),
      )
      const toast =
        openRefs.length > 0
          ? `Signal ready. Re-check ${openRefs.length} open escalation${openRefs.length === 1 ? '' : 's'}.`
          : 'Signal ready. Continue in Policy Documents and Risk Analysis.'
      set((s) => ({
        cases: s.cases.map((c) =>
          c.id === id
            ? {
                ...c,
                signalStatus: 'ready' as const,
                workflowStage: openRefs.some((r) => r.kind === 'ingest')
                  ? Math.min(c.workflowStage, 0)
                  : c.workflowStage,
                audit: [
                  ...c.audit,
                  {
                    at: new Date().toISOString(),
                    actor: 'Signal Mock',
                    action:
                      openRefs.length > 0
                        ? `Rescan complete. ${openRefs.length} escalation(s) still open`
                        : 'Rescan complete. Field level diffs refreshed',
                  },
                ],
              }
            : c,
        ),
        toastMessage: toast,
        toastTone: 'info' as const,
        activeTab: 'workflow' as const,
      }))
    }, 1100)
  },

  pushToPas: (id) => {
    const current = get().cases.find((c) => c.id === id)
    if (!current || current.decision === 'pending') {
      set({
          toastMessage: 'Lock Getting Ready to Quote first (Quote / Escalate / Decline).',
        toastTone: 'warn',
      })
      return
    }
    set((s) => ({
      cases: s.cases.map((c) => (c.id === id ? { ...c, pasStatus: 'synced' as const } : c)),
      toastMessage: 'Decision already locked.',
      toastTone: 'info',
      activeTab: 'workflow',
    }))
  },

  applyDecision: (id, decision, reason) => {
    const current = get().cases.find((c) => c.id === id)
    if (!current || current.decision !== 'pending') return

    if (decision === 'quote') {
      const criticalOpen = current.gaps.filter(
        (g) => g.severity === 'critical' && g.disposition === 'open',
      ).length
      const fin = current.financialSignOff
      if (!isFinancialSignOffComplete(fin)) {
        set({
          toastMessage: 'Complete UW financial sign off before locking Quote.',
          toastTone: 'warn',
        })
        return
      }
      const needsCosign = needsManagerCosign({
        limitUsd: fin!.limitUsd,
        pricingTier: fin!.pricingTier,
        criticalOpenGaps: criticalOpen,
      })
      if (needsCosign && !fin!.managerCosign) {
        set({
          toastMessage: 'Manager approval required (over authority or critical gaps).',
          toastTone: 'warn',
        })
        return
      }
    }

    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              decision,
              decisionReason: reason,
              pasStatus: 'synced' as const,
              audit: [
                ...c.audit,
                {
                  at: new Date().toISOString(),
                  actor: 'Underwriter',
                  action: `Decision ${decision.toUpperCase()} — ${reason}`,
                },
              ],
            }
          : c,
      ),
      toastMessage: `UW decision locked: ${decision.toUpperCase()}.`,
      toastTone: 'info',
      activeTab: 'workflow',
      listDecisionPrompt: null,
    }))
  },

  undoDecision: (id) => {
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              decision: 'pending',
              decisionReason: undefined,
              pasStatus: 'idle',
              audit: [
                ...c.audit,
                {
                  at: new Date().toISOString(),
                  actor: 'Underwriter',
                  action: 'Decision undone — returned to pending',
                },
              ],
            }
          : c,
      ),
      toastMessage: 'Decision cleared. Case is pending again.',
      toastTone: 'info',
      activeTab: 'workflow',
      listDecisionPrompt: null,
    }))
  },

  resolveGap: (caseId, gapId) => {
    const now = new Date().toISOString()
    let controlLabel = 'gap'
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        const gaps = c.gaps.map((g) => {
          if (g.id !== gapId || g.disposition !== 'open') return g
          controlLabel = g.control
          return {
            ...g,
            disposition: 'resolved' as const,
            referredTo: undefined,
            signedOffAt: now,
            signedOffBy: 'You (UW)',
          }
        })
        return {
          ...c,
          gaps,
          audit: [
            ...c.audit,
            {
              at: now,
              actor: 'Underwriter',
              action: `Resolved gap: ${controlLabel}`,
            },
          ],
        }
      }),
      toastMessage: `Signed off. Resolved ${controlLabel}.`,
      toastTone: 'info',
    }))
  },

  referGap: (caseId, gapId, referredTo) => {
    const c = get().cases.find((x) => x.id === caseId)
    const g = c?.gaps.find((x) => x.id === gapId)
    get().submitDiscussionReferral({
      caseId,
      kind: 'gap',
      sourceId: gapId,
      sourceLabel: g?.control ?? 'gap',
      target: 'specialist',
      assigneeLabel: referredTo,
      note: '',
    })
  },

  signRiskItem: (caseId, itemId, status, note) => {
    const now = new Date().toISOString()
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        return {
          ...c,
          riskJudgments: {
            ...c.riskJudgments,
            [itemId]: { status, note, signedOffAt: now },
          },
          audit: [
            ...c.audit,
            {
              at: now,
              actor: 'Underwriter',
              action: `Risk · ${status}: ${itemId}${note ? ` — ${note}` : ''}`,
            },
          ],
        }
      }),
      toastMessage: `Risk item ${status === 'accepted' ? 'approved' : status === 'noted' ? 'ignored' : status}.`,
      toastTone: 'info',
    }))
  },

  signRiskItems: (caseId, itemIds, status, note) => {
    const ids = [...new Set(itemIds.filter(Boolean))]
    if (ids.length === 0) return
    if (ids.length === 1) {
      get().signRiskItem(caseId, ids[0], status, note)
      return
    }
    const now = new Date().toISOString()
    const statusWord =
      status === 'accepted' ? 'approved' : status === 'noted' ? 'ignored' : status
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        const riskJudgments = { ...c.riskJudgments }
        for (const itemId of ids) {
          riskJudgments[itemId] = { status, note, signedOffAt: now }
        }
        return {
          ...c,
          riskJudgments,
          audit: [
            ...c.audit,
            {
              at: now,
              actor: 'Underwriter',
              action: `Risk · bulk ${status}: ${ids.length} items${note ? ` — ${note}` : ''}`,
            },
          ],
        }
      }),
      toastMessage: `${ids.length} risk items ${statusWord}.`,
      toastTone: 'info',
    }))
  },

  signPlatformCard: (caseId, cardId, signOff, termEffect) => {
    const now = new Date().toISOString()
    let label = 'platform card'
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        const platformCards = c.platformCards.map((p) => {
          if (p.id !== cardId || p.signOff !== 'pending') return p
          label = p.label
          return {
            ...p,
            signOff,
            termEffect: termEffect || p.termEffect,
            signedOffAt: now,
          }
        })
        return {
          ...c,
          platformCards,
          audit: [
            ...c.audit,
            {
              at: now,
              actor: 'Underwriter',
              action: `Risk Analysis · ${signOff}: ${label}`,
            },
          ],
        }
      }),
      toastMessage: `${label}. ${signOff}.`,
      toastTone: 'info',
    }))
  },

  submitDiscussionReferral: (input) => {
    const now = new Date().toISOString()
    const ticket: ReferralTicket = {
      id: nextReferralId(),
      caseId: input.caseId,
      kind: input.kind,
      sourceId: input.sourceId,
      sourceLabel: input.sourceLabel,
      target: input.target,
      assigneeLabel: input.assigneeLabel,
      note: input.note.trim(),
      status: input.target === 'broker' ? 'awaiting_broker' : 'open',
      createdAt: now,
    }

    set((s) => {
      const cases = s.cases.map((c) => {
        if (c.id !== input.caseId) return c
        let next = { ...c }

        if (input.kind === 'gap') {
          next = {
            ...next,
            gaps: next.gaps.map((g) => {
              if (g.id !== input.sourceId || g.disposition !== 'open') return g
              return {
                ...g,
                disposition: 'referred' as const,
                referredTo: input.assigneeLabel,
                signedOffAt: now,
                signedOffBy: 'You (UW)',
              }
            }),
          }
        } else if (input.kind === 'risk') {
          next = {
            ...next,
            riskJudgments: {
              ...next.riskJudgments,
              [input.sourceId]: {
                status: 'escalated' as const,
                note: input.note.trim() || undefined,
                signedOffAt: now,
              },
            },
          }
        } else if (input.kind === 'platform') {
          next = {
            ...next,
            platformCards: next.platformCards.map((p) => {
              if (p.id !== input.sourceId || p.signOff !== 'pending') return p
              return {
                ...p,
                signOff: 'escalate' as const,
                signedOffAt: now,
              }
            }),
          }
        }
        // ingest: ticket + audit only (package chase stays on New until docs arrive)

        return {
          ...next,
          audit: [
            ...next.audit,
            {
              at: now,
              actor: 'Underwriter',
              action: `Escalated ${input.kind} “${input.sourceLabel}” → ${input.assigneeLabel}${
                input.note.trim() ? ` — ${input.note.trim()}` : ''
              }`,
            },
          ],
        }
      })

      return {
        cases,
        referrals: [ticket, ...s.referrals],
        toastMessage: `Escalation sent · ${input.assigneeLabel}`,
        toastTone: 'info' as const,
      }
    })
  },

  resolveReferral: (ticketId, resolutionNote) => {
    const now = new Date().toISOString()
    const ticket = get().referrals.find((r) => r.id === ticketId)
    if (!ticket || ticket.status === 'resolved') return

    set((s) => {
      const referrals = s.referrals.map((r) =>
        r.id === ticketId
          ? {
              ...r,
              status: 'resolved' as ReferralStatus,
              resolvedAt: now,
              resolutionNote: resolutionNote?.trim() || undefined,
            }
          : r,
      )

      const cases = s.cases.map((c) => {
        if (c.id !== ticket.caseId) return c
        let next = { ...c }

        if (ticket.kind === 'gap') {
          next = {
            ...next,
            gaps: next.gaps.map((g) => {
              if (g.id !== ticket.sourceId) return g
              return {
                ...g,
                disposition: 'resolved' as const,
                referredTo: undefined,
                signedOffAt: now,
                signedOffBy: 'Ops',
              }
            }),
          }
        } else if (ticket.kind === 'risk') {
          next = {
            ...next,
            riskJudgments: {
              ...next.riskJudgments,
              [ticket.sourceId]: {
                status: 'accepted' as const,
                note: resolutionNote?.trim() || 'Resolved via Ops escalation',
                signedOffAt: now,
              },
            },
          }
        } else if (ticket.kind === 'platform') {
          next = {
            ...next,
            platformCards: next.platformCards.map((p) => {
              if (p.id !== ticket.sourceId) return p
              return {
                ...p,
                signOff: 'ignore' as const,
                signedOffAt: now,
              }
            }),
          }
        }

        return {
          ...next,
          audit: [
            ...next.audit,
            {
              at: now,
              actor: 'Ops',
              action: `Resolved escalation: ${ticket.sourceLabel}${
                resolutionNote?.trim() ? ` — ${resolutionNote.trim()}` : ''
              }`,
            },
          ],
        }
      })

      return {
        referrals,
        cases,
        toastMessage: `Escalation resolved. ${ticket.sourceLabel}`,
        toastTone: 'info' as const,
      }
    })
  },

  chaseReferral: (ticketId) => {
    const now = new Date().toISOString()
    const ticket = get().referrals.find((r) => r.id === ticketId)
    if (!ticket) return

    set((s) => ({
      referrals: s.referrals.map((r) =>
        r.id === ticketId ? { ...r, status: 'awaiting_broker' as ReferralStatus } : r,
      ),
      cases: s.cases.map((c) =>
        c.id === ticket.caseId
          ? {
              ...c,
              audit: [
                ...c.audit,
                {
                  at: now,
                  actor: 'Ops',
                  action: `Reminded broker on escalation: ${ticket.sourceLabel} → ${ticket.assigneeLabel}`,
                },
              ],
            }
          : c,
      ),
      toastMessage: `Broker reminder logged. Continue in Manage Submissions for ${ticket.assigneeLabel}.`,
      toastTone: 'info' as const,
    }))
  },

  returnReferral: (ticketId, resolutionNote) => {
    const now = new Date().toISOString()
    const ticket = get().referrals.find((r) => r.id === ticketId)
    if (!ticket) return

    set((s) => ({
      referrals: s.referrals.map((r) =>
        r.id === ticketId
          ? {
              ...r,
              status: 'returned' as ReferralStatus,
              resolutionNote: resolutionNote?.trim() || undefined,
            }
          : r,
      ),
      cases: s.cases.map((c) =>
        c.id === ticket.caseId
          ? {
              ...c,
              workflowStage: Math.min(
                c.workflowStage,
                ticket.kind === 'ingest' ? 0 : 1,
              ),
              audit: [
                ...c.audit,
                {
                  at: now,
                  actor: 'Ops',
                  action: `Returned escalation to UW: ${ticket.sourceLabel}${
                    resolutionNote?.trim() ? ` — ${resolutionNote.trim()}` : ''
                  }`,
                },
              ],
            }
          : c,
      ),
      toastMessage: `Returned to UW. ${ticket.sourceLabel}`,
      toastTone: 'info' as const,
    }))
  },

  markPackageComplete: (id) => {
    const now = new Date().toISOString()
    const current = get().cases.find((c) => c.id === id)
    if (!current || current.decision !== 'pending') return
    if (current.completenessPct >= 80) {
      set({
        toastMessage: 'Package already at decision ready completeness.',
        toastTone: 'info',
      })
      return
    }
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              completenessPct: 88,
              missingDocs: [],
              workflowStage: Math.max(c.workflowStage, 0),
              audit: [
                ...c.audit,
                {
                  at: now,
                  actor: 'Ops',
                  action: 'Package marked complete after chasing missing docs',
                },
              ],
            }
          : c,
      ),
      toastMessage: 'Package complete. Ready for UW when chase is done.',
      toastTone: 'info',
    }))
  },

  markReadyForUw: (id) => {
    const now = new Date().toISOString()
    const current = get().cases.find((c) => c.id === id)
    if (!current) return
    if (!canOpsMarkReadyForUw(current)) {
      set({
        toastMessage:
          current.opsHandoffAt
            ? 'Already handed off to UW.'
            : current.completenessPct < 80
              ? 'Mark package complete (completeness ≥ 80%) before Ready for UW.'
              : 'Cannot hand off this case yet.',
        toastTone: 'warn',
      })
      return
    }
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              opsHandoffAt: now,
              workflowStage: Math.max(c.workflowStage, 1),
              audit: [
                ...c.audit,
                {
                  at: now,
                  actor: 'Ops',
                  action: 'Ready for UW — handoff to Decision Desk (risk & financial authority)',
                },
              ],
            }
          : c,
      ),
      toastMessage: 'Handed off to UW Decision Desk.',
      toastTone: 'info',
    }))
  },

  saveFinancialSignOff: (id, input) => {
    const now = new Date().toISOString()
    const current = get().cases.find((c) => c.id === id)
    if (!current || current.decision !== 'pending') return

    const withinAuthority =
      input.withinAuthority ??
      isWithinJuniorAuthority(input.limitUsd, input.pricingTier)
    const criticalOpen = current.gaps.filter(
      (g) => g.severity === 'critical' && g.disposition === 'open',
    ).length
    const requiresCosign = needsManagerCosign({
      limitUsd: input.limitUsd,
      pricingTier: input.pricingTier,
      criticalOpenGaps: criticalOpen,
    })
    if (requiresCosign && !input.managerCosign) {
      set({
        toastMessage: 'Manager approval required for this limit, tier, or critical gaps.',
        toastTone: 'warn',
      })
      return
    }

    const financialSignOff: FinancialSignOff = {
      limitUsd: input.limitUsd,
      sirUsd: input.sirUsd,
      pricingTier: input.pricingTier,
      stubPremiumUsd: input.stubPremiumUsd,
      withinAuthority,
      managerCosign: input.managerCosign,
      cosignReason: input.cosignReason,
      signedOffAt: now,
      signedOffBy: 'Underwriter',
    }

    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              limitRequestedUsd: input.limitUsd,
              tier: input.pricingTier as CyberTier,
              financialSignOff,
              audit: [
                ...c.audit,
                {
                  at: now,
                  actor: 'Underwriter',
                  action: `Financial sign off · limit $${(input.limitUsd / 1_000_000).toFixed(1)}M · SIR $${(input.sirUsd / 1000).toFixed(0)}k · Tier ${input.pricingTier}${
                    input.managerCosign ? ' · manager approval' : ''
                  }`,
                },
              ],
            }
          : c,
      ),
      toastMessage: 'Financial sign off recorded. Quote can be locked.',
      toastTone: 'info',
    }))
  },

  setPackageDocKind: (caseId, docId, kind) => {
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        return {
          ...c,
          packageDocs: c.packageDocs.map((doc) =>
            doc.id === docId ? { ...doc, kind } : doc,
          ),
        }
      }),
    }))
  },

  togglePackageDocAccepted: (caseId, docId, accepted) => {
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        const current = new Set(c.packageSignOff?.acceptedDocIds ?? [])
        if (accepted) current.add(docId)
        else current.delete(docId)
        return {
          ...c,
          packageSignOff: {
            acceptedDocIds: [...current],
            signedAnswerKeys: c.packageSignOff?.signedAnswerKeys
              ? [...c.packageSignOff.signedAnswerKeys]
              : undefined,
            signedOffAt: undefined,
            signedOffBy: undefined,
          },
        }
      }),
    }))
  },

  setAnswerOverride: (caseId, key, value) => {
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        const signedKeys = signedKeysWithout(c, key)
        return {
          ...c,
          answerOverrides: { ...c.answerOverrides, [key]: value },
          packageSignOff: {
            acceptedDocIds: c.packageSignOff?.acceptedDocIds ?? [],
            signedAnswerKeys: signedKeys,
            signedOffAt: c.packageSignOff?.signedOffAt,
            signedOffBy: c.packageSignOff?.signedOffBy,
          },
        }
      }),
    }))
  },

  toggleAnswerSigned: (caseId, key, signed) => {
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        const next = new Set(expandSignedAnswerKeys(c))
        if (signed) next.add(key)
        else next.delete(key)
        return {
          ...c,
          packageSignOff: {
            acceptedDocIds: c.packageSignOff?.acceptedDocIds ?? [],
            signedAnswerKeys: [...next],
            signedOffAt: c.packageSignOff?.signedOffAt,
            signedOffBy: c.packageSignOff?.signedOffBy,
          },
        }
      }),
    }))
  },

  signSectionAnswers: (caseId, keys) => {
    set((s) => ({
      cases: s.cases.map((c) => {
        if (c.id !== caseId) return c
        const next = new Set(expandSignedAnswerKeys(c))
        for (const key of keys) next.add(key)
        return {
          ...c,
          packageSignOff: {
            acceptedDocIds: c.packageSignOff?.acceptedDocIds ?? [],
            signedAnswerKeys: [...next],
            signedOffAt: c.packageSignOff?.signedOffAt,
            signedOffBy: c.packageSignOff?.signedOffBy,
          },
        }
      }),
    }))
  },

  signOffPackage: (caseId) => {
    const now = new Date().toISOString()
    set((s) => {
      const current = s.cases.find((c) => c.id === caseId)
      if (!current) return s
      const missing = current.completenessPct < 80 || missingDocsForCase(current).length > 0
      if (missing) {
        return {
          ...s,
          toastMessage: 'Finish missing documents before marking Documents Complete.',
          toastTone: 'warn' as const,
        }
      }
      return {
        cases: s.cases.map((c) =>
          c.id === caseId
            ? {
                ...c,
                packageSignOff: {
                  acceptedDocIds: c.packageDocs.map((d) => d.id),
                  signedAnswerKeys: c.packageSignOff?.signedAnswerKeys ?? [],
                  signedOffAt: now,
                  signedOffBy: 'You (UW)',
                },
                audit: [
                  ...c.audit,
                  {
                    at: now,
                    actor: 'Underwriter',
                    action: 'Documents Complete',
                  },
                ],
              }
            : c,
        ),
        toastMessage: 'Documents complete. Continue when ready.',
        toastTone: 'info' as const,
      }
    })
  },

  advanceWorkflowStage: (id) => {
    const now = new Date().toISOString()
    set((s) => {
      const current = s.cases.find((c) => c.id === id)
      if (!current || current.decision !== 'pending') return s
      const from = Math.max(current.workflowStage ?? 0, 0)
      const next = Math.min(3, from + 1)
      if (next === from) return s

      if (from === 0 && !canLeavePolicyDocuments(current)) {
        return {
          ...s,
          toastMessage: current.completenessPct < 80
            ? 'Complete Policy Documents (completeness ≥ 80%) before Risk Information.'
            : 'Mark Documents Complete in Policy Documents before continuing.',
          toastTone: 'warn' as const,
        }
      }
      if (from === 1 && !canLeaveRiskInformation(current)) {
        return {
          ...s,
          toastMessage: 'Approve, Escalate, or Ignore required triage findings before Risk Analysis.',
          toastTone: 'warn' as const,
        }
      }

      return {
        cases: s.cases.map((c) =>
          c.id === id
            ? {
                ...c,
                workflowStage: next,
                audit: [
                  ...c.audit,
                  {
                    at: now,
                    actor: 'Underwriter',
                    action: `Advanced workflow to stage ${next}`,
                  },
                ],
              }
            : c,
        ),
        toastMessage: null,
        toastTone: 'info' as const,
      }
    })
  },

  setWorkflowStage: (id, stage) => {
    const clamped = Math.max(0, Math.min(3, stage))
    set((s) => ({
      cases: s.cases.map((c) =>
        c.id === id
          ? {
              ...c,
              workflowStage: clamped,
              audit: [
                ...c.audit,
                {
                  at: new Date().toISOString(),
                  actor: 'Underwriter',
                  action: `Opened workflow stage ${clamped}`,
                },
              ],
            }
          : c,
      ),
      activeTab: 'workflow',
    }))
  },
}))

/** Dev-only hook for Remotion walkthrough capture scripts. */
if (import.meta.env.DEV && typeof window !== 'undefined') {
  ;(window as unknown as { __CUW_STORE__?: typeof useCyberUwStore }).__CUW_STORE__ =
    useCyberUwStore
}

export function filterCyberCases(
  cases: CyberCase[],
  opts: {
    searchQuery: string
    filterRecommendation: CyberRecFilter
    filterDecision: CyberDecisionFilter
    filterSector: CyberSectorFilter
    filterSubmissionKind: CyberSubmissionKindFilter
  },
): CyberCase[] {
  const q = opts.searchQuery.trim().toLowerCase()
  return cases.filter((c) => {
    if (opts.filterRecommendation !== 'all' && c.recommendation !== opts.filterRecommendation) {
      return false
    }
    if (opts.filterDecision !== 'all' && c.decision !== opts.filterDecision) return false
    if (opts.filterSector !== 'all' && c.sector !== opts.filterSector) return false
    if (opts.filterSubmissionKind !== 'all' && c.submissionKind !== opts.filterSubmissionKind) {
      return false
    }
    if (!q) return true
    return (
      c.id.toLowerCase().includes(q) ||
      c.insured.toLowerCase().includes(q) ||
      c.broker.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q)
    )
  })
}
