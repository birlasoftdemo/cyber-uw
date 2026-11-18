import { useEffect, useState } from 'react'
import { WorkbenchPageHeader } from '../shared/workbench/WorkbenchPageHeader'
import { CaseActionsMenu } from './components/CaseActionsMenu'
import { HeaderUserMenu } from './components/HeaderUserMenu'
import { CasesHome } from './components/CasesHome'
import { CyberNewSubmissionModal } from './components/CyberNewSubmissionModal'
import type { CyberShellView } from './components/CyberShellToolbar'
import {
  journeyStepForCase,
  workflowStageForJourney,
  type JourneyStepId,
} from './constants/journeyNav'
import { SpecSidebar, type SpecQueue } from './components/SpecSidebar'
import {
  FormShippingCenter,
  type ReturnedOuttakePrefill,
} from './components/FormShippingCenter'
import { CaseContextHeader } from './components/CaseContextHeader'
import { CaseWorkspace } from './components/CaseWorkspace'
import { JourneyPrevNextBar } from './components/StageJourneyStepper'
import { EnrichmentConsentModal } from './components/EnrichmentConsentModal'
import { IntakeOverrideModal } from './components/IntakeOverrideModal'
import {
  DiscussionReferModal,
  type DiscussionReferDraft,
} from './components/DiscussionReferModal'
import { InfoRequiredModal, type InfoRequestDraft } from './components/InfoRequiredModal'
import { ReferralInbox } from './components/ReferralInbox'
import { ReportsDashboard } from './components/ReportsDashboard'
import { packageIncompleteForCase } from './data/clientFeedbackDemo'
import { useAuthStore } from './store/authStore'
import { useCyberUwStore } from './store/cyberUwStore'
import type { CyberCase, ReferralTicket } from './types'

