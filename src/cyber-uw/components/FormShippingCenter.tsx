import { Button, Chip, Tabs } from '@heroui/react'
import { Ban, Copy, Eye, FilePlus2, Send, Shield } from 'lucide-react'
import { useMemo, useState } from 'react'
import { showInfoToast, showSuccessToast } from '../../shared/utils/toast'
import { defaultModuleIds } from '../constants/formModules'
import { BrokerFormFlow } from './broker-form/BrokerFormFlow'
import {
  DispatchFormBuilder,
  type DispatchPayload,
} from './DispatchFormBuilder'

type PackageStatus = 'draft' | 'published'
type OuttakeStatus = 'sent' | 'in_progress' | 'returned' | 'revoked'
type AttestorRole = 'broker' | 'insured_officer'

type OuttakeFilter = 'all' | 'active' | 'awaiting' | 'returned'
type PackageFilter = 'all' | 'published'

interface FormPackage {
  id: string
  name: string
  version: string
  status: PackageStatus
  modules: number
  updated: string
}

interface Outtake {
  id: string
  insured: string
  broker: string
  packageId: string
  packageLabel: string
  status: OuttakeStatus
  attestor: AttestorRole
  shippedAt: string
  link: string
  moduleIds?: string[]
}

const INITIAL_PACKAGES: FormPackage[] = [
  {
    id: 'pkg-cyber-core',
    name: 'Cyber Core Adaptive',
    version: 'v1.4',
    status: 'published',
    modules: 12,
    updated: '2026-07-20',
  },
  {
    id: 'pkg-cyber-high',
    name: 'Cyber High Limit ($10M+)',
    version: 'v1.1',
    status: 'published',
    modules: 16,
    updated: '2026-07-18',
  },
  {
    id: 'pkg-cyber-draft',
    name: 'Cyber SME Light',
    version: 'v0.3',
    status: 'draft',
    modules: 8,
    updated: '2026-07-24',
  },
]

const INITIAL_OUTTAKES: Outtake[] = [
  {
    id: 'out-0900',
    insured: 'Brightcare Digital Health',
    broker: 'Marsh Specialty',
    packageId: 'pkg-cyber-core',
    packageLabel: 'Cyber Core Adaptive · v1.4',
    status: 'returned',
    attestor: 'broker',
    shippedAt: '2026-07-28',
    link: 'https://submit.shore.example/o/0900',
    moduleIds: defaultModuleIds(),
  },
  {
    id: 'out-0841',
    insured: 'Northwind Analytics Inc.',
    broker: 'Meridian Risk Brokers',
    packageId: 'pkg-cyber-core',
    packageLabel: 'Cyber Core Adaptive · v1.4',
    status: 'in_progress',
    attestor: 'broker',
    shippedAt: '2026-07-26',
    link: 'https://submit.shore.example/o/0841',
    moduleIds: defaultModuleIds(),
  },
  {
    id: 'out-0838',
    insured: 'Helios Health',
    broker: 'Marsh Specialty',
    packageId: 'pkg-cyber-high',
    packageLabel: 'Cyber High Limit ($10M+) · v1.1',
    status: 'returned',
    attestor: 'insured_officer',
    shippedAt: '2026-07-22',
    link: 'https://submit.shore.example/o/0838',
    moduleIds: [
      ...defaultModuleIds(),
      'email_security',
      'incident_response',
      'data_exposure',
    ],
  },
  {
    id: 'out-0832',
    insured: 'ParcelGrid Logistics',
    broker: 'Direct',
    packageId: 'pkg-cyber-core',
    packageLabel: 'Cyber Core Adaptive · v1.4',
    status: 'sent',
    attestor: 'broker',
    shippedAt: '2026-07-25',
    link: 'https://submit.shore.example/o/0832',
    moduleIds: defaultModuleIds(),
  },
]

function statusChip(status: OuttakeStatus | PackageStatus) {
  if (status === 'published' || status === 'returned') {
    return (
      <Chip size="sm" variant="soft" color="success">
        {status === 'published' ? 'Published' : 'Returned'}
      </Chip>
    )
  }
  if (status === 'in_progress' || status === 'sent') {
    return (
      <Chip size="sm" variant="soft" color="accent">
        {status === 'in_progress' ? 'In progress' : 'Sent'}
      </Chip>
    )
  }
  if (status === 'revoked') {
    return (
      <Chip size="sm" variant="soft" color="danger">
        Revoked
      </Chip>
    )
  }
  return (
    <Chip size="sm" variant="soft" color="default">
      Draft
    </Chip>
  )
}

