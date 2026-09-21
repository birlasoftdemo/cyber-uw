import { Sparkles } from 'lucide-react'

interface Props {
  label?: string
  showIcon?: boolean
  className?: string
}

export function AiBadge({ label = 'AI recommended', showIcon = true, className = '' }: Props) {
  return (
    <span className={`ai-badge ${className}`.trim()}>
      {showIcon && <Sparkles size={10} aria-hidden />}
      {label}
    </span>
  )
}
