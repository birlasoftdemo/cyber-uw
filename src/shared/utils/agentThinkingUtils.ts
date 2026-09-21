export type ThinkingStep = {
  agent: string
  title: string
  detail: string
}

export type StageThinkingKind = 'workflow' | 'feedback_prep' | 'ingestion'

/** Demo thinking duration — keep snappy for local UX. */
export function getThinkingDurationMs(): number {
  return 3200
}

/** Upload — AI ingestion & document extraction (plays in upload modal). */
export function buildIngestionThinkingSteps(namedInsured: string, docCount: number): ThinkingStep[] {
  return [
    {
      agent: 'Ideate',
      title: 'Ingest submission package',
      detail: `Receiving broker package for **${namedInsured}** and normalizing ${docCount || 'attached'} document${docCount === 1 ? '' : 's'}.`,
    },
    {
      agent: 'Debate',
      title: 'Classify documents',
      detail: 'Tagging application, SOV, loss runs, and supporting files; flagging missing or illegible pages.',
    },
    {
      agent: 'Synthesize',
      title: 'Extract structured fields',
      detail: 'Pulling named insured, LOB, limits, locations, and schedule values into Policy Documents.',
    },
    {
      agent: 'Debate',
      title: 'Confidence gate',
      detail: 'Scoring extraction confidence and preparing the case for human review in Policy Documents.',
    },
  ]
}

export function resolveThinkingSteps(state: {
  kind?: StageThinkingKind
  fromStatus?: string
  label: string
  namedInsured: string
}): ThinkingStep[] {
  if (state.kind === 'ingestion') {
    return buildIngestionThinkingSteps(state.namedInsured, 0)
  }
  return [
    {
      agent: 'Ideate',
      title: 'Assess stage readiness',
      detail: `Checking gates for **${state.namedInsured}** before “${state.label}”.`,
    },
    {
      agent: 'Debate',
      title: 'Reconcile signals',
      detail: 'Comparing document quality, appetite scores, and broker-facing drafts for conflicts.',
    },
    {
      agent: 'Synthesize',
      title: 'Package handoff',
      detail: 'Preparing the next Workflow milestone payload and timeline events.',
    },
  ]
}
