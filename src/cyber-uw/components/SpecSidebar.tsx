import {
  Bell,
  CircleCheck,
  CircleHelp,
  CircleX,
  ClipboardList,
  FileBarChart,
  List,
  Plus,
} from 'lucide-react'
import { BirlasoftLogo } from './BirlasoftLogo'
import { useCyberUwStore } from '../store/cyberUwStore'
import type { CyberShellView } from './CyberShellToolbar'
import { submissionStatus } from '../utils/submissionStatus'

export type SpecQueue = 'all' | 'new' | 'progress' | 'moreInfo' | 'completed' | 'rejected'

export function SpecSidebar({
  shellView,
  queue,
  caseOpen,
  onQueue,
  onNavigate,
}: {
  shellView: CyberShellView
  queue: SpecQueue
  caseOpen: boolean
  onQueue: (queue: SpecQueue) => void
  onNavigate: (view: CyberShellView) => void
}) {
  const cases = useCyberUwStore((s) => s.cases)
  const referrals = useCyberUwStore((s) => s.referrals)
  const openReferrals = referrals.filter((r) => r.status !== 'resolved').length
  let fresh = 0
  let progress = 0
  let moreInfo = 0
  let done = 0
  let rejected = 0
  for (const c of cases) {
    const status = submissionStatus(c, referrals)
    switch (status) {
      case 'New':
        fresh += 1
        break
      case 'In Progress':
        progress += 1
        break
      case 'More Info Required':
        moreInfo += 1
        break
      case 'Completed':
        done += 1
        break
      case 'Rejected':
        rejected += 1
        break
      default: {
        const _exhaustive: never = status
        void _exhaustive
      }
    }
  }
  const onList = shellView === 'workbench' && !caseOpen
  const submissionsOn = shellView === 'workbench' && (caseOpen || queue === 'all')

  return (
    <aside className="spec-sidebar">
      <div className="spec-home__brand">
        <BirlasoftLogo />
      </div>
      <nav aria-label="Submissions">
        <button
          type="button"
          className={`spec-nav__item${submissionsOn ? ' spec-nav__item--parent' : ''}`}
          onClick={() => onQueue('all')}
        >
          <ClipboardList size={16} />
          Submissions
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'new' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('new')}
        >
          <Plus size={14} />
          <span>New</span>
          <em>{fresh}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'progress' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('progress')}
        >
          <List size={14} />
          <span>In Progress</span>
          <em>{progress}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'moreInfo' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('moreInfo')}
        >
          <CircleHelp size={14} />
          <span>More Info Required</span>
          <em>{moreInfo}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'completed' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('completed')}
        >
          <CircleCheck size={14} />
          <span>Completed</span>
          <em>{done}</em>
        </button>
        <button
          type="button"
          className={`spec-nav__sub${onList && queue === 'rejected' ? ' spec-nav__sub--active' : ''}`}
          onClick={() => onQueue('rejected')}
        >
          <CircleX size={14} />
          <span>Rejected</span>
          <em>{rejected}</em>
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
