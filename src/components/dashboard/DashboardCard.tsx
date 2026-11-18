import { Card, Typography } from '@heroui/react'
import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  className?: string
  footer?: ReactNode
  minHeight?: string
  toolbar?: ReactNode
  dense?: boolean
}

/** Lightweight dashboard card for Console v2 (no overview RoleBadge dependency). */
export function DashboardCard({
  title,
  children,
  className = '',
  footer,
  minHeight = 'min-h-[220px]',
  toolbar,
  dense = false,
}: Props) {
  return (
    <Card className={`dashboard-card w-full ${minHeight} overflow-hidden ${className}`}>
      <Card.Header
        className={`dashboard-card-header flex flex-col gap-2 bg-white/80 ${dense ? 'px-4 pb-2 pt-4' : 'px-5 pb-3 pt-5'}`}
      >
        <div className="flex flex-row items-center justify-between gap-2">
          <Typography.Heading level={6} className="dashboard-card-title font-display text-stone-900">
            {title}
          </Typography.Heading>
        </div>
        {toolbar}
      </Card.Header>
      <Card.Content className={dense ? 'px-4 pb-4 pt-3' : 'px-5 pb-5 pt-4'}>{children}</Card.Content>
      {footer ? (
        <Card.Footer className="block w-full self-stretch border-0 bg-transparent px-5 pb-5 pt-0">
          <div className="w-full min-w-0">{footer}</div>
        </Card.Footer>
      ) : null}
    </Card>
  )
}
