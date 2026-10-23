import { cytoraReadingForCase, type CytoraAppetite, type CytoraFactor } from '../data/enrichmentDemo'
import type { CyberCase } from '../types'

type FactorTone = 'good' | 'watch' | 'bad'

function appetiteClass(appetite: CytoraAppetite): string {
  switch (appetite) {
    case 'Match':
      return 'ct-report--match'
    case 'Refer':
      return 'ct-report--refer'
    case 'Decline':
      return 'ct-report--decline'
    default: {
      const neverAppetite: never = appetite
      return neverAppetite
    }
  }
}

function factorTone(evidence: string): FactorTone {
  const text = evidence.toLowerCase()
  if (text.includes('no loss')) return 'good'
  if (
    text.includes('ineligible') ||
    text.includes('gap') ||
    text.includes('weak') ||
    text.includes('loss disclosed')
  ) {
    return 'bad'
  }
  if (
    text.includes('floor met') ||
    text.includes('in place') ||
    text.includes('eligible') ||
    text.includes('0–12') ||
    text.includes('0-12') ||
    (text.includes('encrypted') && !text.includes('mixed') && !text.includes('not fully'))
  ) {
    return 'good'
  }
  return 'watch'
}

function toneWidth(tone: FactorTone): string {
  switch (tone) {
    case 'good':
      return '88%'
    case 'watch':
      return '56%'
    case 'bad':
      return '22%'
    default: {
      const neverTone: never = tone
      return neverTone
    }
  }
}

function FactorCard({ factor }: { factor: CytoraFactor }) {
  const tone = factorTone(factor.evidence)
  return (
    <li className={`ct-factor ct-factor--${tone}`}>
      <div className="ct-factor__top">
        <span>{factor.name}</span>
        <strong>{tone === 'good' ? 'In range' : tone === 'watch' ? 'Noted' : 'Outside'}</strong>
      </div>
      <div className="ct-factor__meter" aria-hidden>
        <i style={{ width: toneWidth(tone) }} />
      </div>
      <p>{factor.evidence}</p>
    </li>
  )
}

export function CytoraPanel({ c, onOpenCites }: { c: CyberCase; onOpenCites?: () => void }) {
  const reading = cytoraReadingForCase(c)

  return (
    <article className={`ct-report ${appetiteClass(reading.appetite)}`} aria-label="Cytora appetite">
      <header className="ct-report__banner">
        <div>
          <p className="ct-report__brand">Cytora</p>
          <p className="ct-report__kicker">Submission risk evaluation</p>
          <h4>{c.insured}</h4>
        </div>
        <div className="ct-report__seal">
          <span>Appetite</span>
          <strong>{reading.appetite}</strong>
          <em>{reading.why}</em>
        </div>
        {onOpenCites ? (
          <button type="button" className="ct-report__sources" onClick={onOpenCites}>
            View sources
          </button>
        ) : null}
      </header>

      <section className="ct-report__body">
        <h5>Digitized factors</h5>
        {reading.factors.length === 0 ? (
          <p className="ct-report__empty">No digitized risk factors on this submission.</p>
        ) : (
          <ul className="ct-factors">
            {reading.factors.map((factor) => (
              <FactorCard key={factor.id} factor={factor} />
            ))}
          </ul>
        )}

        <h5>Evidence</h5>
        {reading.evidence.length === 0 ? (
          <p className="ct-report__empty">No findings on this reading.</p>
        ) : (
          <ul className="ct-evidence">
            {reading.evidence.map((row, index) => (
              <li key={`${row.section}-${index}`}>
                <span>{row.section}</span>
                <p>{row.line}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="ct-report__action">
        <span>Desk action</span>
        <strong>{reading.action}</strong>
      </footer>
    </article>
  )
}
