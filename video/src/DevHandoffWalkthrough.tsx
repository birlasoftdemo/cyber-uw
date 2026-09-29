import React from "react";
import {
  AbsoluteFill,
  Img,
  Sequence,
  Series,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ScreenBeat } from "./components/ScreenBeat";
import { colors, fps } from "./theme";

/**
 * Dev handoff walkthrough — Brightcare case narrative for engineers.
 * Screens: video/public/handoff/ (`npm run capture:handoff`).
 */
export const SCENE = {
  title: 5 * fps,
  login: 8 * fps,
  openCases: 8 * fps,
  newSubmission: 9 * fps,
  customer360: 9 * fps,
  floatC360: 8 * fps,
  floatDocs: 8 * fps,
  policyDocs: 8 * fps,
  riskInfo: 9 * fps,
  floatContinue: 8 * fps,
  riskAnalysis: 8 * fps,
  quoteReady: 9 * fps,
  confirm: 8 * fps,
  locked: 8 * fps,
  closer: 6 * fps,
} as const;

export const HANDOFF_TOTAL_FRAMES = Object.values(SCENE).reduce((a, b) => a + b, 0);

export function DevHandoffWalkthrough() {
  return (
    <AbsoluteFill>
      <Series>
        <Series.Sequence durationInFrames={SCENE.title}>
          <TitleCard />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.login}>
          <ScreenBeat
            src="handoff/01-login.png"
            eyebrow="1 · Login · Brightcare walkthrough"
            title="Auth is a gate, not a router."
            caption="UW: uw@cyber.internal / uw123 · Ops: ops@cyber.internal / ops123. SSO buttons always land as underwriter."
            devTakeaway="App.tsx swaps LoginPage ↔ CyberUwShell on authStore.isAuthenticated. Session is sessionStorage (cyber-uw-auth-session). Role drives sidebar nav only — no URL routes for cases."
            zoomFrom={1.02}
            zoomTo={1.06}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.openCases}>
          <ScreenBeat
            src="handoff/02-open-cases.png"
            eyebrow="2 · Open cases · queue"
            title="List when selectedId is null."
            caption="Workbench default after login. Click a row to open a case. New Submission starts intake without leaving the shell."
            devTakeaway="CyberCasesListPage + CyberShellToolbar. selectedId lives in cyberUwStore — not the URL. Stage chip = flowStageTitle() from cyberFlow.ts. Filters: filterCyberCases()."
            zoomFrom={1}
            zoomTo={1.04}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.newSubmission}>
          <ScreenBeat
            src="handoff/03-new-submission.png"
            eyebrow="3 · New Submission · Brightcare package"
            title="Upload or Mail MCP → createSubmission."
            caption="Ingest runs thinking UI, then seeds a CYB-* case. This walkthrough uses Brightcare Digital Health (demoPackage: 'uw')."
            devTakeaway="CyberNewSubmissionModal → inferExtractedSubmission → createSubmission. Rich UW dossier: data/demoIngest.ts. Opens with selectedId set; Birlasoft Customer Insights shows first (customer360Dismissed unset)."
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.customer360}>
          <ScreenBeat
            src="handoff/04-customer-360.png"
            eyebrow="4 · Customer Insights · Brightcare"
            title="Context panel before any stage work."
            caption="AI summary (rule-based), product/LOB KPIs, completeness, missing-doc checklist. Not the decision desk yet."
            devTakeaway="Customer360Panel + buildC360AiSummary (no LLM). Tabs in CaseWorkspace: Birlasoft Customer Insights vs Submission Workbench. Continuous scroll stacks both; toggle = showCustomer360 / dismissCustomer360 on the case."
            zoomFrom={1}
            zoomTo={1.04}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.floatC360}>
          <ScreenBeat
            src="handoff/05-float-c360.png"
            eyebrow="5 · Floating CTA · Insights surface"
            title="Continue to Submission Workbench is the same dismiss."
            caption="Bottom glass bar always mounts with the case. On Customer Insights it advances into the four-stage workbench."
            devTakeaway="FloatingWorkflowBar surface='c360' → dismissCustomer360 + scroll to #cuw-workbench-root. Workflow surface switches once customer360Dismissed === true."
            zoomFrom={1.05}
            zoomTo={1.1}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.floatDocs}>
          <ScreenBeat
            src="handoff/05b-float-docs-complete.png"
            eyebrow="6a · Float · Policy Documents gate"
            title="Documents Complete is the package gate."
            caption="After Submission Workbench, the float asks for Documents Complete before Risk Information unlocks."
            devTakeaway="canLeavePolicyDocuments: completeness ≥ 80%, no missing docs, packageSignOff.signedOffAt. CTA → DocumentsCompleteModal → signOffPackage. Gates live in cyberFlow.ts."
            zoomFrom={1.04}
            zoomTo={1.09}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.policyDocs}>
          <ScreenBeat
            src="handoff/06-policy-documents.png"
            eyebrow="6b · Brightcare · Policy Documents"
            title="Stage 0 — package + extracted fields."
            caption="Checklist, dossier anchors, QuestionFields. Ops can own this stage; UW continues through the rest."
            devTakeaway="CYBER_FLOW_STAGES[0]. workflowStage cursor + cyberFlowIndex(). PolicyDocumentsStageBody in CaseWorkspace. Incomplete packages stay floored at stage 0."
            zoomFrom={1}
            zoomTo={1.04}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.riskInfo}>
          <ScreenBeat
            src="handoff/07-risk-information.png"
            eyebrow="6c · Brightcare · Risk Information"
            title="Required triage = Ideal vs Detected."
            caption="Approve / Escalate / Ignore on required findings (eligibility, HIPAA, MFA, loss). Open MFA gap is intentional on Brightcare."
            devTakeaway="triageFindingsForCase (cyberTriageRules) + riskJudgments via signRiskItem. canLeaveRiskInformation requires packageSignOff + all required judgments. Float scroll-gates stage 1 until near bottom."
            zoomFrom={1}
            zoomTo={1.04}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.floatContinue}>
          <ScreenBeat
            src="handoff/07b-float-continue-risk.png"
            eyebrow="6d · Float · Continue after triage"
            title="Continue advances workflowStage."
            caption="Once scrolled and required findings are clear, Continue to Risk Analysis lights up."
            devTakeaway="advanceWorkflowStage enforces the same gates as the UI. Prefer that over setWorkflowStage in product flows — setWorkflowStage is a jump helper (used by capture)."
            zoomFrom={1.04}
            zoomTo={1.09}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.riskAnalysis}>
          <ScreenBeat
            src="handoff/08-risk-analysis.png"
            eyebrow="6e · Brightcare · Risk Analysis"
            title="Security rating + ALE / exposure."
            caption="Market and capacity panels with cite-back drawers. Review charts, then Continue to Getting Ready to Quote."
            devTakeaway="RiskAnalysisStageBody → SecurityRatingPanel + RiskVizCharts + RiskEvidenceCitePanel. Stage index 2. No hard judgment gate — advanceWorkflowStage is enough."
            zoomFrom={1}
            zoomTo={1.04}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.quoteReady}>
          <ScreenBeat
            src="handoff/09-getting-ready-quote.png"
            eyebrow="6f · Brightcare · Getting Ready to Quote"
            title="Financial sign-off unlocks Quote."
            caption="Limit, SIR, pricing tier, stub premium. Manager cosign when over junior authority or critical gaps."
            devTakeaway="saveFinancialSignOff → financialSignOff.signedOffAt. needsManagerCosign / isWithinJuniorAuthority in cyberFlow.ts. Float Quote stays disabled until sign-off is complete."
            zoomFrom={1}
            zoomTo={1.04}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.confirm}>
          <ScreenBeat
            src="handoff/09b-decision-confirm.png"
            eyebrow="6g · DecisionConfirmModal"
            title="Intentional friction before capital lock."
            caption="Quote / Escalate / Decline all open the same confirm pattern. No separate bind modal in this codebase."
            devTakeaway="DecisionConfirmModal ← FloatingWorkflowBar onRequestDecision. applyDecision sets decision + pasStatus: 'synced'. Quote path re-checks financial sign-off and manager cosign."
            zoomFrom={1}
            zoomTo={1.05}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.locked}>
          <ScreenBeat
            src="handoff/10-decision-locked.png"
            eyebrow="6h · Decision locked · PAS synced"
            title="Human locked — bar shows Decision locked."
            caption="Brightcare Quote complete. List row shows Locked · Quote. Undo returns pending + pasStatus idle."
            devTakeaway="Terminal state: decision !== 'pending' and pasStatus === 'synced'. Float stops advancing. undoDecision for corrections. pushToPas is largely redundant after applyDecision."
            zoomFrom={1}
            zoomTo={1.03}
          />
        </Series.Sequence>

        <Series.Sequence durationInFrames={SCENE.closer}>
          <CloserCard />
        </Series.Sequence>
      </Series>

      <Sequence from={0} layout="none">
        <ProgressRail />
      </Sequence>
    </AbsoluteFill>
  );
}

