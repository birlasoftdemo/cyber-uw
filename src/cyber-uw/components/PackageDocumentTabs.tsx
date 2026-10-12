import { Download } from 'lucide-react'
import { INTAKE_SHEET_ROWS } from '../data/intakeSheetPreview'

const WORKBOOK_HREF = '/exhibits/Brightcare_Cyber_Application_Intake_Ideal.xlsx'
const WORKBOOK_FILENAME = 'Brightcare_Cyber_Application_Intake_Ideal.xlsx'

/** Intake-sheet section names keyed by extracted-field section id. */
const SHEET_SECTION_BY_ID: Record<string, string> = {
  data_inventory: 'Data Inventory',
  privacy_controls: 'Privacy Controls',
  network_security: 'Network Security',
  payment_card: 'Payment Card (PCI)',
  content_liability: 'Content / Media Liability',
  bc_dr_ir: 'BC / DR / IR',
  vendor_controls: 'Vendor Controls',
  outsourced_services: 'Outsourced Services',
  loss_information: 'Loss Information',
  requested_insurance_terms: 'Requested Insurance Terms',
  requested_terms: 'Requested Terms',
  current_coverage: 'Current Coverage',
}

function downloadWorkbook() {
  const anchor = document.createElement('a')
  anchor.href = WORKBOOK_HREF
  anchor.download = WORKBOOK_FILENAME
  anchor.click()
}

export function SectionSourcePreview({ sectionId }: { sectionId: string }) {
  const sheetSection = SHEET_SECTION_BY_ID[sectionId]
  const rows = INTAKE_SHEET_ROWS.filter((row) => row.section === sheetSection)

  return (
    <div className="wb-source-doc">
      <div className="wb-pkg-doc__tools">
        <button type="button" className="wb-pkg-control" onClick={downloadWorkbook}>
          <Download size={13} strokeWidth={2} aria-hidden />
          Download
        </button>
      </div>
      {rows.length ? (
        <div className="wb-pkg-preview">
          <table className="wb-pkg-sheet">
            <caption className="sr-only">
              {sheetSection ? `${sheetSection} intake rows` : 'Intake workbook preview'}
            </caption>
            <thead>
              <tr>
                <th>Section</th>
                <th>Ref</th>
                <th>Question</th>
                <th>Ideal answer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.section}-${row.ref}-${row.question}`}>
                  <td>{row.section}</td>
                  <td>{row.ref}</td>
                  <td>{row.question}</td>
                  <td>{row.answer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="wb-source-doc__empty">No source rows for this section.</p>
      )}
    </div>
  )
}