function downloadCase(c: CyberCase) {
  const body = [
    c.insured,
    c.id,
    c.broker,
    c.sector,
    c.lobName,
    c.productCode,
  ].join('\n')
  const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${c.id}.txt`
  link.click()
  URL.revokeObjectURL(url)
}

function referrerFor(caseId: string, referrals: ReferralTicket[], fallback: string) {
  const named = referrals.filter((ticket) => ticket.caseId === caseId && ticket.referredBy)
  const open = named.filter((ticket) => ticket.status !== 'resolved')
  const pool = open.length > 0 ? open : named
  const latest = [...pool].sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]
  return latest?.referredBy ?? fallback
}

function defaultViewForRole(_role: 'underwriter' | 'ops' | undefined): CyberShellView {
  return 'workbench'
}

export function CyberUwShell() {
  const {
    cases,
    selectedId,
    selectCase,
    clearCaseSelection,
    setTab,
    createSubmission,
    toastMessage,
    toastTone,
    clearToast,
    uploadOpen,
    setUploadOpen,
    referrals,
    submitDiscussionReferral,
    requestBrokerInfo,
  } = useCyberUwStore()
  const user = useAuthStore((s) => s.user)
  const role = user?.role
  const activeReferrals = referrals.filter((r) => r.status !== 'resolved').length
  const [shellView, setShellView] = useState<CyberShellView>(() => defaultViewForRole(role))
  const [queue, setQueue] = useState<SpecQueue>('all')
  const [journeyStep, setJourneyStep] = useState<JourneyStepId>('intake')
  const [submissionPrefill, setSubmissionPrefill] = useState<ReturnedOuttakePrefill | null>(null)
  const [referDraft, setReferDraft] = useState<DiscussionReferDraft | null>(null)
  const [infoDraft, setInfoDraft] = useState<InfoRequestDraft | null>(null)
  const [caseOrigin, setCaseOrigin] = useState<'tasks' | null>(null)
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({})
  const [enrichmentConsentOpen, setEnrichmentConsentOpen] = useState(false)
  const [intakeOverrideOpen, setIntakeOverrideOpen] = useState(false)
  const [pendingJourney, setPendingJourney] = useState<JourneyStepId | null>(null)
  const setWorkflowStage = useCyberUwStore((s) => s.setWorkflowStage)
  const recordEnrichmentConsent = useCyberUwStore((s) => s.recordEnrichmentConsent)
  const acknowledgeIntakeOverride = useCyberUwStore((s) => s.acknowledgeIntakeOverride)

  useEffect(() => {
    setShellView(defaultViewForRole(role))
  }, [role])

  useEffect(() => {
    if (!toastMessage) return
    const t = window.setTimeout(() => clearToast(), 3800)
    return () => window.clearTimeout(t)
  }, [toastMessage, clearToast])

  const openNewSubmission = (prefill?: ReturnedOuttakePrefill) => {
    setSubmissionPrefill(prefill ?? null)
    setUploadOpen(true)
  }

  const openInWorkbench = (caseId: string, origin?: 'tasks') => {
    setCaseOrigin(origin ?? null)
    selectCase(caseId)
    setTab('workflow')
    setShellView('workbench')
    const opened = cases.find((row) => row.id === caseId)
    if (opened) setJourneyStep(journeyStepForCase(opened))
  }

  const proceedToClosure = (prefill: ReturnedOuttakePrefill) => {
    const existing = cases.find(
      (c) =>
        c.insured.toLowerCase() === prefill.insured.toLowerCase() ||
        c.audit.some((a) => a.action.includes(prefill.outtakeId)),
    )
    if (existing) {
      selectCase(existing.id)
      setTab('workflow')
    } else {
      createSubmission({
        insured: prefill.insured,
        broker: prefill.broker,
        sector: 'Technology / SaaS',
        limitRequestedUsd: 5_000_000,
        fileNames: [`${prefill.outtakeId}-returned.pdf`],
        sourceOuttakeId: prefill.outtakeId,
      })
    }
    setShellView('workbench')
  }

  const selectedCase = selectedId ? cases.find((c) => c.id === selectedId) : undefined
  const pageTitle =
    shellView === 'shipping'
      ? 'Manage Submissions'
      : shellView === 'insights'
        ? 'Reports'
        : shellView === 'referrals'
          ? role === 'ops'
            ? 'Escalation Inbox'
            : 'Escalations'
            : selectedCase
            ? selectedCase.insured
            : 'Adaptive Cyber Underwriting Intelligence'

  const showCaseDetail = shellView === 'workbench' && Boolean(selectedId)
  const showCasesHome = shellView === 'workbench' && !selectedId

  const chooseQueue = (next: SpecQueue) => {
    setCaseOrigin(null)
    setQueue(next)
    clearCaseSelection()
    setShellView('workbench')
  }

  const openSubmissionRefer = () => {
    if (!selectedCase) return
    setReferDraft({
      caseId: selectedCase.id,
      kind: 'submission',
      sourceId: selectedCase.id,
      sourceLabel: `${selectedCase.insured} · ${selectedCase.id}`,
      insured: selectedCase.insured,
      broker: selectedCase.broker,
    })
  }

  const openInfoRequest = () => {
    if (!selectedCase) return
    setInfoDraft({
      caseId: selectedCase.id,
      insured: selectedCase.insured,
      broker: selectedCase.broker,
    })
  }

  useEffect(() => {
    const onInfo = () => {
      if (!selectedCase) return
      setInfoDraft({
        caseId: selectedCase.id,
        insured: selectedCase.insured,
        broker: selectedCase.broker,
      })
    }
    window.addEventListener('cuw-open-info-request', onInfo)
    return () => window.removeEventListener('cuw-open-info-request', onInfo)
  }, [selectedCase])

  const referredByName = selectedCase
    ? referrerFor(selectedCase.id, referrals, user?.name ?? 'Underwriter')
    : null

  const advanceJourney = (step: JourneyStepId) => {
    if (
      step === 'enrichment' &&
      selectedCase &&
      !(selectedCase.enrichmentConsent?.models.length)
    ) {
      setPendingJourney(step)
      setEnrichmentConsentOpen(true)
      return
    }
    setJourneyStep(step)
    if (selectedId) setWorkflowStage(selectedId, workflowStageForJourney(step))
  }

  const goJourney = (step: JourneyStepId) => {
    if (
      selectedCase &&
      step !== 'intake' &&
      packageIncompleteForCase(selectedCase) &&
      !selectedCase.intakeOverride
    ) {
      setPendingJourney(step)
      setIntakeOverrideOpen(true)
      setJourneyStep('intake')
      return
    }
    advanceJourney(step)
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <SpecSidebar
        shellView={shellView}
        queue={queue}
        caseOpen={showCaseDetail}
        journeyStep={journeyStep}
        onQueue={chooseQueue}
        onJourney={goJourney}
        onNavigate={(view) => {
          if (view !== 'workbench') {
            setCaseOrigin(null)
            clearCaseSelection()
          }
          setShellView(view)
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main
          className={`workbench-page relative flex min-h-0 flex-1 flex-col overflow-hidden${
            showCaseDetail ? ' cuw-case-open cuw-spec-case' : ''
          }`}
        >
          {showCasesHome ? null : (
          <WorkbenchPageHeader
              leading={
                showCaseDetail && selectedCase ? (
                  <button type="button" className="spec-back-btn" onClick={() => {
                    setCaseOrigin(null)
                    clearCaseSelection()
                  }}>
                    <span aria-hidden>‹</span>
                    Back to Dashboard
                  </button>
                ) : undefined
              }
              title={pageTitle}
              count={shellView === 'referrals' ? activeReferrals : undefined}
              countLabel={
                shellView === 'referrals'
                  ? role === 'ops'
                    ? 'active escalation'
                    : 'open escalation'
                  : 'open case'
              }
              actions={<HeaderUserMenu />}
            />
          )}
          {showCaseDetail && selectedCase ? (
            <>
              <CaseContextHeader c={selectedCase} />
              <JourneyPrevNextBar
                journeyStep={journeyStep}
                onJourney={goJourney}
                actions={
                  <CaseActionsMenu
                    fromTasks={caseOrigin === 'tasks'}
                    referredBy={referredByName}
                    bookmarked={Boolean(bookmarks[selectedCase.id])}
                    onRefer={openSubmissionRefer}
                    onInfo={openInfoRequest}
                    onCopy={() => {
                      void navigator.clipboard.writeText(`${selectedCase.insured} · ${selectedCase.id}`)
                    }}
                    onDownload={() => downloadCase(selectedCase)}
                    onBookmark={() =>
                      setBookmarks((current) => ({
                        ...current,
                        [selectedCase.id]: !current[selectedCase.id],
                      }))
                    }
                  />
                }
              />
            </>
          ) : null}

          {shellView === 'shipping' ? (
            <div className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden p-3 md:p-4">
              <div className="wb-panel flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4">
                <FormShippingCenter onProceedToClosure={proceedToClosure} />
              </div>
            </div>
          ) : shellView === 'insights' ? (
            <ReportsDashboard onOpenCase={openInWorkbench} />
          ) : shellView === 'referrals' ? (
            <ReferralInbox
              onOpenCase={openInWorkbench}
              onRemindBroker={() => setShellView('shipping')}
            />
          ) : (
            showCaseDetail ? (
            <div className="mx-auto grid min-h-0 w-full max-w-none flex-1 grid-cols-1 gap-3 overflow-hidden p-0">
              <div
                id="cyber-main"
                className="wb-panel min-h-0 min-w-0 overflow-hidden rounded-none border-0"
              >
                <CaseWorkspace journeyStep={journeyStep} />
              </div>
            </div>
          ) : (
            <CasesHome
              queue={queue}
              onQueue={chooseQueue}
              onSelect={openInWorkbench}
              onNew={() => openNewSubmission()}
            />
          )
          )}
        </main>
      </div>

      <CyberNewSubmissionModal
        isOpen={uploadOpen}
        onOpenChange={(open) => {
          setUploadOpen(open)
          if (!open) setSubmissionPrefill(null)
        }}
        prefill={submissionPrefill}
        onOpenInWorkbench={openInWorkbench}
      />

      <DiscussionReferModal
        draft={referDraft}
        onCancel={() => setReferDraft(null)}
        onConfirm={(input) => {
          submitDiscussionReferral({ ...input, referredBy: user?.name ?? 'Underwriter' })
          setReferDraft(null)
        }}
      />

      <InfoRequiredModal
        draft={infoDraft}
        onCancel={() => setInfoDraft(null)}
        onConfirm={(note) => {
          if (!infoDraft) return
          requestBrokerInfo({
            caseId: infoDraft.caseId,
            note,
            referredBy: user?.name ?? 'Underwriter',
          })
          setInfoDraft(null)
        }}
      />

      <IntakeOverrideModal
        caseItem={selectedCase ?? null}
        open={intakeOverrideOpen}
        onCancel={() => {
          setIntakeOverrideOpen(false)
          setPendingJourney(null)
          setJourneyStep('intake')
        }}
        onConfirm={() => {
          if (!selectedCase) return
          acknowledgeIntakeOverride(
            selectedCase.id,
            'Proceed with incomplete package — missing docs still block affirmative risk scoring.',
          )
          const next = pendingJourney
          setIntakeOverrideOpen(false)
          setPendingJourney(null)
          if (next && next !== 'intake') advanceJourney(next)
        }}
      />

      <EnrichmentConsentModal
        caseItem={selectedCase ?? null}
        open={enrichmentConsentOpen}
        onCancel={() => {
          setEnrichmentConsentOpen(false)
          setPendingJourney(null)
        }}
        onConfirm={(models) => {
          if (!selectedCase || !user) return
          recordEnrichmentConsent(selectedCase.id, models, {
            userId: user.email,
            userName: user.name,
          })
          const next = pendingJourney ?? 'enrichment'
          setJourneyStep(next)
          setWorkflowStage(selectedCase.id, workflowStageForJourney(next))
          setEnrichmentConsentOpen(false)
          setPendingJourney(null)
        }}
      />

      <div aria-live="polite" aria-atomic="true" className="contents">
        {toastMessage ? (
          <div
            role="status"
            data-tone={toastTone}
            className={`fixed bottom-5 right-5 z-50 max-w-sm rounded-xl border bg-white px-4 py-3 text-sm shadow-lg ${
              toastTone === 'warn' ? 'border-amber-200' : 'border-slate-200'
            }`}
          >
            <p className="font-medium text-slate-900">{toastMessage}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
