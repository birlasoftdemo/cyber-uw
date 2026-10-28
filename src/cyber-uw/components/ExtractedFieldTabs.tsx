import { Tabs } from '@heroui/react'
import {
  Building2,
  CreditCard,
  Database,
  FileText,
  Handshake,
  Pencil,
  PencilOff,
  Landmark,
  LifeBuoy,
  Network,
  Scale,
  Shield,
  ShieldCheck,
  TrendingDown,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'
import {
  POLICY_PRIMARY_TABS,
  policyPrimaryIdForSection,
  sectionReportsForCase,
  type SectionReport,
} from '../data/cyberTriageRules'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberCase } from '../types'
import { SectionSourcePreview } from './PackageDocumentTabs'
import { IngestQuestionGrid } from './QuestionFields'

const SECTION_ICON: Record<string, LucideIcon> = {
  data_inventory: Database,
  privacy_controls: Shield,
  network_security: Network,
  payment_card: CreditCard,
  content_liability: FileText,
  bc_dr_ir: LifeBuoy,
  vendor_controls: Handshake,
  outsourced_services: Building2,
  loss_information: TrendingDown,
  requested_insurance_terms: Scale,
  requested_terms: Landmark,
  current_coverage: ShieldCheck,
}

const PRIMARY_ICON: Record<string, LucideIcon> = {
  data_privacy: Database,
  security_resilience: Shield,
  third_party: Handshake,
  coverage_loss: Scale,
}

function sectionsInPrimary(primaryId: string, reports: SectionReport[]) {
  const group = POLICY_PRIMARY_TABS.find((tab) => tab.id === primaryId)
  if (!group) return []
  const byId = new Map(reports.map((report) => [report.section.id, report]))
  return group.sectionIds.flatMap((id) => {
    const report = byId.get(id)
    return report ? [report] : []
  })
}

export function ExtractedFieldTabs({ c }: { c: CyberCase }) {
  const reports = sectionReportsForCase(c)
  const focusId = useCyberUwStore((s) => s.dossierFocusId)
  const [selected, setSelected] = useState<string | null>(null)
  const [seenFocus, setSeenFocus] = useState<string | null>(null)
  const [sourceOpen, setSourceOpen] = useState<string | null>(null)
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({})

  const focusSection = focusId
    ? reports.find(
        (report) => focusId === report.section.id || focusId.startsWith(`${report.section.id}-`),
      )?.section.id
    : undefined

  if (focusId !== seenFocus) {
    setSeenFocus(focusId)
    if (focusSection) setSelected(focusSection)
  }

  const primaries = POLICY_PRIMARY_TABS.filter((tab) => sectionsInPrimary(tab.id, reports).length > 0)

  if (!reports.length || !primaries.length) {
    return <p className="mt-2 text-sm text-slate-500">No extracted fields.</p>
  }

  const activeSection =
    selected && reports.some((report) => report.section.id === selected)
      ? selected
      : reports[0].section.id
  const activePrimary = policyPrimaryIdForSection(activeSection) ?? primaries[0].id

  return (
    <Tabs
      className="wb-pkg-tabs mt-2"
      selectedKey={activePrimary}
      onSelectionChange={(key) => {
        if (key == null) return
        const next = sectionsInPrimary(String(key), reports)
        if (!next.some((report) => report.section.id === activeSection)) {
          setSelected(next[0]?.section.id ?? null)
        }
      }}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Policy document groups">
          {primaries.map((tab) => {
            const Icon = PRIMARY_ICON[tab.id] ?? FileText
            return (
              <Tabs.Tab key={tab.id} id={tab.id}>
                <Icon size={18} strokeWidth={1.75} aria-hidden />
                <span>{tab.label}</span>
              </Tabs.Tab>
            )
          })}
        </Tabs.List>
      </Tabs.ListContainer>
      {primaries.map((tab) => {
        const sections = sectionsInPrimary(tab.id, reports)
        const sectionKey = sections.some((report) => report.section.id === activeSection)
          ? activeSection
          : sections[0]?.section.id
        return (
          <Tabs.Panel key={tab.id} id={tab.id}>
            <Tabs
              className="wb-pkg-subtabs"
              selectedKey={sectionKey}
              onSelectionChange={(key) => {
                if (key != null) setSelected(String(key))
              }}
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label={`${tab.label} sections`}>
                  {sections.map((report) => {
                    const Icon = SECTION_ICON[report.section.id] ?? FileText
                    return (
                      <Tabs.Tab key={report.section.id} id={report.section.id}>
                        <Icon size={18} strokeWidth={1.75} aria-hidden />
                        <span>{report.section.tabLabel}</span>
                      </Tabs.Tab>
                    )
                  })}
                </Tabs.List>
              </Tabs.ListContainer>
              {sections.map((report) => {
                const showingSource = sourceOpen === report.section.id
                const editing = Boolean(editingSections[report.section.id])
                return (
                  <Tabs.Panel key={report.section.id} id={report.section.id}>
                    <div className="wb-extract-tabs__meta-row">
                      <p className="wb-extract-tabs__meta">
                        {report.fields.length} {report.fields.length === 1 ? 'field' : 'fields'} · Q
                        {report.section.questions}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="wb-q-pen"
                          aria-pressed={editing}
                          aria-label={
                            editing
                              ? `Lock ${report.section.title}`
                              : `Edit ${report.section.title}`
                          }
                          onClick={() =>
                            setEditingSections((current) => ({
                              ...current,
                              [report.section.id]: !current[report.section.id],
                            }))
                          }
                        >
                          {editing ? <PencilOff size={14} /> : <Pencil size={14} />}
                        </button>
                        <button
                          type="button"
                          className="wb-extract-tabs__source"
                          aria-expanded={showingSource}
                          onClick={() =>
                            setSourceOpen((current) =>
                              current === report.section.id ? null : report.section.id,
                            )
                          }
                        >
                          <FileText size={14} strokeWidth={1.75} aria-hidden />
                          View Source Document
                        </button>
                      </div>
                    </div>
                    {showingSource ? (
                      <SectionSourcePreview sectionId={report.section.id} />
                    ) : (
                      <IngestQuestionGrid
                        caseId={c.id}
                        sectionId={report.section.id}
                        fields={report.fields}
                        editing={editing}
                      />
                    )}
                  </Tabs.Panel>
                )
              })}
            </Tabs>
          </Tabs.Panel>
        )
      })}
    </Tabs>
  )
}
