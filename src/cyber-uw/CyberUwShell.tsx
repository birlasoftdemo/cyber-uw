import { Button } from '@heroui/react'
import { ArrowLeft, Maximize2, Minimize2, Sparkles } from 'lucide-react'
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
import { ReferralInbox } from './components/ReferralInbox'
import { InsightsLanding } from './insights/InsightsLanding'
import { useAuthStore } from './store/authStore'
import { useCyberUwStore } from './store/cyberUwStore'
import type { CyberShellView } from './components/CyberShellToolbar'
import { CaseMetaChips, decisionTitle } from './components/CyberPrimitives'

const FOCUS_KEY = 'cyber-uw-workflow-focus'

function defaultViewForRole(_role: 'underwriter' | 'ops' | undefined): CyberShellView {
  return 'workbench'
}

function loadFocus(): boolean {
  try {
    return sessionStorage.getItem(FOCUS_KEY) === '1'
  } catch {
    return false
  }
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
  } = useCyberUwStore()
  const role = useAuthStore((s) => s.user?.role)
  const pending = cases.filter((c) => c.decision === 'pending').length
  const activeReferrals = referrals.filter((r) => r.status !== 'resolved').length
  const [shellView, setShellView] = useState<CyberShellView>(() => defaultViewForRole(role))
  const [submissionPrefill, setSubmissionPrefill] = useState<ReturnedOuttakePrefill | null>(null)
  const [focusMode, setFocusMode] = useState(loadFocus)
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setShellView(defaultViewForRole(role))
  }, [role])

  useEffect(() => {
    try {
      sessionStorage.setItem(FOCUS_KEY, focusMode ? '1' : '0')
    } catch {
      /* ignore */
    }
  }, [focusMode])

  useEffect(() => {
    if (!toastMessage) return
    const t = window.setTimeout(() => clearToast(), 3800)
    return () => window.clearTimeout(t)
  }, [toastMessage, clearToast])

  // Exit focus when leaving workbench or returning to the list
  useEffect(() => {
    if ((shellView !== 'workbench' || !selectedId) && focusMode) setFocusMode(false)
  }, [shellView, selectedId, focusMode])

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

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <CyberAppSidebar
        shellView={shellView}
        onShellViewChange={setShellView}
        focusMode={focusMode}
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
                        onPress={() => setFocusMode((v) => !v)}
                        aria-pressed={focusMode}
                        aria-label={focusMode ? 'Exit workflow focus' : 'Enter workflow focus'}
                      >
                        {focusMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        {focusMode ? 'Exit focus' : 'Focus mode'}
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
            <div
              className={`mx-auto grid min-h-0 w-full flex-1 grid-cols-1 gap-3 overflow-hidden ${
                focusMode ? 'max-w-none p-0' : 'max-w-[1600px] p-3 md:p-4'
              }`}
            >
              <div
                id="cyber-main"
                className={`wb-panel min-h-0 min-w-0 overflow-hidden ${
                  focusMode ? 'rounded-none border-0' : ''
                }`}
              >
                <CaseWorkspace focusMode={focusMode} />
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
