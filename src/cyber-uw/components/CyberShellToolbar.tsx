import { Button, Label, Popover, Typography } from '@heroui/react'
import { Filter, X } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { AiSearchBar } from '../../shared/AiSearchBar'
import {
  useCyberUwStore,
  type CyberDecisionFilter,
  type CyberRecFilter,
  type CyberSubmissionKindFilter,
} from '../store/cyberUwStore'

const CYBER_PLACEHOLDERS = [
  'search by case ID',
  'insured name or broker',
  'sector like Healthcare',
] as const

type SpeechRecognitionCtor = new () => {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult:
    | ((event: {
        results: { length: number; [index: number]: { [index: number]: { transcript: string } } }
      }) => void)
    | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export type CyberShellView = 'shipping' | 'workbench' | 'insights' | 'referrals'

interface Props {
  shellView: CyberShellView
  onShellViewChange: (view: CyberShellView) => void
}

export function CyberShellToolbar({ shellView, onShellViewChange }: Props) {
  const {
    cases,
    searchQuery,
    setSearchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
    filterSubmissionKind,
    setFilterRecommendation,
    setFilterDecision,
    setFilterSector,
    setFilterSubmissionKind,
    clearFilters,
    selectCase,
  } = useCyberUwStore()

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [speechUnsupported, setSpeechUnsupported] = useState(false)
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null)

  const sectors = Array.from(new Set(cases.map((c) => c.sector))).sort()
  const activeCount =
    (filterRecommendation !== 'all' ? 1 : 0) +
    (filterDecision !== 'all' ? 1 : 0) +
    (filterSector !== 'all' ? 1 : 0) +
    (filterSubmissionKind !== 'all' ? 1 : 0)

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListening(false)
  }, [])

  const toggleMic = () => {
    if (listening) {
      stopListening()
      return
    }
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setSpeechUnsupported(true)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognitionRef.current = recognition
    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i += 1) {
        transcript += event.results[i][0]?.transcript ?? ''
      }
      const trimmed = transcript.trim()
      if (trimmed) setSearchQuery(trimmed)
    }
    recognition.onerror = () => stopListening()
    recognition.onend = () => setListening(false)
    setListening(true)
    recognition.start()
  }

  const handleSearchSubmit = (text: string) => {
    setSearchQuery(text)
    const match = cases.find(
      (c) =>
        c.id.toLowerCase() === text.toLowerCase() ||
        c.insured.toLowerCase().includes(text.toLowerCase()),
    )
    if (match) {
      onShellViewChange('workbench')
      selectCase(match.id)
    }
  }

  if (shellView !== 'workbench') return null

  const filtersPopover = (
    <Popover isOpen={filtersOpen} onOpenChange={setFiltersOpen}>
      <Popover.Trigger>
        <Button
          variant="secondary"
          size="sm"
          isIconOnly
          className="wb-filter-trigger wb-filter-trigger--icon shrink-0"
          aria-label={activeCount > 0 ? `Filters (${activeCount} active)` : 'Filters'}
        >
          <Filter size={16} />
          {activeCount > 0 ? (
            <span className="wb-filter-trigger__count" aria-hidden>
              {activeCount}
            </span>
          ) : null}
        </Button>
      </Popover.Trigger>
      <Popover.Content placement="bottom end" className="w-[min(100vw-2rem,28rem)] p-0">
        <Popover.Dialog aria-label="Cyber queue filters">
          <Popover.Heading className="border-b border-slate-200 px-4 py-3">
            <Typography.Heading level={6} className="font-display text-sm font-semibold">
              Filters
            </Typography.Heading>
          </Popover.Heading>
          <div className="space-y-3 px-4 py-3">
            <div>
              <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                AI recommendation
              </Label>
              <select
                className="mt-0.5 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                value={filterRecommendation}
                onChange={(e) => setFilterRecommendation(e.target.value as CyberRecFilter)}
                aria-label="Filter by AI recommendation"
              >
                <option value="all">All AI</option>
                <option value="quote">AI Quote</option>
                <option value="refer">AI Escalate</option>
                <option value="decline">AI Decline</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                UW decision
              </Label>
              <select
                className="mt-0.5 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                value={filterDecision}
                onChange={(e) => setFilterDecision(e.target.value as CyberDecisionFilter)}
                aria-label="Filter by UW decision"
              >
                <option value="all">All UW</option>
                <option value="pending">Pending</option>
                <option value="quote">Quoted</option>
                <option value="refer">Escalated</option>
                <option value="decline">Declined</option>
              </select>
            </div>
            <div>
              <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Sector
              </Label>
              <select
                className="mt-0.5 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                aria-label="Filter by sector"
              >
                <option value="all">All sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Submission kind
              </Label>
              <select
                className="mt-0.5 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm"
                value={filterSubmissionKind}
                onChange={(e) =>
                  setFilterSubmissionKind(e.target.value as CyberSubmissionKindFilter)
                }
                aria-label="Filter by submission kind"
              >
                <option value="all">All kinds</option>
                <option value="new_business">New business</option>
                <option value="renewal">Renewal</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              {activeCount > 0 ? (
                <Button size="sm" variant="ghost" onPress={clearFilters}>
                  <X size={14} />
                  Clear
                </Button>
              ) : null}
              <Button size="sm" variant="primary" onPress={() => setFiltersOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </Popover.Dialog>
      </Popover.Content>
    </Popover>
  )

  return (
    <div className="flex min-w-0 flex-col items-end gap-1">
      <AiSearchBar
        collapsible
        value={searchQuery}
        onChange={setSearchQuery}
        placeholders={CYBER_PLACEHOLDERS}
        ariaLabel="AI search cyber queue"
        mic={{
          listening,
          unsupported: speechUnsupported,
          onToggle: toggleMic,
        }}
        onSubmit={handleSearchSubmit}
        trailing={filtersPopover}
      />
      {speechUnsupported ? (
        <Typography.Paragraph size="xs" color="muted" className="text-right">
          Voice input is not supported in this browser.
        </Typography.Paragraph>
      ) : null}
    </div>
  )
}
