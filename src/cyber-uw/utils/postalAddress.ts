export interface PostalAddress {
  line1: string
  line2: string
  line3: string
  city: string
  state: string
  postal: string
  country: string
  office: string
}

const EMPTY = '—'

/** Split a single insured address into the document-panel lines. */
export function splitAddress(raw: string): PostalAddress {
  const text = raw.trim()
  const match = text.match(/^(.*?),\s*([^,]+),\s*([A-Za-z]{2})\s+(\d{5}(?:-\d{4})?)$/)
  if (!match) {
    return {
      line1: text || EMPTY,
      line2: EMPTY,
      line3: EMPTY,
      city: EMPTY,
      state: EMPTY,
      postal: EMPTY,
      country: EMPTY,
      office: text || EMPTY,
    }
  }
  const line1 = match[1].trim()
  const city = match[2].trim()
  const state = match[3].toUpperCase()
  const postal = match[4]
  return {
    line1,
    line2: EMPTY,
    line3: EMPTY,
    city,
    state,
    postal,
    country: 'United States',
    office: `${city}, ${state}`,
  }
}

export function composeAddress(parts: {
  line1: string
  city: string
  state: string
  postal: string
  fallback: string
}): string {
  const line1 = clean(parts.line1)
  const city = clean(parts.city)
  const state = clean(parts.state)
  const postal = clean(parts.postal)
  const locality = [city, [state, postal].filter(Boolean).join(' ')].filter(Boolean).join(', ')
  const joined = [line1, locality].filter(Boolean).join(', ')
  return joined || parts.fallback
}

function clean(value: string): string {
  const text = value.trim()
  if (!text || text === EMPTY) return ''
  return text
}