function FilterChip({
  label,
  count,
  selected,
  onPress,
}: {
  label: string
  count: number
  selected: boolean
  onPress: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-pressed={selected}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition ${
        selected
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
      }`}
    >
      {label}
      <span className={selected ? 'text-slate-300' : 'text-slate-400'}>{count}</span>
    </button>
  )
}

export interface ReturnedOuttakePrefill {
  insured: string
  broker: string
  packageLabel: string
  outtakeId: string
}

interface Props {
  onNewSubmission: (prefill?: ReturnedOuttakePrefill) => void
  /** Returned outtake → Decision Workbench Workflow (closure path). */
  onProceedToClosure: (prefill: ReturnedOuttakePrefill) => void
}

export function FormShippingCenter({ onNewSubmission, onProceedToClosure }: Props) {
  const [tab, setTab] = useState<'outtakes' | 'packages'>('outtakes')
  const [outtakeFilter, setOuttakeFilter] = useState<OuttakeFilter>('all')
  const [packageFilter, setPackageFilter] = useState<PackageFilter>('all')
  const [packages] = useState(INITIAL_PACKAGES)
  const [outtakes, setOuttakes] = useState(INITIAL_OUTTAKES)
  const [builderOpen, setBuilderOpen] = useState(false)
  const [builderPackageId, setBuilderPackageId] = useState<string | undefined>()
  const [viewingOuttake, setViewingOuttake] = useState<Outtake | null>(null)

  const published = packages.filter((p) => p.status === 'published')
  const counts = useMemo(() => {
    const active = outtakes.filter((o) => o.status === 'sent' || o.status === 'in_progress').length
    const returned = outtakes.filter((o) => o.status === 'returned').length
    const awaiting = outtakes.filter((o) => o.status === 'sent').length
    return {
      all: outtakes.length,
      active,
      awaiting,
      returned,
      packagesAll: packages.length,
      packagesPublished: published.length,
    }
  }, [outtakes, packages.length, published.length])

  const visibleOuttakes = useMemo(() => {
    if (outtakeFilter === 'active') {
      return outtakes.filter((o) => o.status === 'sent' || o.status === 'in_progress')
    }
    if (outtakeFilter === 'awaiting') {
      return outtakes.filter((o) => o.status === 'sent')
    }
    if (outtakeFilter === 'returned') {
      return outtakes.filter((o) => o.status === 'returned')
    }
    return outtakes
  }, [outtakes, outtakeFilter])

  const visiblePackages = useMemo(() => {
    if (packageFilter === 'published') {
      return packages.filter((p) => p.status === 'published')
    }
    return packages
  }, [packages, packageFilter])

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link)
      showSuccessToast('Outtake link copied')
    } catch {
      showInfoToast('Could not copy link')
    }
  }

  const revoke = (id: string) => {
    setOuttakes((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'revoked' as const } : o)),
    )
    showInfoToast('Outtake revoked')
  }

  const markReturned = (id: string) => {
    setOuttakes((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'returned' as const } : o)),
    )
    showSuccessToast('Outtake marked returned')
    setOuttakeFilter('returned')
    setTab('outtakes')
  }

  const openBuilder = (packageId?: string) => {
    setBuilderPackageId(packageId)
    setBuilderOpen(true)
  }

  const handleSend = (payload: DispatchPayload) => {
    const id = `out-${Date.now().toString().slice(-4)}`
    const link = `https://submit.shore.example/o/${id}`
    setOuttakes((prev) => [
      {
        id,
        insured: payload.insured,
        broker: payload.broker,
        packageId: payload.packageId,
        packageLabel: payload.packageLabel,
        status: 'sent',
        attestor: payload.attestor,
        shippedAt: new Date().toISOString().slice(0, 10),
        link,
        moduleIds: payload.moduleIds,
      },
      ...prev,
    ])
    setBuilderOpen(false)
    setTab('outtakes')
    setOuttakeFilter('awaiting')
    showSuccessToast('Form dispatched — broker link ready')
    void copyLink(link)
  }

  if (builderOpen) {
    return (
      <DispatchFormBuilder
        packages={packages}
        initialPackageId={builderPackageId}
        onCancel={() => setBuilderOpen(false)}
        onSend={handleSend}
      />
    )
  }

  if (viewingOuttake) {
    const modules = viewingOuttake.moduleIds?.length
      ? viewingOuttake.moduleIds
      : defaultModuleIds()
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500">
              {viewingOuttake.status === 'returned' ? 'Returned form' : 'Broker form'}
            </p>
            <h2 className="text-sm font-semibold text-slate-900">
              {viewingOuttake.insured} · {viewingOuttake.packageLabel}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {viewingOuttake.status === 'returned' ? (
              <Button
                size="sm"
                variant="primary"
                onPress={() => {
                  onProceedToClosure({
                    insured: viewingOuttake.insured,
                    broker: viewingOuttake.broker,
                    packageLabel: viewingOuttake.packageLabel,
                    outtakeId: viewingOuttake.id,
                  })
                  setViewingOuttake(null)
                }}
              >
                Proceed to Closure
              </Button>
            ) : null}
            <Button size="sm" variant="secondary" onPress={() => setViewingOuttake(null)}>
              Back to Shared
            </Button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden rounded-2xl">
          <BrokerFormFlow
            moduleIds={modules}
            insuredHint={viewingOuttake.insured}
            brokerFirm={viewingOuttake.broker}
            packageLabel={viewingOuttake.packageLabel}
            mode={viewingOuttake.status === 'returned' ? 'review' : 'live'}
            dossierReady
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 px-1 pb-2">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Tabs
            selectedKey={tab}
            onSelectionChange={(k) => {
              const next = k as typeof tab
              setTab(next)
            }}
          >
            <Tabs.ListContainer>
              <Tabs.List aria-label="Manage submissions views" className="gap-1">
                <Tabs.Tab id="outtakes">Shared</Tabs.Tab>
                <Tabs.Tab id="packages">Templates</Tabs.Tab>
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onPress={() => onNewSubmission()}>
            <FilePlus2 size={14} />
            New Submission
          </Button>
          <Button size="sm" variant="primary" onPress={() => openBuilder()}>
            <Send size={14} />
            Dispatch New Form
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-2">
        {tab === 'outtakes' ? (
          <>
            <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1.5 px-1">
              <FilterChip
                label="All"
                count={counts.all}
                selected={outtakeFilter === 'all'}
                onPress={() => setOuttakeFilter('all')}
              />
              <FilterChip
                label="Active"
                count={counts.active}
                selected={outtakeFilter === 'active'}
                onPress={() => setOuttakeFilter('active')}
              />
              <FilterChip
                label="Awaiting"
                count={counts.awaiting}
                selected={outtakeFilter === 'awaiting'}
                onPress={() => setOuttakeFilter('awaiting')}
              />
              <FilterChip
                label="Returned"
                count={counts.returned}
                selected={outtakeFilter === 'returned'}
                onPress={() => setOuttakeFilter('returned')}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200/80 bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Insured</th>
                    <th className="px-4 py-2.5 font-semibold">Broker</th>
                    <th className="px-4 py-2.5 font-semibold">Package</th>
                    <th className="px-4 py-2.5 font-semibold">Attestor</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold">Shipped</th>
                    <th className="px-4 py-2.5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOuttakes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                        No outtakes match this status.
                      </td>
                    </tr>
                  ) : (
                    visibleOuttakes.map((o) => (
                      <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-medium text-slate-900">{o.insured}</td>
                        <td className="px-4 py-3 text-slate-600">{o.broker}</td>
                        <td className="px-4 py-3 text-slate-600">{o.packageLabel}</td>
                        <td className="px-4 py-3">
                          <Chip size="sm" variant="soft" color="default">
                            {o.attestor === 'broker' ? 'Broker' : 'Insured officer'}
                          </Chip>
                        </td>
                        <td className="px-4 py-3">{statusChip(o.status)}</td>
                        <td className="px-4 py-3 text-slate-500">{o.shippedAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              isDisabled={o.status === 'revoked'}
                              onPress={() => setViewingOuttake(o)}
                            >
                              <Eye size={12} />
                              View form
                            </Button>
                            {o.status === 'returned' ? (
                              <Button
                                size="sm"
                                variant="primary"
                                onPress={() =>
                                  onProceedToClosure({
                                    insured: o.insured,
                                    broker: o.broker,
                                    packageLabel: o.packageLabel,
                                    outtakeId: o.id,
                                  })
                                }
                              >
                                Proceed to Closure
                              </Button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <>
            <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1.5 px-1">
              <FilterChip
                label="All"
                count={counts.packagesAll}
                selected={packageFilter === 'all'}
                onPress={() => setPackageFilter('all')}
              />
              <FilterChip
                label="Published"
                count={counts.packagesPublished}
                selected={packageFilter === 'published'}
                onPress={() => setPackageFilter('published')}
              />
            </div>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-200/80 bg-white">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">Package</th>
                    <th className="px-4 py-2.5 font-semibold">Version</th>
                    <th className="px-4 py-2.5 font-semibold">Modules</th>
                    <th className="px-4 py-2.5 font-semibold">Status</th>
                    <th className="px-4 py-2.5 font-semibold">Updated</th>
                    <th className="px-4 py-2.5 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePackages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-500">
                        No packages match this filter.
                      </td>
                    </tr>
                  ) : (
                    visiblePackages.map((p) => (
                      <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50/80">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 font-medium text-slate-900">
                            <Shield size={14} className="text-slate-400" />
                            {p.name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{p.version}</td>
                        <td className="px-4 py-3 text-slate-600">{p.modules}</td>
                        <td className="px-4 py-3">{statusChip(p.status)}</td>
                        <td className="px-4 py-3 text-slate-500">{p.updated}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="primary"
                            isDisabled={p.status !== 'published'}
                            onPress={() => openBuilder(p.id)}
                          >
                            <Send size={12} />
                            Dispatch
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
