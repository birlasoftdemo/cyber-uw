import {
  Bell,
  ClipboardCheck,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  ListChecks,
  Scale,
  ShieldAlert,
  XCircle,
} from 'lucide-react'
import { BirlasoftLogo } from './BirlasoftLogo'
import { type JourneyStepId } from '../constants/journeyNav'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberShellView } from './CyberShellToolbar'
import {
  dashboardCounterForCase,
  isDecisionReady,
  submissionStatus,
} from '../utils/submissionStatus'
import { StageJourneyStepper } from './StageJourneyStepper'

export type SpecQueue =
  | 'all'
  | 'new'
  | 'progress'
  | 'referred'
  | 'awaitingBroker'
  | 'decisionReady'
  | 'declined'

export function SpecSidebar({
  shellView,
  queue,
  caseOpen,
  journeyStep,
  onQueue,
  onNavigate,
  onJourney,
}: {
  shellView: CyberShellView
  queue: SpecQueue
  caseOpen: boolean
  journeyStep: JourneyStepId
  onQueue: (queue: SpecQueue) => void
  onNavigate: (view: CyberShellView) => void
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
  let declined = 0
  for (const c of cases) {
    if (isDecisionReady(c, referrals)) decisionReady += 1
    if (submissionStatus(c, referrals) === 'Declined') declined += 1
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
      <aside className="spec-sidebar spec-sidebar--journey">
        <div className="spec-home__brand">
          <BirlasoftLogo />
        </div>
        <nav aria-label="Case journey" className="spec-sidebar__journey-nav">
          <p className="stage-journey__heading">Progress Tracker</p>
          <StageJourneyStepper journeyStep={journeyStep} onJourney={onJourney} />
        </nav>
      </aside>
    )
  }

  return (
    <aside className="spec-sidebar">
        <div className="spec-home__brand">
          <BirlasoftLogo />
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
          <span>Broker Follow-up</span>
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
          className={`spec-nav__sub${onList && queue === 'declined' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('declined')}
        >
          <XCircle size={14} />
          <span>Declined</span>
          <em>{declined}</em>
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
