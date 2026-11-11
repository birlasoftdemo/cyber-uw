import { useState } from 'react'

export function WhyThisResult({ id, evidence }: { id: string; evidence: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="cuw-why">
      <button
        type="button"
        className="cuw-why__btn"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        Why this result?
      </button>
      {open ? (
        <ul id={id} className="cuw-why__list">
          {evidence.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
