import { Button } from '@heroui/react'
import { ArrowLeft, ArrowUpRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { WorkbenchPageHeader } from '../shared/workbench/WorkbenchPageHeader'
import { BirlasoftLogo } from './components/BirlasoftLogo'
import { CyberAppSidebar } from './components/CyberAppSidebar'
import { CyberNewSubmissionModal } from './components/CyberNewSubmissionModal'
import { CyberShellToolbar } from './components/CyberShellToolbar'
import { CyberCasesListPage } from './components/CyberWorkbenchDesk'
import {
  FormShippingCenter,
  type ReturnedOuttakePrefill,
} from './components/FormShippingCenter'
import { CaseWorkspace } from './components/CaseWorkspace'
import {
  DiscussionReferModal,
  type DiscussionReferDraft,
} from './components/DiscussionReferModal'
import { ReferralInbox } from './components/ReferralInbox'
import { InsightsLanding } from './insights/InsightsLanding'
import { useAuthStore } from './store/authStore'
import { useCyberUwStore } from './store/cyberUwStore'
import type { CyberShellView } from './components/CyberShellToolbar'
import { CaseMetaChips, decisionTitle } from './components/CyberPrimitives'

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
  } = useCyberUwStore()
  const role = useAuthStore((s) => s.user?.role)
  const pending = cases.filter((c) => c.decision === 'pending').length
  const activeReferrals = referrals.filter((r) => r.status !== 'resolved').length
  const [shellView, setShellView] = useState<CyberShellView>(() => defaultViewForRole(role))
  const [submissionPrefill, setSubmissionPrefill] = useState<ReturnedOuttakePrefill | null>(null)
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({})
  const [referDraft, setReferDraft] = useState<DiscussionReferDraft | null>(null)

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

  const openInWorkbench = (caseId: string) => {
    selectCase(caseId)
    setTab('workflow')
    setShellView('workbench')
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
        ? 'Cyber Insurance Overview'
        : shellView === 'referrals'
          ? role === 'ops'
            ? 'Escalation Inbox'
            : 'Escalations'
          : selectedCase
            ? selectedCase.insured
            : 'Open cases'

  const showCaseDetail = shellView === 'workbench' && Boolean(selectedId)
  const caseSaved = selectedId ? Boolean(bookmarkedIds[selectedId]) : false
  const dispositionLabel = selectedCase
    ? selectedCase.decision === 'pending'
      ? 'UW Pending'
      : `UW ${decisionTitle(selectedCase.decision)}`
    : ''

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

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <CyberAppSidebar
        shellView={shellView}
        onShellViewChange={setShellView}
        focusMode={showCaseDetail}
      />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="workbench-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <WorkbenchPageHeader
              leading={<BirlasoftLogo />}
              title={pageTitle}
              count={
                shellView === 'workbench' && !selectedId
                  ? pending
                  : shellView === 'referrals'
                    ? activeReferrals
                    : undefined
              }
              countLabel={
                shellView === 'referrals'
                  ? role === 'ops'
                    ? 'active escalation'
                    : 'open escalation'
                  : 'open case'
              }
              subtitle={
                showCaseDetail && selectedCase ? (
                  <>
                    <span className="wb-ref-pill">{selectedCase.id}</span>
                    <CaseMetaChips
                      lob={selectedCase.sector}
                      name={selectedCase.broker}
                      limitUsd={selectedCase.limitRequestedUsd}
                    />
                    <span className="text-xs font-medium text-slate-500">{dispositionLabel}</span>
                  </>
                ) : undefined
              }
              meta={
                shellView === 'workbench' && !selectedId ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="ai-cta"
                      onPress={() => openNewSubmission()}
                    >
                      <Sparkles size={14} />
                      New Submission
                    </Button>
                  </div>
                ) : undefined
              }
              actions={
                showCaseDetail && selectedCase ? (
                  <>
                    <Button variant="primary" size="sm" onPress={clearCaseSelection}>
                      <ArrowLeft size={14} />
                      Open cases
                    </Button>
                    {role === 'underwriter' ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onPress={openSubmissionRefer}
                        aria-label="Refer submission to underwriter"
                      >
                        <ArrowUpRight size={14} />
                        Refer to Underwriter
                      </Button>
                    ) : null}
                    <Button
                      variant="secondary"
                      size="sm"
                      onPress={() =>
                        setBookmarkedIds((cur) => ({
                          ...cur,
                          [selectedCase.id]: !cur[selectedCase.id],
                        }))
                      }
                    >
                      {caseSaved ? 'Bookmarked' : 'Save for later'}
                    </Button>
                  </>
                ) : shellView === 'workbench' && !selectedId ? (
                  <CyberShellToolbar shellView={shellView} onShellViewChange={setShellView} />
                ) : undefined
              }
            />

          {shellView === 'shipping' ? (
            <div className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden p-3 md:p-4">
              <div className="wb-panel flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4">
                <FormShippingCenter onProceedToClosure={proceedToClosure} />
              </div>
            </div>
          ) : shellView === 'insights' ? (
            <InsightsLanding onOpenCase={openInWorkbench} personaLens={role ?? 'underwriter'} />
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
                <CaseWorkspace />
              </div>
            </div>
          ) : (
            <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden p-3 md:p-4">
              <CyberCasesListPage onSelect={selectCase} />
            </div>
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
          submitDiscussionReferral(input)
          setReferDraft(null)
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
