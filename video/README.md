# Cyber UW video (Remotion)

## Agents Assist launch (default)

Apple-keynote style ~91s film from `docs/planning/APPLE-STYLE-LAUNCH-SCRIPT.md`:

- Humanized VO (`public/vo/*.m4a`, macOS **Flo** via `npm run vo`)
- Spotlight callouts on product screens so viewers can follow AI beats
- Composition: `AgentsAssistLaunch` · 1920×1080 · 30fps

```bash
cd video
npm run vo       # regenerate chapter VO (macOS only)
npm run dev      # Remotion Studio
npm run render   # → out/agents-assist-launch.mp4
```

## Product demo walkthrough (`CyberUwWorkflow`)

Ops shipping → UW Northwind stage arc (no VO):

```bash
# App must be running (repo root)
npm run dev -- --host 127.0.0.1 --port 5174

# Refresh screenshots (requires Playwright chromium once)
cd video
node scripts/capture-walkthrough.mjs

npm run render:workflow   # → out/cyber-uw-workflow.mp4
```

Screenshots: `public/walkthrough/`.

### Scene order

| Beat | Screen | Persona |
|------|--------|---------|
| Login | `01-login.png` | shared |
| Manage Submissions (Shared) | `03-manage-submissions.png` | Ops |
| Select modules / ship | `11-ops-module-builder.png` | Ops |
| Returned outtakes | `12-ops-returned-and-ship.png` | Ops |
| Proceed → Feedback desk | `13-ops-proceed-closure-desk.png` | Ops |
| Ready for UW | `14-ops-uw-handoff.png` | Ops |
| Referral Inbox | `05-referral-inbox.png` | Ops |
| Handoff card | (motion) | — |
| UW Insights | `15-uw-insights.png` | Cyber UW |
| Gap-blocked backlog drill | `16-uw-gap-backlog-drill.png` | Cyber UW |
| Northwind desk (New done) | `07-uw-decision-desk.png` | Cyber UW · **CYB-2401** |
| Feedback Ideal vs Detected | `08-uw-feedback-ideal-detected.png` | Cyber UW |
| Review Risk sign-offs | `17-uw-review-risk.png` | Cyber UW |
| Review Platform signed | `18b-uw-review-platform-signed.png` | Cyber UW |
| Closure financial sign-off | `09-uw-closure.png` | Cyber UW |
| UW Referrals | `10-uw-referrals.png` | Cyber UW |
| Closer | mosaic | — |

### Stage / sign-off validation (Northwind)

| Stage | Visual proof | Capture |
|-------|----------------|---------|
| **New** | Stepper checkmark · Completed | `07`, `08`, `17`, `09` |
| **Feedback** | Ideal vs Detected · Resolve/Refer · EDR Referred | `08` |
| **Review Risk** | Active after gaps cleared · Accept judgments | `17` |
| **Review Platform** | Cards signed Watch | `18b` |
| **Closure** | Financial sign-off recorded · manager cosign | `09` |

Demo case for Cyber UW remains **Northwind Health Systems (`CYB-2401`)**. Ops shipping path uses Meridian Logistics for Ready-for-UW handoff.
