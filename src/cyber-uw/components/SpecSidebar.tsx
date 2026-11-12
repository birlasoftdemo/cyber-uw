import {
  Bell,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  FileSearch,
  GitBranch,
  LayoutDashboard,
  ListChecks,
  Scale,
  ScrollText,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { BirlasoftLogo } from './BirlasoftLogo'
import { JOURNEY_STEPS, PRODUCT_NAME, type JourneyStepId } from '../constants/journeyNav'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberShellView } from './CyberShellToolbar'
import {
  dashboardCounterForCase,
  isDecisionReady,
  submissionStatus,
} from '../utils/submissionStatus'

export type SpecQueue =
  | 'all'
  | 'new'
  | 'progress'
  | 'referred'
  | 'awaitingBroker'
  | 'decisionReady'

const JOURNEY_ICONS: Record<JourneyStepId, typeof LayoutDashboard> = {
  intake: ClipboardList,
  risk: Scale,
  enrichment: Sparkles,
  evidence: FileSearch,
  decision: ListChecks,
  integration: GitBranch,
  audit: ScrollText,
}

export function SpecSidebar({
  shellView,
  queue,
  caseOpen,
  journeyStep,
  onQueue,
  onNavigate,
  onDashboard,
  onJourney,
}: {
  shellView: CyberShellView
  queue: SpecQueue
  caseOpen: boolean
  journeyStep: JourneyStepId
  onQueue: (queue: SpecQueue) => void
  onNavigate: (view: CyberShellView) => void
  onDashboard: () => void
  onJourney: (step: JourneyStepId) => void
}) {
  const cases = useCyberUwStore((s) => s.cases)
  const referrals = useCyberUwStore((s) => s.referrals)
  const openReferrals = referrals.filter((r) => r.status !== 'resolved').length

  let newSubmissions = 0
  let inProgress = 0
  let referred = 0
  let awaitingBroker = 0
  let decisionReady = 0
  for (const c of cases) {
    if (isDecisionReady(c, referrals)) decisionReady += 1
    const bucket = dashboardCounterForCase(c, referrals)
    switch (bucket) {
      case 'newSubmissions':
        newSubmissions += 1
        break
      case 'inProgress':
        inProgress += 1
        break
      case 'referred':
        referred += 1
        break
      case 'awaitingBroker':
        awaitingBroker += 1
        break
      case null:
        break
      default: {
        const _exhaustive: never = bucket
        void _exhaustive
      }
    }
  }

  const onList = shellView === 'workbench' && !caseOpen

  if (caseOpen) {
    return (
      <aside className="spec-sidebar">
        <div className="spec-home__brand">
          <BirlasoftLogo />
          <p className="spec-home__product">{PRODUCT_NAME}</p>
        </div>
        <nav aria-label="Case journey">
          <button
            type="button"
            className="spec-nav__item"
            onClick={onDashboard}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>
          {JOURNEY_STEPS.map((step) => {
            const Icon = JOURNEY_ICONS[step.id]
            const active = journeyStep === step.id
            return (
              <button
                key={step.id}
                type="button"
                className={`spec-nav__sub${active ? ' spec-nav__sub--active' : ''}`}
                onClick={() => onJourney(step.id)}
              >
                <Icon size={14} />
                <span>{step.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    )
  }

  return (
    <aside className="spec-sidebar">
      <div className="spec-home__brand">
        <BirlasoftLogo />
        <p className="spec-home__product">{PRODUCT_NAME}</p>
      </div>
      <nav aria-label="Dashboard">
        <button
          type="button"
          className={`spec-nav__item${onList && queue === 'all' ? ' spec-nav__item--parent' : ''}`}
          onClick={() => onQueue('all')}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'new' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('new')}
        >
          <ClipboardList size={14} />
          <span>New Submissions</span>
          <em>{newSubmissions}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'progress' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('progress')}
        >
          <ListChecks size={14} />
          <span>In progress</span>
          <em>{inProgress}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'referred' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('referred')}
        >
          <ShieldAlert size={14} />
          <span>Referred</span>
          <em>{referred}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'awaitingBroker' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('awaitingBroker')}
        >
          <ClipboardCheck size={14} />
          <span>Awaiting Broker</span>
          <em>{awaitingBroker}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'decisionReady' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('decisionReady')}
        >
          <Scale size={14} />
          <span>Decision-ready</span>
          <em>{decisionReady}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__item${shellView === 'insights' ? ' spec-nav__item--parent' : ''}`}
          onClick={() => onNavigate('insights')}
        >
          <FileBarChart size={16} />
          Reports
        </button>
        <button type="button" className="spec-nav__item" onClick={() => onNavigate('referrals')}>
          <Bell size={16} />
          <span>Notifications</span>
          <em>{openReferrals}</em>
        </button>
      </nav>
    </aside>
  )
}

/** Keep helper available for any leftover callers. */
export function queueCountLabel(status: ReturnType<typeof submissionStatus>) {
  return status
}
