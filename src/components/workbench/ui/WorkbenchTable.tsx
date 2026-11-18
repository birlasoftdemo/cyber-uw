import { Typography } from '@heroui/react'
import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'
import { StatusChip, type StatusTone } from './StatusChip'

const span = ({ children, ...p }: { children?: ReactNode; [key: string]: unknown }) => (
  <span {...p}>{children}</span>
)

export type TableCellAlign = 'left' | 'right' | 'center'
export type TableDensity = 'compact' | 'comfortable'

const QUEUE_TABLE_MIN_WIDTH = 1100

export function WorkbenchTable({
  children,
  minWidth = QUEUE_TABLE_MIN_WIDTH,
  colGroup,
  shell = true,
  className = '',
}: {
  children: ReactNode
  minWidth?: number
  colGroup?: ReactNode
  shell?: boolean
  className?: string
}) {
  const table = (
    <div className={`flex-1 overflow-auto ${className}`.trim()}>
      <table className="wb-table" style={{ minWidth: `${minWidth}px` }}>
        {colGroup}
        {children}
      </table>
    </div>
  )

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {shell ? <div className="wb-table-shell flex flex-1 flex-col overflow-hidden">{table}</div> : table}
    </div>
  )
}

export function InlineWorkbenchTable({
  children,
  caption,
  className = '',
  minWidth,
}: {
  children: ReactNode
  caption?: string
  className?: string
  minWidth?: number
}) {
  return (
    <div className={className}>
      {caption ? <p className="wb-table-caption">{caption}</p> : null}
      <div className="wb-table-shell overflow-x-auto">
        <table className="wb-table" style={minWidth ? { minWidth } : undefined}>
          {children}
        </table>
      </div>
    </div>
  )
}

export function WorkbenchColGroup({ widths }: { widths: string[] }) {
  return (
    <colgroup>
      {widths.map((width, index) => (
        <col key={index} style={{ width }} />
      ))}
    </colgroup>
  )
}

export function WorkbenchTableHead({ children }: { children: ReactNode }) {
  return <thead className="wb-table-head">{children}</thead>
}

export function WorkbenchTableBody({ children }: { children: ReactNode }) {
  return <tbody className="wb-table-body">{children}</tbody>
}

export function WorkbenchTh({
  children,
  align = 'left',
  className,
  ...props
}: {
  children: ReactNode
  align?: TableCellAlign
  className?: string
} & ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th className={`wb-table-th wb-table-th--${align} ${className ?? ''}`.trim()} {...props}>
      <TableHeaderText>{children}</TableHeaderText>
    </th>
  )
}

export function WorkbenchTd({
  children,
  align = 'left',
  density = 'comfortable',
  primary = false,
  numeric = false,
  className,
  ...props
}: {
  children: ReactNode
  align?: TableCellAlign
  density?: TableDensity
  primary?: boolean
  numeric?: boolean
  className?: string
} & TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={[
        'wb-table-td',
        `wb-table-td--${align}`,
        `wb-table-td--${density}`,
        primary ? 'wb-table-td--primary' : '',
        numeric ? 'wb-table-td--numeric' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </td>
  )
}

export function TableHeaderText({ children }: { children: ReactNode }) {
  return (
    <Typography.Paragraph
      size="xs"
      weight="semibold"
      className="uppercase tracking-wide text-slate-800"
      render={span}
    >
      {children}
    </Typography.Paragraph>
  )
}

export function CellText({
  children,
  color,
  className,
}: {
  children: ReactNode
  color?: 'muted'
  className?: string
}) {
  return (
    <Typography.Paragraph
      size="xs"
      className={`${color === 'muted' ? 'wb-table-cell-muted' : 'text-slate-900'} ${className ?? ''}`.trim()}
      render={span}
    >
      {children}
    </Typography.Paragraph>
  )
}

export function WorkbenchTableEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="wb-list-empty">
      <Typography.Paragraph align="center" color="muted" size="sm">
        {children}
      </Typography.Paragraph>
    </div>
  )
}

export function confidenceTone(confidence: number): StatusTone {
  if (confidence >= 85) return 'complete'
  if (confidence >= 80) return 'pending'
  return 'danger'
}

export function ConfidenceChip({ confidence }: { confidence: number }) {
  return <StatusChip tone={confidenceTone(confidence)}>{confidence}%</StatusChip>
}
