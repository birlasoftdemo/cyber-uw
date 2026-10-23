import type { CSSProperties, ReactNode } from 'react'

const CX = 100
const CY = 114
const R = 84

/** Semicircle length. The twin-reading stroke uses this as its dash. */
export const INSTRUMENT_ARC_LEN = Math.PI * R

function point(pct: number): { x: number; y: number } {
  const t = Math.min(1, Math.max(0, pct))
  const angle = Math.PI * (1 - t)
  return {
    x: CX + R * Math.cos(angle),
    y: CY - R * Math.sin(angle),
  }
}

export function RiskInstrumentFigure({
  fillPct,
  markPct,
  highlightPct,
  startLabel,
  endLabel,
  markLabel,
  figureLabel,
  hot,
  children,
}: {
  fillPct: number
  markPct: number
  highlightPct: number | null
  startLabel: string
  endLabel: string
  markLabel: string
  figureLabel: string
  hot: boolean
  children: ReactNode
}) {
  const start = point(0)
  const end = point(1)
  const d = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${R} ${R} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
  const mark = point(markPct)
  const tip = point(fillPct)
  const arcLen = INSTRUMENT_ARC_LEN
  const clampedFill = Math.min(1, Math.max(0, fillPct))
  const clampedHot = Math.min(1, Math.max(0, highlightPct ?? 0))
  const style = {
    '--arc-len': arcLen,
    '--arc-rest': arcLen * (1 - clampedFill),
    '--arc-hot-rest': arcLen * (1 - clampedHot),
  } as CSSProperties

  return (
    <div className="wb-instrument__dial">
      <div className="wb-instrument__frame">
        <svg
          className="wb-instrument__svg"
          viewBox="0 0 200 132"
          role="img"
          aria-label={figureLabel}
          style={style}
          data-hot={hot ? 'true' : 'false'}
        >
          <path className="wb-instrument__arc-track" d={d} vectorEffect="non-scaling-stroke" />
          <path className="wb-instrument__arc-value" d={d} vectorEffect="non-scaling-stroke" />
          <path className="wb-instrument__arc-hot" d={d} vectorEffect="non-scaling-stroke" />
          <circle
            className="wb-instrument__mark"
            cx={mark.x}
            cy={mark.y}
            r="3.25"
            vectorEffect="non-scaling-stroke"
          >
            <title>{markLabel}</title>
          </circle>
          <circle
            className="wb-instrument__tip"
            cx={tip.x}
            cy={tip.y}
            r="3.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="wb-instrument__readout wb-instrument__detail">{children}</div>
      </div>
      <div className="wb-instrument__ends">
        <span>{startLabel}</span>
        <span>{markLabel}</span>
        <span>{endLabel}</span>
      </div>
    </div>
  )
}
