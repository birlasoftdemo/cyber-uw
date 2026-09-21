import { defaultModuleIds } from '../constants/formModules'
import { BrokerFormFlow } from '../components/broker-form/BrokerFormFlow'

/** Public Typeform-style broker path — same flow as Manage Submissions outtake view. */
export function BrokerFormPreviewPage() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-50">
      <BrokerFormFlow
        moduleIds={defaultModuleIds()}
        insuredHint="Northwind Analytics Inc."
        brokerName="Alex Morgan"
        brokerFirm="Meridian Risk Brokers"
        packageLabel="Cyber intake — standard"
        mode="live"
        dossierReady
      />
    </div>
  )
}
