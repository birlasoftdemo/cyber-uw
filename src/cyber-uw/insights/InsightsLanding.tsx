import { useState } from 'react'
import type { AuthRole } from '../store/authStore'
import { HeroKpiTile } from './HeroKpiTile'
import {
  BookRiskProfilerCard,
  CycleTimeChart,
  DecisionTrendChart,
  GapSeverityChart,
  LimitConcentrationChart,
  RecVsDecisionChart,
  RiskThreatTrendChart,
  SectorDecisionChart,
  SubmissionKindChart,
  RiskMapHeatmapChart,
  StageAgingChart,
  TopExposuresPanel,
  VendorAccumulationChart,
} from './InsightCharts'
import { InsightDrillDownDrawer } from './InsightDrillDownDrawer'
import { InsightSection } from './InsightSection'
import { heroKpis, kpiDeltas, kpiSparklines } from './insightsDemo'
import type { DrillDownSelection } from './types'

interface Props {
  onOpenCase: (caseId: string) => void
  personaLens?: AuthRole
}

export function InsightsLanding({ onOpenCase, personaLens = 'underwriter' }: Props) {
  const [limitCountMode, setLimitCountMode] = useState(false)
  const [selection, setSelection] = useState<DrillDownSelection | null>(null)
  const opsFirst = personaLens === 'ops'

  const openDrill = (sel: DrillDownSelection) => setSelection(sel)

  const speedSection = (
    <InsightSection title="Speed">
      <StageAgingChart onDrill={openDrill} />
      <CycleTimeChart onDrill={openDrill} />
      <DecisionTrendChart onDrill={openDrill} />
    </InsightSection>
  )

  const qualitySection = (
    <InsightSection title="Quality">
      <GapSeverityChart onDrill={openDrill} />
      <RecVsDecisionChart onDrill={openDrill} />
    </InsightSection>
  )

  const portfolioSection = (
    <InsightSection title="Portfolio">
      <SubmissionKindChart onDrill={openDrill} />
      <LimitConcentrationChart onDrill={openDrill} highlightHigh={limitCountMode} />
      <SectorDecisionChart onDrill={openDrill} />
      <VendorAccumulationChart onDrill={openDrill} />
    </InsightSection>
  )

  const riskSection = (
    <InsightSection title="Risk">
      <RiskThreatTrendChart onDrill={openDrill} />
      <RiskMapHeatmapChart onDrill={openDrill} />
      <TopExposuresPanel onDrill={openDrill} />
      <BookRiskProfilerCard onDrill={openDrill} />
    </InsightSection>
  )

  return (
    <div className="dashboard-page min-h-0 flex-1 overflow-auto">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 md:px-6 md:py-6">
        <div className="mt-0 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <HeroKpiTile
           
            title="Median days to decision-ready"
            value={`${heroKpis.medianDaysToDecision}`}
            status="on-track"
            spark={kpiSparklines.medianDaysToDecision}
            delta={kpiDeltas.medianDaysToDecision}
            invertDelta
            onClick={() =>
              openDrill({
                chartId: 'heroKpi',
                title: 'Decision-ready cases',
                count: 8,
                segment: { kpi: 'decisionReady' },
              })
            }
          />
          <HeroKpiTile
            
            title="Document Completion"
            value={`${heroKpis.signalCompletenessHealth}%`}
            status="watch"
            spark={kpiSparklines.signalCompletenessHealth}
            delta={kpiDeltas.signalCompletenessHealth}
            onClick={() =>
              openDrill({
                chartId: 'heroKpi',
                title: 'Signal / completeness',
                count: 10,
                segment: { kpi: 'signalHealth' },
              })
            }
          />
          <HeroKpiTile
            
            title="Pipeline Limit (Active)"
            value={
              limitCountMode
                ? String(heroKpis.limitOver5mCount)
                : `$${heroKpis.pipelineLimitMillions}M`
            }
            status="watch"
            spark={kpiSparklines.pipelineLimitMillions}
            delta={kpiDeltas.pipelineLimitMillions}
            highlight={limitCountMode}
            toggle={{
              id: 'limit-toggle',
              label: 'Count ≥$5M',
              checked: limitCountMode,
              onChange: setLimitCountMode,
            }}
            onClick={() =>
              openDrill({
                chartId: 'heroKpi',
                title: 'Pipeline limit',
                count: limitCountMode ? heroKpis.limitOver5mCount : 12,
                segment: { kpi: 'pipelineLimit', mode: limitCountMode ? 'count' : 'sum' },
              })
            }
          />
          <HeroKpiTile
            
            title="Critical Gaps"
            value={String(heroKpis.gapBlockedBacklog)}
            status="action"
            spark={kpiSparklines.gapBlockedBacklog}
            delta={kpiDeltas.gapBlockedBacklog}
            invertDelta
            onClick={() =>
              openDrill({
                chartId: 'heroKpi',
                title: 'Gap-blocked backlog',
                count: heroKpis.gapBlockedBacklog,
                segment: { kpi: 'gapBlocked' },
              })
            }
          />
        </div>

        {opsFirst ? (
          <>
            {speedSection}
            {qualitySection}
            {portfolioSection}
            {riskSection}
          </>
        ) : (
          <>
            {portfolioSection}
            {riskSection}
            {qualitySection}
            {speedSection}
          </>
        )}
      </div>

      <InsightDrillDownDrawer
        selection={selection}
        onClose={() => setSelection(null)}
        onOpenCase={onOpenCase}
      />
    </div>
  )
}
