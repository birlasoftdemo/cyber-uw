export function BirlasoftLogo({
  compact = false,
  className = '',
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-md bg-white ${
        compact ? 'h-8 w-8 p-0.5' : 'px-2 py-1.5'
      } ${className}`}
      title="Birlasoft"
    >
      <img
        src="/birlasoft-logo.png"
        alt="Birlasoft"
        className={compact ? 'h-full w-full object-contain' : 'h-7 w-auto max-w-[148px] object-contain'}
      />
    </div>
  )
}
