import {
  Columns2,
  Funnel,
  Home,
  List,
  MoreHorizontal,
  Search,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useCyberUwStore } from '../store/cyberUwStore'
import { HeaderUserMenu } from './HeaderUserMenu'
import { NotificationMenu } from './NotificationMenu'
import { SubmissionStatusPill } from './SpecStatusPill'
import type { CyberCase } from '../types'
import type { SpecQueue } from './SpecSidebar'
import {
  dashboardCounterForCase,
  isDecisionReady,
  submissionStatus,
  SUBMISSION_STATUSES,
  type SubmissionStatus,
} from '../utils/submissionStatus'
type Tab = 'all' | 'mine' | 'tasks' | 'renewals'

const PAGE_SIZE = 8

/** Unique status hues — pie wedges and table pills share these. */
const STATUS_COLORS: Record<SubmissionStatus, string> = {
  New: '#1a85ff',
  Processing: '#32c58b',
  'Broker Follow-up': '#f5b942',
  'Under Review': '#7c6bf0',
  Referred: '#ff6c54',
  Approved: '#3c923c',
  Declined: '#af2922',
}

function inceptionLabel(c: CyberCase) {
  const iso = c.policyStartAt ?? c.receivedAt
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  const dd = String(date.getUTCDate()).padStart(2, '0')
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0')
  const yy = String(date.getUTCFullYear()).slice(2)
  return `${dd}/${mm}/${yy}`
}

function matchesQuery(c: CyberCase, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [c.id, c.insured, c.broker, c.sector, c.lobName, c.productCode].some((value) =>
    value.toLowerCase().includes(q),
  )
}

