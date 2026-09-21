import { Check, ChevronRight, FileText, Layers, Shield } from 'lucide-react'

export type ValueCompareStatus = 'meets' | 'below' | 'watch'

export interface ValueCompareCardProps {
  title: string
  category?: string
  detectedValue: string
  permittedValue: string
  /** Upper band for the gauge when numeric; investor label = Capacity. */
  capacityValue?: string
  detectedSource?: string
  status: ValueCompareStatus
  statusDetail?: string
  onViewSource?: () => void
  /** When false, omit header chrome (parent owns title row). Default true. */
  showHeader?: boolean
}

/** Parse $5M / 5,000,000 / 5.0M style amounts to USD number. */
export function parseMoneyish(raw: string): number | null {
  const s = raw.replace(/,/g, '').trim()
  const m = s.match(/\$?\s*([\d.]+)\s*(m|mm|million|b|bn|billion|k)?/i)
  if (!m) return null
  const n = Number(m[1])
  if (!Number.isFinite(n)) return null
  const unit = (m[2] ?? '').toLowerCase()
  if (unit === 'b' || unit === 'bn' || unit === 'billion') return n * 1_000_000_000
  if (unit === 'm' || unit === 'mm' || unit === 'million') return n * 1_000_000
  if (unit === 'k') return n * 1_000
  if (n >= 1000) return n
  return null
}

export function formatCompactMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toLocaleString('en-US')}`
}

function statusLabel(status: ValueCompareStatus): string {
  if (status === 'meets') return 'Meets requirement'
  if (status === 'below') return 'Below permitted'
  return 'Needs review'
}

function statusBannerTitle(status: ValueCompareStatus): string {
  if (status === 'meets') return 'At permitted value'
  if (status === 'below') return 'Below permitted value'
  return 'Needs review'
}

function statusBannerDetail(status: ValueCompareStatus, custom?: string): string {
  if (custom) return custom
  if (status === 'meets') return 'The extracted value meets the minimum requirement.'
  if (status === 'below') return 'The extracted value sits below the permitted value.'
  return 'Compare detected and permitted values before you decide.'
}

export function ValueCompareCard({
  title,
  category = 'Control',
  detectedValue,
  permittedValue,
  capacityValue,
  detectedSource,
  status,
  statusDetail,
  onViewSource,
  showHeader = true,
}: ValueCompareCardProps) {
  const detectedUsd = parseMoneyish(detectedValue)
  const permittedUsd = parseMoneyish(permittedValue)
  const capacityUsd =
    parseMoneyish(capacityValue ?? '') ??
    (permittedUsd != null ? permittedUsd * 2 : null)

  const showGauge = detectedUsd != null && permittedUsd != null && capacityUsd != null && capacityUsd > 0

  const maxUsd = showGauge ? Math.max(capacityUsd!, permittedUsd!, detectedUsd!) * 1.05 : 0
  const pct = (n: number) => Math.min(100, Math.max(0, (n / maxUsd) * 100))
  const permittedPct = showGauge ? pct(permittedUsd!) : 0
  const capacityPct = showGauge ? pct(capacityUsd!) : 0
  const detectedPct = showGauge ? pct(detectedUsd!) : 0
  const bandLeft = Math.min(permittedPct, capacityPct)
  const bandWidth = Math.abs(capacityPct - permittedPct)

  return (
    <article className={`wb-value-compare wb-value-compare--${status}`} aria-label={`${title} value compare`}>
      {showHeader ? (
        <header className="wb-value-compare__head">
          <div className="wb-value-compare__identity">
            <span className="wb-value-compare__icon" aria-hidden>
              <Shield size={16} strokeWidth={1.75} />
            </span>
            <div>
              <p className="wb-value-compare__title">{title}</p>
              <p className="wb-value-compare__category">{category}</p>
            </div>
          </div>
          <span className={`wb-value-compare__pill wb-value-compare__pill--${status}`}>
            <span className="wb-value-compare__pill-dot" aria-hidden />
            {statusLabel(status)}
          </span>
        </header>
      ) : null}

      <div className="wb-value-compare__body">
        <div className="wb-value-compare__panes" role="group" aria-label="Detected versus permitted value">
          <div className="wb-value-compare__pane">
            <div className="wb-value-compare__pane-meta">
              <FileText size={14} strokeWidth={1.75} aria-hidden />
              <span className="wb-value-compare__eyebrow">Extracted from document</span>
            </div>
            <p className="wb-value-compare__label">Detected Value</p>
            <p className="wb-value-compare__amount">
              {detectedUsd != null ? formatCompactMoney(detectedUsd) : detectedValue}
            </p>
            {detectedSource ? (
              <p className="wb-value-compare__source">{detectedSource}</p>
            ) : (
              <p className="wb-value-compare__source">Submission package</p>
            )}
          </div>

          <div className="wb-value-compare__eq" aria-hidden>
            =
          </div>

          <div className="wb-value-compare__pane">
            <div className="wb-value-compare__pane-meta">
              <Layers size={14} strokeWidth={1.75} aria-hidden />
              <span className="wb-value-compare__eyebrow">Policy requirement</span>
            </div>
            <p className="wb-value-compare__label">Permitted Value</p>
            <p className="wb-value-compare__amount">
              {permittedUsd != null ? formatCompactMoney(permittedUsd) : permittedValue}
            </p>
            <p className="wb-value-compare__source">Policy requirement</p>
          </div>
        </div>

        {showGauge ? (
          <div className="wb-value-compare__gauge" aria-hidden>
            <div className="wb-value-compare__track">
              <span
                className="wb-value-compare__band"
                style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
              />
              <span
                className="wb-value-compare__tick wb-value-compare__tick--capacity"
                style={{ left: `${capacityPct}%` }}
              />
              <span
                className="wb-value-compare__thumb"
                style={{ left: `${detectedPct}%` }}
                title="Detected"
              />
            </div>
            <div className="wb-value-compare__gauge-labels">
              <span className="wb-value-compare__zone">Below permitted</span>
              <span className="wb-value-compare__marker" style={{ left: `${permittedPct}%` }}>
                <span className="wb-value-compare__label wb-value-compare__label--sm">
                  {formatCompactMoney(permittedUsd!)}
                </span>
                <span className="wb-value-compare__marker-cap">Permitted</span>
              </span>
              <span className="wb-value-compare__zone wb-value-compare__zone--ok">Within capacity</span>
              <span className="wb-value-compare__marker wb-value-compare__marker--capacity" style={{ left: `${capacityPct}%` }}>
                <span className="wb-value-compare__label wb-value-compare__label--sm">
                  {formatCompactMoney(capacityUsd!)}
                </span>
                <span className="wb-value-compare__marker-cap">Capacity</span>
              </span>
            </div>
          </div>
        ) : null}
      </div>

      <footer className="wb-value-compare__foot">
        <div className={`wb-value-compare__banner wb-value-compare__banner--${status}`}>
          <span className="wb-value-compare__banner-icon" aria-hidden>
            <Check size={14} strokeWidth={2.25} />
          </span>
          <div>
            <p className="wb-value-compare__label wb-value-compare__label--banner">
              {statusBannerTitle(status)}
            </p>
            <p className="wb-value-compare__banner-detail">
              {statusBannerDetail(status, statusDetail)}
            </p>
          </div>
        </div>
        {onViewSource ? (
          <button type="button" className="wb-value-compare__source-btn" onClick={onViewSource}>
            <FileText size={14} strokeWidth={1.75} aria-hidden />
            View source in document
            <ChevronRight size={14} strokeWidth={1.75} aria-hidden />
          </button>
        ) : null}
      </footer>
    </article>
  )
}
