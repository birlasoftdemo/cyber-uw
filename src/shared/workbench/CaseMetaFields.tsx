import { Briefcase, Building2, Landmark } from 'lucide-react'
import type { ReactNode } from 'react'

export function formatCompactUsd(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(n)
}

const META_FIELD = {
  lob: { label: 'Line of business', Icon: Building2 },
  name: { label: 'Broker / desk', Icon: Briefcase },
  limit: { label: 'Requested limit', Icon: Landmark },
} as const

export type CaseMetaChipKind = keyof typeof META_FIELD

/** Icon + value meta field (LOB / broker / limit) — shared by Moody + Cyber queues. */
export function CaseMetaChip({
  kind,
  children,
}: {
  kind: CaseMetaChipKind
  children: ReactNode
}) {
  const { label, Icon } = META_FIELD[kind]
  return (
    <span className={`wb-meta-field wb-meta-field--${kind}`} title={label}>
      <Icon size={14} strokeWidth={1.75} className="wb-meta-field__icon" aria-hidden />
      <span className="wb-meta-field__value">
        <span className="sr-only">{label}: </span>
        {children}
      </span>
    </span>
  )
}

export function CaseMetaChips({
  lob,
  name,
  limitUsd,
  className = '',
}: {
  lob: string
  name: string
  limitUsd: number
  className?: string
}) {
  return (
    <div className={`wb-meta-fields ${className}`.trim()} role="group" aria-label="Case metadata">
      <CaseMetaChip kind="lob">{lob}</CaseMetaChip>
      <CaseMetaChip kind="name">{name}</CaseMetaChip>
      <CaseMetaChip kind="limit">{formatCompactUsd(limitUsd)}</CaseMetaChip>
    </div>
  )
}
