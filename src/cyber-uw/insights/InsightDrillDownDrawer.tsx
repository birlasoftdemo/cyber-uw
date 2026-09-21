import { Button } from '@heroui/react'
import { X } from 'lucide-react'
import { rowsForSelection } from './insightsDemo'
import type { DrillDownSelection } from './types'

interface Props {
  selection: DrillDownSelection | null
  onClose: () => void
  onOpenCase: (caseId: string) => void
}

export function InsightDrillDownDrawer({ selection, onClose, onOpenCase }: Props) {
  if (!selection) return null

  const rows = rowsForSelection(selection.chartId, selection.segment, selection.count)

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/30" role="presentation" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={selection.title}
        className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="dashboard-eyebrow">Drill-down</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">{selection.title}</h2>
            <p className="dashboard-caption mt-1">{rows.length} cases · segment count {selection.count}</p>
          </div>
          <Button isIconOnly size="sm" variant="ghost" aria-label="Close drill-down" onPress={onClose}>
            <X size={16} />
          </Button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 font-semibold">Case</th>
                <th className="px-4 py-2 font-semibold">Stage</th>
                <th className="px-4 py-2 font-semibold">Limit</th>
                <th className="px-4 py-2 font-semibold">Gaps</th>
                <th className="px-4 py-2 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-slate-900">{row.insured}</p>
                    <p className="text-xs text-slate-500">
                      {row.id} · {row.sector}
                    </p>
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{row.stage}</td>
                  <td className="px-4 py-2.5 text-slate-700">
                    ${(row.limitRequestedUsd / 1_000_000).toFixed(1)}M
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">{row.gapCriticalCount}</td>
                  <td className="px-4 py-2.5 text-right">
                    {row.isReal ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onPress={() => {
                          onOpenCase(row.id)
                          onClose()
                        }}
                      >
                        Open
                      </Button>
                    ) : (
                      <span className="text-xs text-slate-400">Demo</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </aside>
    </div>
  )
}
