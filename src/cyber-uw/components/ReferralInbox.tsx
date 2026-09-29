import { Button, Chip, Typography } from '@heroui/react'
import { useState } from 'react'
import { REFERRAL_TARGET_LABELS } from '../constants/gapReferAssignees'
import { useAuthStore } from '../store/authStore'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { ReferralStatus, ReferralTicket } from '../types'

function statusChip(status: ReferralStatus, persona: 'ops' | 'uw') {
  switch (status) {
    case 'open':
      return (
        <Chip size="sm" variant="soft" color="warning">
          {persona === 'uw' ? 'With Ops' : 'Open'}
        </Chip>
      )
    case 'awaiting_broker':
      return (
        <Chip size="sm" variant="soft" color="accent">
          {persona === 'uw' ? 'Waiting on broker' : 'Awaiting broker'}
        </Chip>
      )
    case 'returned':
      return <Chip size="sm" variant="soft">Back with UW</Chip>
    case 'resolved':
      return (
        <Chip size="sm" variant="soft" color="success">
          Resolved
        </Chip>
      )
  }
}

function kindLabel(kind: ReferralTicket['kind']) {
  if (kind === 'gap') return 'Control gap'
  if (kind === 'risk') return 'Risk item'
  if (kind === 'ingest') return 'Missing package / ingest'
  if (kind === 'submission') return 'Submission transfer'
  return 'Platform finding'
}

function ageLabel(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  const days = Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day'
  return `${days} days`
}

interface Props {
  onOpenCase: (caseId: string) => void
  onRemindBroker?: () => void
}

export function ReferralInbox({ onOpenCase, onRemindBroker }: Props) {
  const role = useAuthStore((s) => s.user?.role)
  const isOps = role === 'ops'
  const { referrals, cases, resolveReferral, chaseReferral, returnReferral } = useCyberUwStore()
  const [noteById, setNoteById] = useState<Record<string, string>>({})
  const [filter, setFilter] = useState<'active' | 'all'>('active')

  const active = referrals.filter((r) => r.status !== 'resolved')
  const shown = filter === 'active' ? active : referrals
  const caseFor = (t: ReferralTicket) => cases.find((c) => c.id === t.caseId)
  const persona = isOps ? 'ops' : 'uw'

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-[1100px] flex-1 flex-col overflow-hidden p-3 md:p-4">
      <div className="wb-panel flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
          <div>
            <Typography.Heading level={5} className="font-display text-slate-900">
              {isOps ? 'Escalation Inbox' : 'Escalations'}
            </Typography.Heading>
          </div>
          <div className="flex items-center gap-2">
            <Chip size="sm" variant="soft" color="warning">
              {active.length} active
            </Chip>
            <Button
              size="sm"
              variant={filter === 'active' ? 'primary' : 'secondary'}
              onPress={() => setFilter('active')}
            >
              Active
            </Button>
            <Button
              size="sm"
              variant={filter === 'all' ? 'primary' : 'secondary'}
              onPress={() => setFilter('all')}
            >
              All
            </Button>
          </div>
        </div>

        <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3 md:p-4">
          {shown.length === 0 ? (
            <li className="rounded-lg border border-dashed border-slate-200 px-4 py-10 text-center text-sm text-slate-500">
              {isOps
                ? 'No escalations in this view.'
                : filter === 'active'
                  ? 'No open escalations. Refer a submission from the case header, or escalate a missing package from Policy Documents.'
                  : 'No escalations sent yet.'}
            </li>
          ) : (
            shown.map((t) => {
              const c = caseFor(t)
              const note = noteById[t.id] ?? ''
              const locked = t.status === 'resolved'
              return (
                <li
                  key={t.id}
                  className="cuw-surface-card wb-qual-row p-3.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="wb-ref-pill">{t.caseId}</span>
                        {statusChip(t.status, persona)}
                        <Chip size="sm" variant="soft">
                          {REFERRAL_TARGET_LABELS[t.target]}
                        </Chip>
                        <span className="text-xs text-slate-500">{ageLabel(t.createdAt)}</span>
                      </div>
                      <p className="mt-1.5 text-sm font-semibold text-slate-900">
                        {c?.insured ?? 'Unknown insured'}
                      </p>
                      <p className="mt-0.5 text-sm text-slate-800">{t.sourceLabel}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {kindLabel(t.kind)} · Sent to {t.assigneeLabel}
                      </p>
                      {t.note ? (
                        <p className="mt-2 rounded-md bg-slate-50 px-2.5 py-2 text-xs text-slate-700">
                          {isOps ? t.note : `Your note: ${t.note}`}
                        </p>
                      ) : null}
                      {t.resolutionNote ? (
                        <p className="mt-1 text-xs text-emerald-800">
                          Resolution: {t.resolutionNote}
                        </p>
                      ) : null}
                      {!isOps && t.status === 'returned' ? (
                        <p className="mt-1 text-xs font-medium text-slate-700">
                          Ops returned this for your review. Continue in the case when ready.
                        </p>
                      ) : null}
                      {!isOps && t.status === 'awaiting_broker' ? (
                        <p className="mt-1 text-xs text-slate-600">
                          Ops is waiting on the broker. You can continue in the case anytime.
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {isOps && !locked ? (
                    <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
                      <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
                        Ops note
                        <input
                          className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
                          value={note}
                          onChange={(e) =>
                            setNoteById((s) => ({ ...s, [t.id]: e.target.value }))
                          }
                          placeholder="Resolution or return rationale"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="primary"
                          data-video-action="resolve-referral"
                          onPress={() => resolveReferral(t.id, note)}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          data-video-action="remind-broker"
                          onPress={() => {
                            chaseReferral(t.id)
                            onRemindBroker?.()
                          }}
                        >
                          Remind broker
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-video-action="return-to-uw"
                          onPress={() => returnReferral(t.id, note)}
                        >
                          Return to UW
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          data-video-action="continue-in-case"
                          onPress={() => onOpenCase(t.caseId)}
                        >
                          Continue in case
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  {isOps && locked ? (
                    <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
                      <Button size="sm" variant="secondary" onPress={() => onOpenCase(t.caseId)}>
                        Continue in case
                      </Button>
                    </div>
                  ) : null}

                  {!isOps ? (
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                      <p className="text-xs text-slate-500">
                        {locked
                          ? 'Resolved. Open the case if you need the dossier history.'
                          : t.status === 'open'
                            ? 'Ops has this in their inbox.'
                            : t.status === 'awaiting_broker'
                              ? 'Broker reminder is in progress via Manage Submissions.'
                              : 'Ready for you in Decision Desk.'}
                      </p>
                      <Button size="sm" variant="secondary" onPress={() => onOpenCase(t.caseId)}>
                        Continue in case
                      </Button>
                    </div>
                  ) : null}
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>
  )
}
