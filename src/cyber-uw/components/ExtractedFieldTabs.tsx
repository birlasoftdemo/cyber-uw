import { Tabs } from '@heroui/react'
import {
  Building2,
  CreditCard,
  Database,
  FileText,
  Handshake,
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
import { sectionReportsForCase } from '../data/cyberTriageRules'
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

export function ExtractedFieldTabs({ c }: { c: CyberCase }) {
  const reports = sectionReportsForCase(c)
  const focusId = useCyberUwStore((s) => s.dossierFocusId)
  const [selected, setSelected] = useState<string | null>(null)
  const [seenFocus, setSeenFocus] = useState<string | null>(null)
  const [sourceOpen, setSourceOpen] = useState<string | null>(null)

  const focusSection = focusId
    ? reports.find(
        (report) => focusId === report.section.id || focusId.startsWith(`${report.section.id}-`),
      )?.section.id
    : undefined

  if (focusId !== seenFocus) {
    setSeenFocus(focusId)
    if (focusSection) setSelected(focusSection)
  }

  if (!reports.length) {
    return <p className="mt-2 text-sm text-slate-500">No extracted fields.</p>
  }

  const active =
    selected && reports.some((report) => report.section.id === selected)
      ? selected
      : reports[0].section.id

  return (
    <Tabs
      className="wb-pkg-tabs mt-2"
      selectedKey={active}
      onSelectionChange={(key) => {
        if (key != null) setSelected(String(key))
      }}
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Extracted fields">
          {reports.map((report) => {
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
      {reports.map((report) => {
        const showingSource = sourceOpen === report.section.id
        return (
          <Tabs.Panel key={report.section.id} id={report.section.id}>
            <div className="wb-extract-tabs__meta-row">
              <p className="wb-extract-tabs__meta">
                {report.fields.length} {report.fields.length === 1 ? 'field' : 'fields'} · Q
                {report.section.questions}
              </p>
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
            {showingSource ? (
              <SectionSourcePreview sectionId={report.section.id} />
            ) : (
              <IngestQuestionGrid
                caseId={c.id}
                sectionId={report.section.id}
                fields={report.fields}
              />
            )}
          </Tabs.Panel>
        )
      })}
    </Tabs>
  )
}
