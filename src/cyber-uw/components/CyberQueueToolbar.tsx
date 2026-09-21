import { Button } from '@heroui/react'
import { Sparkles } from 'lucide-react'
import { filterCyberCases, useCyberUwStore } from '../store/cyberUwStore'

export function CyberQueueToolbar() {
  const {
    cases,
    searchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
    filterSubmissionKind,
    setUploadOpen,
  } = useCyberUwStore()

  const filteredCount = filterCyberCases(cases, {
    searchQuery,
    filterRecommendation,
    filterDecision,
    filterSector,
    filterSubmissionKind,
  }).length

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-3 py-2.5">
      <Button size="sm" variant="secondary" className="ai-cta" onPress={() => setUploadOpen(true)}>
        <Sparkles size={14} />
        New Submission
      </Button>
      <span className="text-xs text-slate-500">
        {filteredCount} of {cases.length} shown
      </span>
    </div>
  )
}