export function CasesHome({
  queue,
  onQueue,
  onSelect,
  onNew,
}: {
  queue: SpecQueue
  onQueue: (queue: SpecQueue) => void
  onSelect: (id: string, origin?: 'tasks') => void
  onNew: () => void
}) {
  const cases = useCyberUwStore((s) => s.cases)
  const referrals = useCyberUwStore((s) => s.referrals)
  const [tab, setTab] = useState<Tab>('all')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [listView, setListView] = useState(true)
  const [picked, setPicked] = useState<Record<string, boolean>>({})

  const statusOf = (c: CyberCase): SubmissionStatus => submissionStatus(c, referrals)
  const counts = useMemo(() => {
    const tally = Object.fromEntries(SUBMISSION_STATUSES.map((status) => [status, 0])) as Record<
      SubmissionStatus,
      number
    >
    for (const c of cases) tally[submissionStatus(c, referrals)] += 1
    return tally
  }, [cases, referrals])

  const filtered = useMemo(() => {
    const rows = cases.filter((c) => {
      const bucket = dashboardCounterForCase(c, referrals)
      if (queue === 'new' && bucket !== 'newSubmissions') return false
      if (queue === 'progress' && bucket !== 'inProgress') return false
      if (queue === 'referred' && bucket !== 'referred') return false
      if (queue === 'awaitingBroker' && bucket !== 'awaitingBroker') return false
      if (queue === 'decisionReady' && !isDecisionReady(c, referrals)) return false
      if (queue === 'declined' && submissionStatus(c, referrals) !== 'Declined') return false
      if (tab === 'mine' && c.decision !== 'pending') return false
      if (tab === 'tasks' && c.gaps.every((g) => g.disposition !== 'open')) return false
      if (tab === 'renewals' && c.submissionKind !== 'renewal') return false
      return matchesQuery(c, query)
    })
    return [...rows].sort((a, b) => {
      const aNew = statusOf(a) === 'New' ? 0 : 1
      const bNew = statusOf(b) === 'New' ? 0 : 1
      return aNew - bNew
    })
  }, [cases, referrals, queue, tab, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const visible = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)
  const allChecked = visible.length > 0 && visible.every((c) => picked[c.id])

  useEffect(() => {
    setPage(0)
  }, [queue])

  const clearAll = () => {
    setQuery('')
    onQueue('all')
    setTab('all')
    setPage(0)
  }

  return (
    <div className="spec-home">
      <div className="spec-home__main">
        <header className="spec-home__top">
          <label className="spec-home__search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(0)
              }}
              placeholder="Search"
              aria-label="Search"
            />
          </label>
          <div className="spec-home__tools">
            <button type="button" className="spec-home__tool" aria-label="Home" onClick={clearAll}>
              <Home size={18} />
            </button>
            <NotificationMenu onSelect={(id) => onSelect(id)} />
            <HeaderUserMenu tone="dark" />
          </div>
        </header>

        <section className="spec-home__banner" aria-label="Detailed Status">
          <div className="spec-home__kpi-charts spec-home__kpi-charts--focus">
            <article className="spec-kpi spec-kpi--focus">
              <h2>Detailed Status</h2>
              <KpiPie
                label="Detailed Status"
                size={120}
                slices={SUBMISSION_STATUSES.map((status) => ({
                  key: status,
                  label: status,
                  value: counts[status],
                  color: STATUS_COLORS[status],
                }))}
              />
            </article>
          </div>
        </section>

        <section className="spec-board">
          <div className="spec-board__tools">
            <label className="spec-board__search">
              <Search size={15} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder="Search By Insured, Broker or UMR No."
                aria-label="Search by insured, broker, or UMR"
              />
            </label>
            <button type="button" className="spec-board__filter" aria-label="Filters">
              <Funnel size={16} />
            </button>
            <button type="button" className="spec-board__clear" onClick={clearAll}>
              × Clear Filter
            </button>
            <div className="spec-board__actions">
              <div className="spec-board__views" role="group" aria-label="View type">
                <button
                  type="button"
                  className={`spec-board__view${!listView ? ' spec-board__view--on' : ''}`}
                  aria-label="Card view"
                  aria-pressed={!listView}
                  onClick={() => setListView(false)}
                >
                  <Columns2 size={16} />
                </button>
                <button
                  type="button"
                  className={`spec-board__view${listView ? ' spec-board__view--on' : ''}`}
                  aria-label="List view"
                  aria-pressed={listView}
                  onClick={() => setListView(true)}
                >
                  <List size={16} />
                </button>
              </div>
              <button type="button" className="spec-board__new" onClick={onNew}>
                New Submission
              </button>
              <button type="button" className="spec-board__more" aria-label="More">
                <MoreHorizontal size={16} />
              </button>
            </div>
          </div>

          <div className="spec-tabs" role="tablist">
            {(
              [
                ['all', 'All Submissions', cases.length],
                ['mine', 'My Submissions', cases.filter((c) => c.decision === 'pending').length],
                [
                  'tasks',
                  'Tasks',
                  cases.filter((c) => c.gaps.some((g) => g.disposition === 'open')).length,
                ],
                [
                  'renewals',
                  'Upcoming Renewals',
                  cases.filter((c) => c.submissionKind === 'renewal').length,
                ],
              ] as const
            ).map(([id, label, count]) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`spec-tabs__tab${tab === id ? ' spec-tabs__tab--active' : ''}`}
                onClick={() => {
                  setTab(id)
                  setPage(0)
                }}
              >
                {label} <span>{count}</span>
              </button>
            ))}
          </div>

          {listView ? (
            <div className="spec-table-wrap">
              <table className="spec-table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        aria-label="Select all on page"
                        checked={allChecked}
                        onChange={() => {
                          setPicked((cur) => {
                            const next = { ...cur }
                            for (const row of visible) next[row.id] = !allChecked
                            return next
                          })
                        }}
                      />
                    </th>
                    <th>Submission ID</th>
                    <th>Insured</th>
                    <th>UMR</th>
                    <th>Sub-Class</th>
                    <th>Inception Date</th>
                    <th>Detailed Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="spec-table__empty">
                        No submissions match the current filters.
                      </td>
                    </tr>
                  ) : (
                    visible.map((c) => {
                      const detailedStatus = statusOf(c)
                      return (
                      <tr key={c.id} onClick={() => onSelect(c.id, tab === 'tasks' ? 'tasks' : undefined)}>
                        <td onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            aria-label={`Select ${c.id}`}
                            checked={Boolean(picked[c.id])}
                            onChange={() =>
                              setPicked((cur) => ({ ...cur, [c.id]: !cur[c.id] }))
                            }
                          />
                        </td>
                        <td className="spec-table__id">{c.id}</td>
                        <td>{c.insured}</td>
                        <td>{c.productCode}</td>
                        <td>{c.sector}</td>
                        <td>{inceptionLabel(c)}</td>
                        <td>
                          <SubmissionStatusPill status={detailedStatus} />
                        </td>
                      </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <ul className="spec-cards">
              {visible.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => onSelect(c.id, tab === 'tasks' ? 'tasks' : undefined)}>
                    <strong>{c.insured}</strong>
                    <span>{c.id}</span>
                    <SubmissionStatusPill status={statusOf(c)} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <footer className="spec-pager">
            <span>
              {filtered.length === 0
                ? '0 of 0'
                : `${safePage * PAGE_SIZE + 1}–${Math.min(filtered.length, (safePage + 1) * PAGE_SIZE)} of ${filtered.length}`}
            </span>
            <div>
              <button
                type="button"
                aria-label="Previous page"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
              >
                ‹
              </button>
              {Array.from({ length: pageCount }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Page ${i + 1}`}
                  aria-current={i === safePage ? 'page' : undefined}
                  className={i === safePage ? 'spec-pager__on' : ''}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                type="button"
                aria-label="Next page"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
              >
                ›
              </button>
            </div>
          </footer>
        </section>
      </div>
    </div>
  )
}

function pieSlicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const sweep = end - start
  if (sweep >= 359.999) {
    return `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy} A ${r} ${r} 0 1 1 ${cx - r} ${cy}`
  }
  const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180
  const a0 = toRad(start)
  const a1 = toRad(end)
  const x0 = (cx + r * Math.cos(a0)).toFixed(2)
  const y0 = (cy + r * Math.sin(a0)).toFixed(2)
  const x1 = (cx + r * Math.cos(a1)).toFixed(2)
  const y1 = (cy + r * Math.sin(a1)).toFixed(2)
  const large = sweep > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
}

function KpiPie({
  label,
  slices,
  size = 72,
}: {
  label: string
  slices: { key: string; label: string; value: number; color: string }[]
  size?: number
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0)
  const radius = Math.round(size * 0.44)
  const center = size / 2
  let cursor = 0
  const wedges = slices.flatMap((slice) => {
    if (slice.value <= 0 || total === 0) return []
    const start = cursor
    const end = cursor + (slice.value / total) * 360
    cursor = end
    return [{ ...slice, d: pieSlicePath(center, center, radius, start, end) }]
  })
  const summary = slices.map((slice) => `${slice.label} ${slice.value}`).join(', ')

  return (
    <div className="spec-kpi__pie">
      <svg
        className="spec-kpi__chart"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}. ${summary}.`}
      >
        {total === 0 ? (
          <circle cx={center} cy={center} r={radius} fill="#e6e8eb" />
        ) : (
          wedges.map((slice) => (
            <path key={slice.key} d={slice.d} fill={slice.color}>
              <title>{`${slice.label}: ${slice.value}`}</title>
            </path>
          ))
        )}
      </svg>
      <ul className="spec-kpi__legend">
        {slices.map((slice) => (
          <li key={slice.key}>
            <i className="spec-kpi__swatch" style={{ background: slice.color }} aria-hidden />
            <span>{slice.label}</span>
            <strong>{slice.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  )
}
