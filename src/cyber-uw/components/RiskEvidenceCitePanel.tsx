import { Button } from '@heroui/react'
import { X } from 'lucide-react'

export type RiskEvidenceCiteSource = 'market' | 'capacity'

export interface RiskEvidenceCiteRow {
  id: string
  label: string
  finding: string
}

interface Props {
  open: boolean
  onClose: () => void
  source: RiskEvidenceCiteSource
  rows: RiskEvidenceCiteRow[]
}

const SOURCE_LABEL: Record<RiskEvidenceCiteSource, string> = {
  market: 'Market · sources',
  capacity: 'Capacity · sources',
}

/** Shared right slide-in for Risk Analysis cite-backs (market or capacity opener). */
export function RiskEvidenceCitePanel({ open, onClose, source, rows }: Props) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/30"
      role="presentation"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={SOURCE_LABEL[source]}
        className="flex h-full w-full max-w-md flex-col border-l bg-white shadow-2xl"
        style={{ borderColor: 'var(--cuw-hairline, #e2e8f0)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b px-5 py-4" style={{ borderColor: 'var(--cuw-hairline, #e2e8f0)' }}>
          <div>
            <p className="cuw-type-caption">{SOURCE_LABEL[source]}</p>
            <h2 className="cuw-type-title mt-1 text-[1.05rem]">Cite trail</h2>
            <p className="cuw-type-caption mt-1">{rows.length} source{rows.length === 1 ? '' : 's'}</p>
          </div>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Close cites" onPress={onClose}>
            <X size={16} />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          {rows.length === 0 ? (
            <p className="cuw-type-caption px-5 py-4">No cite-backs for this region.</p>
          ) : (
            <ul className="m-0 list-none p-0">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="border-b px-5 py-3"
                  style={{ borderColor: 'var(--cuw-hairline, #e2e8f0)' }}
                >
                  <p className="cuw-type-title text-[0.875rem]">{row.label}</p>
                  <p className="cuw-type-caption mt-1">{row.finding}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="cuw-type-caption border-t px-5 py-3" style={{ borderColor: 'var(--cuw-hairline, #e2e8f0)' }}>
          Source trail only — deeper cite-backs, not KPI tiles.
        </p>
      </aside>
    </div>
  )
}
