import type { CyberCase } from '../types'
import { NewSubmissionOverview } from './NewSubmissionOverview'
import { SubmissionIntakePanel } from './SubmissionIntakePanel'

export function NewSubmissionStage({ c }: { c: CyberCase }) {
  return (
    <div className="ns-stage">
      <div className="ns-submission">
        <NewSubmissionOverview c={c} />
        <SubmissionIntakePanel c={c} />
      </div>
    </div>
  )
}
