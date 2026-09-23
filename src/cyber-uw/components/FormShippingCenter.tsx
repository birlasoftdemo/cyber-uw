import { Button, Chip, Tabs } from '@heroui/react'
import { Eye, Send, Shield } from 'lucide-react'
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
    id: 'pkg-cyber-renewal',
    name: 'Cyber Renewal Lite',
    version: 'v2.0',
    status: 'published',
    modules: 9,
    updated: '2026-07-27',
  },
  {
    id: 'pkg-cyber-vendor',
    name: 'Vendor Concentration Add-on',
    version: 'v1.0',
    status: 'published',
    modules: 6,
    updated: '2026-07-21',
  },
  {
    id: 'pkg-cyber-draft',
    name: 'Cyber SME Light',
    version: 'v0.3',
    status: 'draft',
    modules: 8,
    updated: '2026-07-24',
  },
  {
    id: 'pkg-cyber-healthcare',
    name: 'Healthcare PHI Intensive',
    version: 'v0.8',
    status: 'draft',
    modules: 14,
    updated: '2026-07-29',
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
  {
    id: 'out-0912',
    insured: 'LumenForge Software',
    broker: 'Marsh Specialty',
    packageId: 'pkg-cyber-renewal',
    packageLabel: 'Cyber Renewal Lite · v2.0',
    status: 'in_progress',
    attestor: 'broker',
    shippedAt: '2026-07-29',
    link: 'https://submit.shore.example/o/0912',
    moduleIds: defaultModuleIds(),
  },
  {
    id: 'out-0915',
    insured: 'Harbor Retail Group',
    broker: 'Howden Broking',
    packageId: 'pkg-cyber-core',
    packageLabel: 'Cyber Core Adaptive · v1.4',
    status: 'sent',
    attestor: 'broker',
    shippedAt: '2026-07-30',
    link: 'https://submit.shore.example/o/0915',
    moduleIds: defaultModuleIds(),
  },
  {
    id: 'out-0920',
    insured: 'Cascade Logistics',
    broker: 'WTW Cyber',
    packageId: 'pkg-cyber-vendor',
    packageLabel: 'Vendor Concentration Add-on · v1.0',
    status: 'returned',
    attestor: 'insured_officer',
    shippedAt: '2026-07-27',
    link: 'https://submit.shore.example/o/0920',
    moduleIds: defaultModuleIds(),
  },
  {
    id: 'out-0924',
    insured: 'BrightPath Clinics',
    broker: 'Aon Cyber Desk',
    packageId: 'pkg-cyber-high',
    packageLabel: 'Cyber High Limit ($10M+) · v1.1',
    status: 'in_progress',
    attestor: 'broker',
    shippedAt: '2026-07-31',
    link: 'https://submit.shore.example/o/0924',
    moduleIds: [...defaultModuleIds(), 'incident_response'],
  },
  {
    id: 'out-0928',
    insured: 'Airbnb',
    broker: 'Marsh Specialty',
    packageId: 'pkg-cyber-core',
    packageLabel: 'Cyber Core Adaptive · v1.4',
    status: 'returned',
    attestor: 'broker',
    shippedAt: '2026-07-21',
    link: 'https://submit.shore.example/o/0928',
    moduleIds: defaultModuleIds(),
  },
  {
    id: 'out-0931',
    insured: 'Orbital Payments Ltd',
    broker: 'Direct',
    packageId: 'pkg-cyber-renewal',
    packageLabel: 'Cyber Renewal Lite · v2.0',
    status: 'sent',
    attestor: 'insured_officer',
    shippedAt: '2026-08-01',
    link: 'https://submit.shore.example/o/0931',
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
      className="wb-filter-chip"
    >
      {label}
      <span className="wb-filter-chip__count">{count}</span>
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
  /** Returned outtake → Dashboard Workflow (closure path). */
  onProceedToClosure: (prefill: ReturnedOuttakePrefill) => void
}

export function FormShippingCenter({ onProceedToClosure }: Props) {
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
      showSuccessToast('Shared link copied')
    } catch {
      showInfoToast('Could not copy link')
    }
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
    showSuccessToast('Form sent. Broker link is ready.')
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
                Proceed to closure
              </Button>
            ) : null}
            <Button size="sm" variant="secondary" onPress={() => setViewingOuttake(null)}>
              Back to shared
            </Button>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
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
            className="case-drawer-tabs"
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
          <Button size="sm" variant="primary" data-video-action="create-template" onPress={() => openBuilder()}>
            <Send size={14} />
            Create template
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
            <div className="cuw-table-wrap min-h-0 flex-1">
              <table className="cuw-table min-w-[720px]">
                <thead>
                  <tr>
                    <th>Insured</th>
                    <th>Broker</th>
                    <th>Package</th>
                    <th>Attestor</th>
                    <th>Status</th>
                    <th>Shipped</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleOuttakes.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-500">
                        No shared forms match this status.
                      </td>
                    </tr>
                  ) : (
                    visibleOuttakes.map((o) => (
                      <tr key={o.id}>
                        <td className="cuw-table__primary">{o.insured}</td>
                        <td className="cuw-table__muted">{o.broker}</td>
                        <td className="cuw-table__muted">{o.packageLabel}</td>
                        <td>
                          <Chip size="sm" variant="soft" color="default">
                            {o.attestor === 'broker' ? 'Broker' : 'Insured officer'}
                          </Chip>
                        </td>
                        <td>{statusChip(o.status)}</td>
                        <td className="cuw-table__muted">{o.shippedAt}</td>
                        <td>
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              size="sm"
                              variant="secondary"
                              isDisabled={o.status === 'revoked'}
                              data-video-action="view-form"
                              onPress={() => setViewingOuttake(o)}
                            >
                              <Eye size={12} />
                              View form
                            </Button>
                            {o.status === 'returned' ? (
                              <Button
                                size="sm"
                                variant="primary"
                                data-video-action="proceed-closure"
                                onPress={() =>
                                  onProceedToClosure({
                                    insured: o.insured,
                                    broker: o.broker,
                                    packageLabel: o.packageLabel,
                                    outtakeId: o.id,
                                  })
                                }
                              >
                                Proceed to closure
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
            <div className="cuw-table-wrap min-h-0 flex-1">
              <table className="cuw-table min-w-[640px]">
                <thead>
                  <tr>
                    <th>Package</th>
                    <th>Version</th>
                    <th>Modules</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Actions</th>
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
                      <tr key={p.id}>
                        <td>
                          <div className="cuw-table__primary flex items-center gap-2">
                            <Shield size={14} className="text-blue-500" />
                            {p.name}
                          </div>
                        </td>
                        <td className="cuw-table__muted">{p.version}</td>
                        <td className="cuw-table__muted">{p.modules}</td>
                        <td>{statusChip(p.status)}</td>
                        <td className="cuw-table__muted">{p.updated}</td>
                        <td>
                          <Button
                            size="sm"
                            variant="primary"
                            isDisabled={p.status !== 'published'}
                            data-video-action="send-template"
                            onPress={() => openBuilder(p.id)}
                          >
                            <Send size={12} />
                            Send
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
