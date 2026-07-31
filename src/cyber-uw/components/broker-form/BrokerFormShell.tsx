import type { ReactNode } from 'react'

interface Props {
  brand?: string
  brokerName?: string
  brokerFirm?: string
  progressPct: number
  counterLabel: string
  counterPulse?: boolean
  compact?: boolean
  footerLeft?: ReactNode
  footerHint?: string
  footerRight?: ReactNode
  children: ReactNode
  className?: string
}

export function BrokerFormShell({
  brand = 'Shore Underwriting',
  brokerName = 'Alex Morgan',
  brokerFirm = 'Meridian Risk Brokers',
  progressPct,
  counterLabel,
  counterPulse,
  compact,
  footerLeft,
  footerHint,
  footerRight,
  children,
  className = '',
}: Props) {
  const initials = brokerName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      className={`cuw-broker cuw-broker--builder-chrome ${compact ? 'cuw-broker--compact' : ''} ${className}`.trim()}
    >
      <div className="cuw-broker__bg" aria-hidden>
        <div className="cuw-broker__waves" />
        <div className="cuw-broker__waves-2" />
      </div>

      <div className="cuw-broker__top">
        <div className="cuw-broker__navbar">
          <div className="cuw-broker__brand">{brand}</div>
          <div className="cuw-broker__tools">
            <div className="cuw-broker__login">
              <span className="cuw-broker__avatar">{initials}</span>
              <span>
                <span className="cuw-broker__login-label">Signed in as</span>
                <span className="cuw-broker__login-value">
                  {brokerName} · {brokerFirm}
                </span>
              </span>
            </div>
          </div>
        </div>
        <div className="cuw-broker__progress-row">
          <div className="cuw-broker__progressor" aria-hidden>
            <i style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }} />
          </div>
          <span
            className={`cuw-broker__counter ${counterPulse ? 'cuw-broker__counter--pulse' : ''}`}
          >
            {counterLabel}
          </span>
        </div>
      </div>

      <div className="cuw-broker__stage">
        <div className="cuw-broker__stage-inner">{children}</div>
      </div>

      <div className="cuw-broker__footer">
        <div className="cuw-broker__footer-inner">
          <div>{footerLeft}</div>
          {footerHint ? <span className="cuw-broker__hint">{footerHint}</span> : <span />}
          <div>{footerRight}</div>
        </div>
      </div>
    </div>
  )
}
