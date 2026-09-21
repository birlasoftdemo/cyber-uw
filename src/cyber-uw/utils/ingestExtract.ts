import { DEMO_INGEST_PACKAGE } from '../data/demoIngest'
import { OPS_DEMO_INGEST_PACKAGE } from '../data/opsDemoIngest'

export interface ExtractedSubmission {
  insured: string
  broker: string
  sector: string
  limitRequestedUsd: number
  demoPackage?: 'uw' | 'ops'
}

function titleCaseStem(name: string): string {
  const stem = name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b(cyber|application|app|soc2|typeii|type ii|attestation|loss|runs|excerpt|partial|broker|cover|email|pdf)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!stem) return ''
  return stem.replace(/\b\w/g, (ch) => ch.toUpperCase())
}

/** Infer named insured / broker / sector / limit from uploaded files or mail. */
export function inferExtractedSubmission(opts: {
  fileNames: string[]
  mailId?: string | null
  mailSubject?: string
}): ExtractedSubmission {
  const blob = [...opts.fileNames, opts.mailSubject ?? '', opts.mailId ?? ''].join(' ').toLowerCase()

  if (blob.includes('brightcare') || opts.mailId === 'mail-brightcare') {
    return {
      insured: DEMO_INGEST_PACKAGE.insured,
      broker: DEMO_INGEST_PACKAGE.broker,
      sector: DEMO_INGEST_PACKAGE.sector,
      limitRequestedUsd: DEMO_INGEST_PACKAGE.limitRequestedUsd,
      demoPackage: 'uw',
    }
  }

  if (blob.includes('meridian') || opts.mailId === 'mail-meridian-ops') {
    return {
      insured: OPS_DEMO_INGEST_PACKAGE.insured,
      broker: OPS_DEMO_INGEST_PACKAGE.broker,
      sector: OPS_DEMO_INGEST_PACKAGE.sector,
      limitRequestedUsd: OPS_DEMO_INGEST_PACKAGE.limitRequestedUsd,
      demoPackage: 'ops',
    }
  }

  if (blob.includes('helios')) {
    return {
      insured: 'Helios Health',
      broker: 'Marsh Specialty',
      sector: 'Healthcare',
      limitRequestedUsd: 5_000_000,
    }
  }

  if (blob.includes('parcel')) {
    return {
      insured: 'ParcelGrid Logistics',
      broker: 'Aon',
      sector: 'Logistics',
      limitRequestedUsd: 5_000_000,
    }
  }

  const fromFile = opts.fileNames.map(titleCaseStem).find((s) => s.length > 1)
  return {
    insured: fromFile || 'Extracted insured',
    broker: 'Extracted from package',
    sector: 'Technology / SaaS',
    limitRequestedUsd: 5_000_000,
  }
}
