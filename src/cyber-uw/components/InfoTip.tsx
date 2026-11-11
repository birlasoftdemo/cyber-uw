/** Hover explanation used on scores and chart headings. */
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="ra-tip">
      <button type="button" className="ra-tip__btn" aria-label={text}>
        i
      </button>
      <span className="ra-tip__bubble" aria-hidden>
        {text}
      </span>
    </span>
  )
}
