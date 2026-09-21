import { Button } from '@heroui/react'
import { Mic, MicOff, Sparkles, X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'

const DEFAULT_PLACEHOLDERS = [
  'search by case ID',
  'tell me the UW for Brightcare',
  'insured value of Brightcare?',
] as const

const ROTATE_MS = 3200

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit?: (value: string) => void
  placeholders?: readonly string[]
  rotatePlaceholders?: boolean
  disabled?: boolean
  /** Optional trailing control (e.g. filters). Rendered outside the shimmer shell. */
  trailing?: ReactNode
  /** Icon-only trigger that expands into the search field. */
  collapsible?: boolean
  mic?: {
    listening: boolean
    unsupported?: boolean
    onToggle: () => void
  }
  className?: string
  ariaLabel?: string
}

/**
 * Shared AI search field with animated rainbow border.
 * Used on dashboard and workbench queue toolbar.
 */
export function AiSearchBar({
  value,
  onChange,
  onSubmit,
  placeholders = DEFAULT_PLACEHOLDERS,
  rotatePlaceholders = true,
  disabled = false,
  trailing,
  collapsible = false,
  mic,
  className = '',
  ariaLabel = 'AI search',
}: Props) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const isExpanded = !collapsible || expanded || Boolean(value.trim())

  useEffect(() => {
    if (!rotatePlaceholders || value.trim() || !isExpanded) return
    const id = window.setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [rotatePlaceholders, value, placeholders.length, isExpanded])

  useEffect(() => {
    if (!collapsible || !isExpanded) return
    inputRef.current?.focus()
  }, [collapsible, isExpanded])

  const collapseIfEmpty = () => {
    if (collapsible && !value.trim()) setExpanded(false)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const text = value.trim()
    if (!text || disabled) return
    onSubmit?.(text)
  }

  if (collapsible && !isExpanded) {
    return (
      <div className={`flex items-center gap-2 ${className}`.trim()}>
        <button
          type="button"
          className="ai-search-shell ai-search-shell--trigger"
          aria-label={`Open ${ariaLabel}`}
          aria-expanded={false}
          disabled={disabled}
          onClick={() => setExpanded(true)}
        >
          <span className="ai-search-shell__inner ai-search-shell__inner--icon">
            <Sparkles size={16} className="wb-ai-search__icon" aria-hidden />
          </span>
        </button>
        {trailing}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      <form
        onSubmit={handleSubmit}
        className={`ai-search-shell min-w-0 ${collapsible ? 'ai-search-shell--expanded' : 'flex-1'}`}
        role="search"
        aria-label={ariaLabel}
        onBlur={(e) => {
          if (!collapsible) return
          const next = e.relatedTarget as Node | null
          if (next && e.currentTarget.contains(next)) return
          collapseIfEmpty()
        }}
      >
        <div className="ai-search-shell__inner">
          <Sparkles size={16} className="wb-ai-search__icon shrink-0" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key !== 'Escape' || !collapsible) return
              if (value.trim()) onChange('')
              else {
                setExpanded(false)
                ;(e.target as HTMLInputElement).blur()
              }
            }}
            placeholder={placeholders[placeholderIndex] ?? placeholders[0]}
            className="wb-ai-search__input"
            aria-label={ariaLabel}
            disabled={disabled}
          />
          {mic && (
            <Button
              type="button"
              variant="ghost"
              isIconOnly
              size="sm"
              aria-label={mic.listening ? 'Stop listening' : 'Speak your search'}
              aria-pressed={mic.listening}
              isDisabled={mic.unsupported || disabled}
              onPress={mic.onToggle}
              className={`wb-ai-search__mic shrink-0 ${mic.listening ? 'wb-ai-search__mic--active' : ''}`}
            >
              {mic.listening ? <MicOff size={16} /> : <Mic size={16} />}
            </Button>
          )}
          {collapsible ? (
            <Button
              type="button"
              variant="ghost"
              isIconOnly
              size="sm"
              aria-label="Collapse search"
              isDisabled={disabled}
              onPress={() => {
                onChange('')
                setExpanded(false)
              }}
              className="wb-ai-search__mic shrink-0"
            >
              <X size={14} />
            </Button>
          ) : null}
        </div>
      </form>
      {trailing}
    </div>
  )
}
