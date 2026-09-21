import { Button, Label, Tabs } from '@heroui/react'
import { FileText, Mail, Loader2, Sparkles, Trash2, UploadCloud, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { StageAgentThinking } from '../../shared/workbench/StageAgentThinking'
import { WorkbenchModalShell } from '../../shared/workbench/WorkbenchModalShell'
import {
  buildIngestionThinkingSteps,
  getThinkingDurationMs,
} from '../../shared/utils/agentThinkingUtils'
import { inferExtractedSubmission } from '../utils/ingestExtract'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { ReturnedOuttakePrefill } from './FormShippingCenter'

const RICH_MAIL_ID = 'mail-brightcare'
const OPS_MAIL_ID = 'mail-meridian-ops'

const MOCK_MAIL_THREADS = [
  {
    id: RICH_MAIL_ID,
    name: 'Alex Morgan',
    from: 'alex.morgan@marsh.com',
    subject: 'RE: Brightcare Digital Health — cyber app package',
  },
  {
    id: OPS_MAIL_ID,
    name: 'Meridian Ops',
    from: 'ops@meridianrisk.com',
    subject: 'RE: Meridian Logistics — incomplete cyber package',
  },
  {
    id: 'mail-1',
    name: 'Alex Morgan',
    from: 'alex.morgan@marsh.com',
    subject: 'RE: Helios Health — cyber app package',
  },
  {
    id: 'mail-3',
    name: 'Birlasoft Intake',
    from: 'intake@birlasoft.internal',
    subject: 'FW: ParcelGrid dossier',
  },
] as const

type SourceTab = 'upload' | 'mail'
type Phase = 'form' | 'thinking' | 'ready'

interface UploadFile {
  id: string
  name: string
  progress: number
  status: 'uploading' | 'ready'
}

interface Props {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  prefill?: ReturnedOuttakePrefill | null
  onOpenInWorkbench: (caseId: string) => void
}

export function CyberNewSubmissionModal({
  isOpen,
  onOpenChange,
  prefill,
  onOpenInWorkbench,
}: Props) {
  const createSubmission = useCyberUwStore((s) => s.createSubmission)
  const [source, setSource] = useState<SourceTab>('upload')
  const [phase, setPhase] = useState<Phase>('form')
  const [mailId, setMailId] = useState<string | null>(null)
  const [mailLoading, setMailLoading] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [docCount, setDocCount] = useState(0)
  const [ingestLabel, setIngestLabel] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const timersRef = useRef<Record<string, ReturnType<typeof setInterval>>>({})
  const mailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const timers = timersRef.current
    return () => {
      Object.values(timers).forEach((t) => clearInterval(t))
      if (mailTimerRef.current) clearTimeout(mailTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isOpen) return
    setPhase('form')
    setCreatedId(null)
    setSource('upload')
    setMailId(null)
    setMailLoading(false)
    setFiles([])
    if (mailTimerRef.current) {
      clearTimeout(mailTimerRef.current)
      mailTimerRef.current = null
    }
  }, [isOpen, prefill])

  if (!isOpen) return null

  const simulateUpload = (id: string) => {
    const existing = timersRef.current[id]
    if (existing) clearInterval(existing)
    timersRef.current[id] = setInterval(() => {
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f
          const progress = Math.min(100, f.progress + 20)
          if (progress >= 100) {
            clearInterval(timersRef.current[id])
            delete timersRef.current[id]
            return { ...f, progress: 100, status: 'ready' }
          }
          return { ...f, progress }
        }),
      )
    }, 180)
  }

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return
    const next: UploadFile[] = Array.from(list).map((file, i) => ({
      id: `cf-${Date.now()}-${i}`,
      name: file.name,
      progress: 0,
      status: 'uploading' as const,
    }))
    setFiles((prev) => [...prev, ...next])
    next.forEach((f) => simulateUpload(f.id))
  }

  const selectSource = (next: SourceTab) => {
    setSource(next)
    if (next === 'mail') {
      setMailLoading(true)
      setMailId(null)
      if (mailTimerRef.current) clearTimeout(mailTimerRef.current)
      mailTimerRef.current = setTimeout(() => {
        setMailLoading(false)
        mailTimerRef.current = null
      }, 1000)
    } else {
      setMailLoading(false)
      if (mailTimerRef.current) {
        clearTimeout(mailTimerRef.current)
        mailTimerRef.current = null
      }
    }
  }

  const sourceReady =
    source === 'upload'
      ? files.length > 0 && files.every((f) => f.status === 'ready')
      : Boolean(mailId) && !mailLoading

  const canSubmit = sourceReady || Boolean(prefill)
  const isThinking = phase === 'thinking'
  const isReady = phase === 'ready' && Boolean(createdId)

  const resolveFileNames = (): string[] => {
    if (source === 'upload') return files.map((f) => f.name)
    const thread = MOCK_MAIL_THREADS.find((m) => m.id === mailId)
    return thread ? [`Mail · ${thread.subject}`] : ['Mail MCP package']
  }

  const handleIngest = () => {
    if (!canSubmit) return
    const names = resolveFileNames()
    const thread = MOCK_MAIL_THREADS.find((m) => m.id === mailId)
    const extracted = inferExtractedSubmission({
      fileNames: names,
      mailId,
      mailSubject: thread?.subject,
    })
    const insured = prefill?.insured || extracted.insured
    const broker = prefill?.broker || extracted.broker
    setDocCount(names.length)
    setIngestLabel(insured)
    setPhase('thinking')
    const id = createSubmission({
      insured,
      broker,
      sector: extracted.sector,
      limitRequestedUsd: extracted.limitRequestedUsd,
      fileNames: names.length ? names : [`${prefill?.outtakeId ?? 'package'}.pdf`],
      sourceOuttakeId: prefill?.outtakeId,
      demoPackage: extracted.demoPackage,
    })
    setCreatedId(id)
    window.setTimeout(() => setPhase('ready'), getThinkingDurationMs())
  }

  const handleClose = () => {
    if (isThinking) return
    onOpenChange(false)
  }

  const handleOpenWorkbench = () => {
    if (!createdId) return
    onOpenChange(false)
    onOpenInWorkbench(createdId)
  }

  const isOpsPackage = ingestLabel === 'Meridian Logistics' || mailId === OPS_MAIL_ID

  return (
    <WorkbenchModalShell
      eyebrow={isReady ? 'Ready' : isThinking ? 'Ingesting' : 'Cyber UW'}
      title={
        isReady
          ? 'Submission ready'
          : isThinking
            ? 'AI ingestion & extraction'
            : 'New Submission'
      }
      meta={createdId ? <span className="wb-ref-pill">{createdId}</span> : undefined}
      maxWidthClass="max-w-xl"
      footer={
        isThinking ? (
          <Button variant="secondary" isDisabled>
            Agent working…
          </Button>
        ) : isReady ? (
          <Button variant="primary" className="ai-cta" onPress={handleOpenWorkbench}>
            Open in Dashboard
          </Button>
        ) : (
          <>
            <Button variant="secondary" onPress={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="ai-cta"
              isDisabled={!canSubmit}
              onPress={handleIngest}
            >
              <Sparkles size={14} className="shrink-0" />
              Ingest package
            </Button>
          </>
        )
      }
    >
      {isThinking && createdId ? (
        <StageAgentThinking
          kind="ingestion"
          label="AI ingestion & document extraction"
          namedInsured={ingestLabel}
          headerText="AI ingestion & document extraction"
          steps={buildIngestionThinkingSteps(ingestLabel, docCount)}
        />
      ) : isReady ? (
        <div className="wb-ai-success-panel">
          <div className="flex items-start gap-2">
            <Sparkles size={18} className="mt-0.5 shrink-0" />
            <p>
              <span className="font-semibold">{createdId}</span>
              {isOpsPackage
                ? ' is in the Ops queue. Extracted fields are in Policy Documents. Complete intake, then Ready for UW.'
                : ' is in the decision queue. Review Policy Documents, then Risk Information, Risk Analysis, and Getting Ready to Quote.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {prefill ? (
            <p className="rounded-lg border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs text-emerald-900">
              Prefilling from returned outtake <strong>{prefill.outtakeId}</strong> (
              {prefill.packageLabel}). Named insured and broker will be extracted from the package.
            </p>
          ) : null}

          <p className="text-xs text-slate-600">
            Upload the broker package. The ingestion agent extracts named insured, broker, sector,
            limit, and control fields into Policy Documents.
          </p>

          <div>
            <Label className="text-xs font-semibold text-slate-600">Package source</Label>
            <Tabs
              selectedKey={source}
              onSelectionChange={(k) => selectSource(k as SourceTab)}
              className="case-drawer-tabs mt-1"
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Package source" className="gap-1">
                  <Tabs.Tab id="upload">
                    <UploadCloud size={12} className="mr-1 inline" />
                    Upload
                  </Tabs.Tab>
                  <Tabs.Tab id="mail">
                    <Mail size={12} className="mr-1 inline" />
                    Mail MCP
                  </Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>
            </Tabs>

            {source === 'upload' ? (
              <div className="mt-2">
                <button
                  type="button"
                  className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-sm transition ${
                    isDragging
                      ? 'border-violet-400 bg-violet-50'
                      : 'border-slate-300 bg-slate-50 hover:border-blue-300'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    addFiles(e.dataTransfer.files)
                  }}
                >
                  <UploadCloud size={22} className="mb-2 text-slate-500" />
                  <span className="font-medium text-slate-800">Drop app, loss runs, or evidence</span>
                  <span className="mt-1 text-xs text-slate-500">PDF, images, email</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    addFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
                {files.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {files.map((f) => (
                      <li
                        key={f.id}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                      >
                        <FileText size={14} className="text-slate-500" />
                        <span className="min-w-0 flex-1 truncate font-medium text-slate-800">
                          {f.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {f.status === 'ready' ? 'Ready' : `${f.progress}%`}
                        </span>
                        <button
                          type="button"
                          className="text-slate-400 hover:text-red-600"
                          aria-label={`Remove ${f.name}`}
                          onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}

            {source === 'mail' ? (
              mailLoading ? (
                <div className="mt-6 flex flex-col items-center justify-center gap-3 py-10 text-slate-600">
                  <Loader2 size={28} className="animate-spin text-slate-800" />
                  <p className="text-sm font-medium text-slate-800">Fetching inbox…</p>
                </div>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {MOCK_MAIL_THREADS.map((m) => {
                    const selected = mailId === m.id
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => setMailId(m.id)}
                          className={`w-full rounded-lg border px-3 py-2.5 text-left transition ${
                            selected
                              ? 'border-slate-900 bg-slate-50'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <span className="flex items-start gap-2.5">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                              <User size={16} />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-semibold text-slate-900">
                                {m.name}
                              </span>
                              <span className="block text-xs text-slate-500">{m.from}</span>
                              <span className="mt-1.5 block text-sm text-slate-800">{m.subject}</span>
                            </span>
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )
            ) : null}
          </div>
        </div>
      )}
    </WorkbenchModalShell>
  )
}
