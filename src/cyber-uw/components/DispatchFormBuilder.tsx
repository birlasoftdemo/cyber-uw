import { Button, Input, Label, TextField } from '@heroui/react'
import { ArrowLeft, Check, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CYBER_FORM_MODULES } from '../constants/formModules'
import { BrokerFormFlow } from './broker-form/BrokerFormFlow'

export type AttestorRole = 'broker' | 'insured_officer'

export interface FormPackageOption {
  id: string
  name: string
  version: string
  status: 'draft' | 'published'
}

export interface DispatchPayload {
  insured: string
  broker: string
  packageId: string
  packageLabel: string
  attestor: AttestorRole
  notifyEmail: string
  moduleIds: string[]
}

interface Props {
  packages: FormPackageOption[]
  initialPackageId?: string
  onCancel: () => void
  onSend: (payload: DispatchPayload) => void
}

export function DispatchFormBuilder({
  packages,
  initialPackageId,
  onCancel,
  onSend,
}: Props) {
  const published = packages.filter((p) => p.status === 'published')
  const [insured, setInsured] = useState('')
  const [broker, setBroker] = useState('')
  const [packageId, setPackageId] = useState(
    initialPackageId && published.some((p) => p.id === initialPackageId)
      ? initialPackageId
      : (published[0]?.id ?? ''),
  )
  const [attestor, setAttestor] = useState<AttestorRole>('broker')
  const [notifyEmail, setNotifyEmail] = useState('')
  const [moduleIds, setModuleIds] = useState<string[]>([])

  const selectedPkg = published.find((p) => p.id === packageId)
  const packageLabel = selectedPkg ? `${selectedPkg.name} · ${selectedPkg.version}` : undefined

  const canSend = insured.trim().length > 1 && Boolean(selectedPkg) && moduleIds.length > 0

  const previewModules = useMemo(() => moduleIds, [moduleIds])

  const toggleModule = (id: string) => {
    setModuleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const handleSend = () => {
    if (!canSend || !selectedPkg) return
    onSend({
      insured: insured.trim(),
      broker: broker.trim() || 'Direct',
      packageId: selectedPkg.id,
      packageLabel: `${selectedPkg.name} · ${selectedPkg.version}`,
      attestor,
      notifyEmail: notifyEmail.trim(),
      moduleIds,
    })
  }

  return (
    <div className="cuw-broker cuw-broker--builder-chrome flex h-full min-h-0 flex-col overflow-hidden">
      <div className="cuw-broker__bg" aria-hidden>
        <div className="cuw-broker__waves" />
        <div className="cuw-broker__waves-2" />
      </div>

      <div className="relative z-[2] flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--cuw-line)] bg-[rgba(245,249,251,0.78)] px-3 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onPress={onCancel}>
            <ArrowLeft size={14} />
            Back
          </Button>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.06em] text-[var(--cuw-ink-soft)]">
              Dispatch New Form
            </p>
            <h2 className="text-sm font-bold tracking-tight text-[var(--cuw-ink)]">
              Form parameter builder
            </h2>
          </div>
        </div>
        <Button variant="primary" size="sm" isDisabled={!canSend} onPress={handleSend}>
          <Send size={14} />
          Send form
        </Button>
      </div>

      <div className="relative z-[1] grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(300px,1.05fr)]">
        <div className="min-h-0 overflow-auto border-b border-[var(--cuw-line)] bg-[rgba(245,249,251,0.55)] p-4 lg:border-b-0 lg:border-r">
          <section className="cuw-broker__section !p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--cuw-ink-soft)]">
              Broker &amp; insured
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-[var(--cuw-ink-soft)]">Named insured</Label>
                <input
                  className="cuw-broker__field mt-1"
                  value={insured}
                  onChange={(e) => setInsured(e.target.value)}
                  placeholder="Northwind Analytics Inc."
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[var(--cuw-ink-soft)]">Broker</Label>
                <input
                  className="cuw-broker__field mt-1"
                  value={broker}
                  onChange={(e) => setBroker(e.target.value)}
                  placeholder="Meridian Risk Brokers"
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-[var(--cuw-ink-soft)]">Base package</Label>
                <select
                  className="cuw-broker__field mt-1"
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                >
                  {published.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.version}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label className="text-xs font-semibold text-[var(--cuw-ink-soft)]">
                  Who attests application representations
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="cuw-broker__choice"
                    aria-pressed={attestor === 'broker'}
                    onClick={() => setAttestor('broker')}
                  >
                    Broker
                  </button>
                  <button
                    type="button"
                    className="cuw-broker__choice"
                    aria-pressed={attestor === 'insured_officer'}
                    onClick={() => setAttestor('insured_officer')}
                  >
                    Insured officer / legal
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <TextField>
                  <Label className="text-xs font-semibold text-[var(--cuw-ink-soft)]">
                    Notify email (optional)
                  </Label>
                  <Input
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="alex.morgan@meridianrisk.com"
                  />
                </TextField>
              </div>
            </div>
          </section>

          <section className="cuw-broker__section mt-4 !p-4">
            <div className="mb-2 flex items-end justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--cuw-ink-soft)]">
                Modules for this broker
              </h3>
              <span className="text-[11px] font-semibold text-[var(--cuw-ink-soft)]">
                {moduleIds.length} of {CYBER_FORM_MODULES.length} on
              </span>
            </div>
            <p className="mb-3 text-sm font-medium text-[var(--cuw-ink-soft)]">
              Toggle the adaptive modules the broker completes. The live preview on the right mirrors
              the context-building form they will receive.
            </p>
            <ul className="space-y-2">
              {CYBER_FORM_MODULES.map((m) => {
                const on = moduleIds.includes(m.id)
                return (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => toggleModule(m.id)}
                      className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                        on
                          ? 'border-[var(--cuw-sea)] bg-[rgba(213,236,239,0.85)]'
                          : 'border-[var(--cuw-line)] bg-white/80 hover:border-[rgba(13,79,92,0.28)]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                          on
                            ? 'border-[var(--cuw-sea)] bg-[var(--cuw-sea)] text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        <Check size={12} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-[var(--cuw-ink)]">{m.label}</span>
                        <span className="block text-xs font-medium text-[var(--cuw-ink-soft)]">
                          {m.purpose}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>

        <aside className="flex min-h-0 flex-col overflow-hidden p-2 sm:p-3">
          <p className="relative z-[2] mb-2 px-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--cuw-ink-soft)]">
            Broker form preview
          </p>
          <div className="min-h-0 flex-1 overflow-hidden rounded-2xl">
            <BrokerFormFlow
              key={previewModules.join('|')}
              compact
              moduleIds={previewModules}
              insuredHint={insured.trim() || undefined}
              brokerFirm={broker.trim() || 'Meridian Risk Brokers'}
              packageLabel={packageLabel}
              mode="live"
              dossierReady
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
