import { Button, Input, Label, Typography } from '@heroui/react'
import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { stubToast } from '../../../components/console-v2/consoleToast'
import {
  CONSOLE_APPS,
  CONSOLE_LOBS,
  RULE_CONDITION_FIELDS,
  RULE_OPERATORS,
  RULE_THEN_ACTIONS,
  type ConsoleRule,
  type RuleCondition,
} from '../../../data/consoleV2Seed'
import { useAuthStore } from '../../../store/authStore'
import { useConsoleV2Store } from '../../../store/consoleV2Store'

type RuleDraft = Omit<ConsoleRule, 'id' | 'updatedAt'> & { id?: string }

export function RuleEditorScreen() {
  const actor = useAuthStore((s) => s.user?.name ?? 'System Admin')
  const getRuleDraft = useConsoleV2Store((s) => s.getRuleDraft)
  const editingRuleId = useConsoleV2Store((s) => s.editingRuleId)
  const saveRule = useConsoleV2Store((s) => s.saveRule)
  const setScreen = useConsoleV2Store((s) => s.setScreen)

  const [draft, setDraft] = useState<RuleDraft>(() => getRuleDraft())

  useEffect(() => {
    setDraft(getRuleDraft())
  }, [editingRuleId, getRuleDraft])

  const updateCondition = (id: string, patch: Partial<RuleCondition>) => {
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }))
  }

  const addCondition = () => {
    setDraft((prev) => ({
      ...prev,
      conditions: [
        ...prev.conditions,
        {
          id: `cond-${Date.now()}`,
          field: RULE_CONDITION_FIELDS[0],
          operator: RULE_OPERATORS[0],
          value: '',
        },
      ],
    }))
  }

  const removeCondition = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      conditions: prev.conditions.length <= 1 ? prev.conditions : prev.conditions.filter((c) => c.id !== id),
    }))
  }

  const onSaveDraft = () => {
    if (!draft.name.trim()) {
      stubToast('Rule name required')
      return
    }
    saveRule({ ...draft, status: 'draft' }, actor, 'draft')
    stubToast('Save Draft', 'Rule saved as draft (local prototype state).')
  }

  const onTest = () => {
    saveRule(draft, actor, 'test')
    stubToast('Test Rule', 'Stub test run completed — no engine invoked.')
  }

  const onPublish = () => {
    if (!draft.name.trim()) {
      stubToast('Rule name required')
      return
    }
    saveRule(draft, actor, 'publish')
    stubToast('Publish', 'Rule published locally — no backend notify.')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Typography.Paragraph size="sm" color="muted">
        Configure IF conditions and a Then action. Save Draft / Test / Publish are toast stubs for
        this wireframe.
      </Typography.Paragraph>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Rule Name" className="sm:col-span-2">
          <Input
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            aria-label="Rule Name"
          />
        </Field>
        <Field label="App">
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={draft.app}
            onChange={(e) => setDraft((d) => ({ ...d, app: e.target.value }))}
            aria-label="App"
          >
            {CONSOLE_APPS.map((app) => (
              <option key={app} value={app}>
                {app}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Version">
          <Input
            value={draft.version}
            onChange={(e) => setDraft((d) => ({ ...d, version: e.target.value }))}
            aria-label="Version"
          />
        </Field>
        <Field label="LOB">
          <select
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
            value={draft.lob}
            onChange={(e) => setDraft((d) => ({ ...d, lob: e.target.value }))}
            aria-label="LOB"
          >
            {CONSOLE_LOBS.map((lob) => (
              <option key={lob} value={lob}>
                {lob}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Effective Date">
          <Input
            type="date"
            value={draft.effectiveDate}
            onChange={(e) => setDraft((d) => ({ ...d, effectiveDate: e.target.value }))}
            aria-label="Effective Date"
          />
        </Field>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-slate-800">IF conditions</p>
          <Button size="sm" variant="secondary" onPress={addCondition}>
            <Plus size={14} />
            Add condition
          </Button>
        </div>
        <div className="space-y-3">
          {draft.conditions.map((condition, index) => (
            <div
              key={condition.id}
              className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <select
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                value={condition.field}
                onChange={(e) => updateCondition(condition.id, { field: e.target.value })}
                aria-label={`Condition ${index + 1} field`}
              >
                {RULE_CONDITION_FIELDS.map((field) => (
                  <option key={field} value={field}>
                    {field}
                  </option>
                ))}
              </select>
              <select
                className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm"
                value={condition.operator}
                onChange={(e) => updateCondition(condition.id, { operator: e.target.value })}
                aria-label={`Condition ${index + 1} operator`}
              >
                {RULE_OPERATORS.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
              <Input
                value={condition.value}
                onChange={(e) => updateCondition(condition.id, { value: e.target.value })}
                placeholder="Value"
                aria-label={`Condition ${index + 1} value`}
              />
              <Button
                size="sm"
                variant="secondary"
                isDisabled={draft.conditions.length <= 1}
                onPress={() => removeCondition(condition.id)}
                aria-label={`Remove condition ${index + 1}`}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <Field label="Then action">
        <select
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
          value={draft.thenAction}
          onChange={(e) => setDraft((d) => ({ ...d, thenAction: e.target.value }))}
          aria-label="Then action"
        >
          {RULE_THEN_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
      </Field>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="primary" onPress={onSaveDraft}>
          Save Draft
        </Button>
        <Button size="sm" variant="secondary" onPress={onTest}>
          Test
        </Button>
        <Button size="sm" variant="primary" onPress={onPublish}>
          Publish
        </Button>
        <Button size="sm" variant="secondary" onPress={() => setScreen('rules')}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`space-y-1.5 ${className}`.trim()}>
      <Label className="text-xs font-medium text-slate-600">{label}</Label>
      {children}
    </div>
  )
}