import { Button } from '@heroui/react'
import { Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { WorkbenchPageHeader } from '../shared/workbench/WorkbenchPageHeader'
import { CyberAppSidebar } from './components/CyberAppSidebar'
import { CyberNewSubmissionModal } from './components/CyberNewSubmissionModal'
import { CyberShellToolbar } from './components/CyberShellToolbar'
import { CyberWorkbenchStrip } from './components/CyberWorkbenchDesk'
import {
  FormShippingCenter,
  type ReturnedOuttakePrefill,
} from './components/FormShippingCenter'
import { CaseWorkspace } from './components/CaseWorkspace'
import { InsightsLanding } from './insights/InsightsLanding'
import { useCyberUwStore } from './store/cyberUwStore'
import type { CyberShellView } from './components/CyberShellToolbar'

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
  } = useCyberUwStore()
  const pending = cases.filter((c) => c.decision === 'pending').length
  const [shellView, setShellView] = useState<CyberShellView>('insights')
  const [submissionPrefill, setSubmissionPrefill] = useState<ReturnedOuttakePrefill | null>(null)

  useEffect(() => {
    if (!toastMessage) return
    const t = window.setTimeout(() => clearToast(), 3800)
    return () => window.clearTimeout(t)
  }, [toastMessage, clearToast])

  // Keep canvas populated when entering workbench with no selection
  useEffect(() => {
    if (shellView !== 'workbench' || selectedId) return
    const first = cases.find((c) => c.decision === 'pending') ?? cases[0]
    if (first) selectCase(first.id)
  }, [shellView, selectedId, cases, selectCase])

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

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <CyberAppSidebar shellView={shellView} onShellViewChange={setShellView} />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="workbench-page relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <WorkbenchPageHeader
            eyebrow="Cyber UW"
            title={
              shellView === 'shipping'
                ? 'Manage Submissions'
                : shellView === 'insights'
                  ? 'Cyber Insurance Overview'
                  : 'Decision Workbench'
            }
            count={shellView === 'workbench' ? pending : undefined}
            countLabel="open decision"
            meta={
              shellView === 'workbench' ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="ai-cta"
                  onPress={() => openNewSubmission()}
                >
                  <Sparkles size={14} />
                  New Submission
                </Button>
              ) : undefined
            }
            actions={
              shellView === 'workbench' ? (
                <CyberShellToolbar shellView={shellView} onShellViewChange={setShellView} />
              ) : undefined
            }
          />

          {shellView === 'shipping' ? (
            <div className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 overflow-hidden p-3 md:p-4">
              <div className="wb-panel flex h-full min-h-0 flex-col overflow-hidden p-3 md:p-4">
                <FormShippingCenter
                  onNewSubmission={openNewSubmission}
                  onProceedToClosure={proceedToClosure}
                />
              </div>
            </div>
          ) : shellView === 'insights' ? (
            <InsightsLanding onOpenCase={openInWorkbench} />
          ) : (
            <div className="mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 gap-3 overflow-hidden p-3 md:grid-cols-[190px_1fr] md:p-4">
              <CyberWorkbenchStrip
                selectedId={selectedId}
                onSelect={selectCase}
                onBackToQueue={clearCaseSelection}
              />
              <div id="cyber-main" className="wb-panel min-h-0 min-w-0 overflow-hidden">
                <CaseWorkspace />
              </div>
            </div>
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