function TitleCard() {
  const frame = useCurrentFrame();
  const { fps: f } = useVideoConfig();
  const t = spring({ frame, fps: f, config: { damping: 16 } });

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, #0b1220 0%, #152238 45%, #1a2740 100%)",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.white,
        opacity: interpolate(t, [0, 1], [0, 1]),
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.12em",
          opacity: 0.55,
          textTransform: "uppercase",
        }}
      >
        Dev handoff · case walkthrough
      </div>
      <h1
        style={{
          fontSize: 48,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: "14px 0 18px",
          textAlign: "center",
          maxWidth: 980,
          lineHeight: 1.15,
        }}
      >
        Brightcare — what to understand from login to lock
      </h1>
      <p
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: colors.yellow,
          textAlign: "center",
          maxWidth: 820,
          lineHeight: 1.4,
        }}
      >
        Each beat: user action + the store gates, files, and role rules engineers
        own next.
      </p>
    </AbsoluteFill>
  );
}

function CloserCard() {
  const frame = useCurrentFrame();
  const { fps: f } = useVideoConfig();
  const t = spring({ frame, fps: f, config: { damping: 14 } });
  const thumbs = [
    "handoff/01-login.png",
    "handoff/04-customer-360.png",
    "handoff/07-risk-information.png",
    "handoff/10-decision-locked.png",
  ];

  return (
    <AbsoluteFill
      style={{
        background:
          "linear-gradient(160deg, #0b1220 0%, #152238 45%, #1a2740 100%)",
        padding: "56px 64px",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        color: colors.white,
        opacity: interpolate(t, [0, 1], [0, 1]),
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: "0.1em",
          opacity: 0.55,
        }}
      >
        BRIGHTCARE · UW PERSONA · CODE MAP
      </div>
      <h1
        style={{
          fontSize: 36,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: "10px 0 12px",
        }}
      >
        authStore · cyberUwStore · cyberFlow · FloatingWorkflowBar
      </h1>
      <p
        style={{
          fontSize: 20,
          fontWeight: 600,
          color: "rgba(255,255,255,0.7)",
          marginBottom: 24,
          maxWidth: 900,
        }}
      >
        Start at CaseWorkspace + cyberFlow.ts. Float bar is the stage machine UI;
        applyDecision is the terminal lock.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          flex: 1,
          minHeight: 0,
        }}
      >
        {thumbs.map((src) => (
          <div
            key={src}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "#0a0f18",
            }}
          >
            <Img
              src={staticFile(src)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
}

function ProgressRail() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = frame / Math.max(1, durationInFrames - 1);

  return (
    <div
      style={{
        position: "absolute",
        left: 56,
        right: 56,
        bottom: 18,
        height: 4,
        borderRadius: 2,
        background: "rgba(255,255,255,0.15)",
        overflow: "hidden",
        zIndex: 5,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: colors.blue,
        }}
      />
    </div>
  );
}
