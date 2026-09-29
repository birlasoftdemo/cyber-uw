/**
 * Realistic demo exhibit text for package-document previews.
 * Brightcare Digital Health dossier — fictional / underwriting-demo only.
 */

const CONFIDENTIAL =
  'CONFIDENTIAL — For underwriting and broker use only. Not for redistribution.'

export function exhibitBodyFor(name: string, kind: string): string | null {
  const n = name.toLowerCase()
  const k = kind.toLowerCase()

  if (n.includes('architecture') || k === 'architecture') return ARCHITECTURE
  if (
    n.includes('incident') ||
    n.includes('ir_plan') ||
    k === 'incident response plan'
  ) {
    return INCIDENT_RESPONSE
  }
  if (
    n.includes('disaster') ||
    n.includes('dr_drill') ||
    n.includes('restore') ||
    k === 'disaster recovery drill report'
  ) {
    return DR_DRILL
  }
  if (n.includes('iso27001') || n.includes('iso_27001') || k === 'iso report') {
    return ISO_REPORT
  }
  if (
    n.includes('compliance') ||
    n.includes('hipaa') ||
    n.includes('certification') ||
    k === 'compliance certifications'
  ) {
    return COMPLIANCE_CERTS
  }
  if (
    n.includes('soc2') ||
    n.includes('soc_2') ||
    n.includes('soc report') ||
    k === 'soc report' ||
    k === 'soc2'
  ) {
    return SOC_REPORT
  }
  if (n.includes('app') || k === 'application') return APPLICATION
  return null
}

const APPLICATION = [
  'CYBER LIABILITY APPLICATION — 2026',
  'Brightcare Digital Health, Inc.',
  CONFIDENTIAL,
  '',
  'Broker of record: Marsh Specialty — Cyber Practice',
  'Submission date: 2026-09-18',
  'Requested effective: 2026-10-01  |  Term: 12 months',
  'Limit requested: $5,000,000 aggregate / $5,000,000 each claim',
  'Retention requested: $100,000',
  '',
  '1. APPLICANT',
  '   Legal name: Brightcare Digital Health, Inc.',
  '   DBA: Brightcare',
  '   HQ: 500 Healthcloud Pkwy, Boston, MA 02110',
  '   Primary NAICS: 621999 (Healthcare SaaS / care coordination)',
  '   Employees: ~420  |  Annual revenue (TTM): $128,000,000',
  '   Website / primary domain: brightcare.health',
  '',
  '2. BUSINESS ACTIVITIES',
  '   Cloud-hosted patient engagement and care-coordination platform.',
  '   Processes ePHI for ~2.1M covered lives via BAA-covered customers.',
  '   No owned clinics; SaaS delivery only. Hosting: AWS us-east-1 / us-west-2.',
  '',
  '3. PRIOR CYBER / PRIVACY CLAIMS (5 YEARS)',
  '   None reported. No regulatory fines or OCR settlements disclosed.',
  '',
  '4. CONTROL ATTESTATIONS (SUMMARY)',
  '   MFA on privileged / remote admin ........ Okta Verify + phishing-resistant',
  '                                            keys for Tier-0; VPN MFA asserted',
  '   EDR coverage ........................... CrowdStrike Falcon ≥98% endpoints',
  '   Immutable / tested backups ............. Daily; last restore test 2026-06-12',
  '   Email security ......................... M365 + Proofpoint',
  '   Vulnerability management ............... Qualys; critical SLA ≤7 days',
  '',
  '5. CRITICAL VENDORS',
  '   Microsoft 365 (IdP + productivity), AWS (IaaS), CrowdStrike (EDR),',
  '   Okta (workforce IdP), Twilio (notifications), Snowflake (analytics).',
  '',
  'Applicant attestation: Information is true and complete to the best of',
  'knowledge as of the submission date. Material changes will be notified.',
  'Signed: A. Reyes, CISO  |  Countersigned: Broker — Marsh Specialty',
].join('\n')

const ARCHITECTURE = [
  'SYSTEM & NETWORK ARCHITECTURE SUMMARY',
  'Brightcare Digital Health — Cyber underwriting exhibit',
  'Document ID: BC-ARCH-2026-Q3  |  Revision: 3.2  |  Dated: 2026-08-14',
  CONFIDENTIAL,
  '',
  '1. PURPOSE',
  '   High-level architecture for cyber underwriting review. Depicts trust',
  '   boundaries, identity planes, data stores holding ePHI, and recovery paths.',
  '',
  '2. TRUST BOUNDARIES',
  '   Internet → Cloudflare WAF / CDN → AWS ALB (TLS 1.2+) → EKS (prod)',
  '   Corporate: Zscaler ZPA + Okta SSO; legacy OpenVPN gateway (BOS-R1)',
  '   still present for one regional ops VLAN (remediation in flight).',
  '',
  '3. IDENTITY & ACCESS',
  '   Workforce IdP: Okta (OIDC/SAML). Privileged access: CyberArk PAM +',
  '   just-in-time roles. Break-glass accounts: offline escrow, quarterly test.',
  '   Customer IdP: optional SAML/OIDC federation; default Auth0 for B2B admins.',
  '',
  '4. APPLICATION TIERS (PROD)',
  '   Edge: Cloudflare → ALB → NGINX ingress',
  '   Compute: EKS (prod-a, prod-b) — microservices; no SSH from internet',
  '   Data: Aurora PostgreSQL (encrypted), ElastiCache Redis, S3 (SSE-KMS)',
  '   Analytics: Snowflake (separate account; ePHI minimized / tokenized)',
  '   Secrets: AWS Secrets Manager; no long-lived keys in CI artifacts',
  '',
  '5. SECURITY CONTROLS (IN-PATH)',
  '   EDR: CrowdStrike Falcon on servers + employee endpoints',
  '   Network: VPC segmentation; security groups least-privilege; GuardDuty',
  '   Email: Microsoft 365 + Proofpoint TAP',
  '   Logging: Central SIEM (Splunk Cloud); 365-day hot / 1-year cold',
  '',
  '6. BACKUP & DR TOPOLOGY',
  '   Continuous snapshot + daily immutable S3 Object Lock (Compliance mode)',
  '   Cross-region replica: us-west-2; RTO target 4h / RPO target 15m (Tier-1)',
  '   Last successful restore drill: 2026-06-12 (see DR Drill report)',
  '',
  '7. DATA CLASSIFICATION',
  '   ePHI / Restricted — Aurora + selected S3 buckets (customer-isolated keys)',
  '   Internal — engineering telemetry (no direct identifiers)',
  '   Public — marketing site only',
  '',
  '8. KNOWN ARCHITECTURE NOTE (UW RELEVANT)',
  '   Regional OpenVPN path (BOS-R1) does not yet challenge Okta MFA on all',
  '   admin groups. Compensating: IP allowlist + jump host. Target close: 2026-Q4.',
  '',
  'Prepared by: Platform Security  |  Reviewed by: CISO Office',
].join('\n')

const SOC_REPORT = [
  'SOC 2 TYPE II REPORT — SYSTEM DESCRIPTION & OPINION (EXCERPT)',
  'Service organization: Brightcare Digital Health, Inc.',
  'Report period: 2025-07-01 through 2026-06-30',
  'Trust Services Criteria: Security, Availability, Confidentiality',
  'Independent service auditor: Northline Assurance LLP (fictional demo firm)',
  'Report date: 2026-08-22',
  CONFIDENTIAL,
  '',
  'INDEPENDENT SERVICE AUDITOR’S REPORT (SUMMARY)',
  '   We have examined Brightcare’s description of its Care Coordination',
  '   Platform system and the suitability of design and operating effectiveness',
  '   of controls throughout the period. In our opinion, in all material',
  '   respects, based on the criteria described:',
  '   (a) the description fairly presents the system;',
  '   (b) controls were suitably designed;',
  '   (c) controls operated effectively to provide reasonable assurance that',
  '       the related TSC were achieved during the period.',
  '',
  '   Opinion: Unmodified (clean).',
  '',
  'SCOPE HIGHLIGHTS',
  '   In scope: production AWS environments, Okta workforce IdP integrations,',
  '   change management, logical access, encryption at rest/in transit,',
  '   monitoring/alerting, backup/restore procedures, vendor risk for critical',
  '   subprocessors (AWS, Okta, CrowdStrike, Microsoft).',
  '   Out of scope: corporate office Wi-Fi, marketing website CMS, Snowflake',
  '   analytics workloads without ePHI.',
  '',
  'CONTROL EXCEPTIONS / MANAGEMENT RESPONSES',
  '   EX-01  Logical access — lagged deprovision for 2 contractor accounts',
  '          (max 11 days). Management: automated Okta→HRIS sync completed',
  '          2026-05; retested with zero aged accounts in June sample.',
  '   EX-02  Change management — emergency change without CAB pre-approval',
  '          (1 of 42 sampled). Documented post-facto within 48h; no recurrence.',
  '',
  'COMPLEMENTARY USER ENTITY CONTROLS (CUECs)',
  '   Customers must: (1) manage their own workforce access to Brightcare;',
  '   (2) notify Brightcare of suspected account compromise; (3) configure',
  '   federation IdP policies consistent with their HIPAA obligations.',
  '',
  'SUBSERVICE ORGANIZATIONS',
  '   AWS — carve-out method; Brightcare monitors via Shared Responsibility',
  '   matrix and AWS Artifact SOC reports (reviewed annually).',
  '',
  'This excerpt is a demo underwriting package facsimile — not a live audit.',
].join('\n')

const INCIDENT_RESPONSE = [
  'INCIDENT RESPONSE PLAN',
  'Brightcare Digital Health — Information Security',
  'Policy ID: IS-IR-001  |  Version: 5.1  |  Effective: 2026-03-01',
  'Owner: CISO  |  Next tabletop: 2026-11',
  CONFIDENTIAL,
  '',
  '1. PURPOSE & SCOPE',
  '   Establish roles, severity criteria, containment, eradication, recovery,',
  '   and notification for security incidents affecting Brightcare systems,',
  '   data (including ePHI), and critical third parties.',
  '',
  '2. IR TEAM (ON-CALL ROTATION)',
  '   Incident Commander ........ Director, Security Operations',
  '   Technical Lead ............ Staff SRE / Platform',
  '   Comms Lead ................ VP, Customer Trust',
  '   Legal / Privacy ........... General Counsel + DPO',
  '   Executive Sponsor ......... CISO (escalate to CEO for Sev-1)',
  '   External retainers ........ CrowdStrike Services; Foley cyber counsel',
  '',
  '3. SEVERITY MATRIX',
  '   Sev-1  Confirmed ransomware / mass ePHI exfil / IdP takeover',
  '          → page within 15m; exec bridge; legal on first call',
  '   Sev-2  Targeted intrusion / material availability loss >1h',
  '   Sev-3  Contained malware / policy violation with limited blast radius',
  '   Sev-4  Suspicious activity requiring investigation only',
  '',
  '4. DETECTION SOURCES',
  '   CrowdStrike Falcon, Splunk correlation, GuardDuty, Okta risk signals,',
  '   Proofpoint, AWS CloudTrail anomalies, customer-reported abuse.',
  '',
  '5. RESPONSE PHASES',
  '   Identify → Contain (isolate host / revoke tokens / block IoCs) →',
  '   Eradicate → Recover (from immutable backups if needed) → Lessons learned',
  '   Evidence preserved under Legal hold; chain-of-custody logged in IR tool.',
  '',
  '6. NOTIFICATION TRIGGERS',
  '   HIPAA breach assessment within 24h of discovery; OCR / individual',
  '   notice per 45 CFR §164.404–408 when required. State AGs / multi-state',
  '   counsel as advised. Cyber insurer notified per policy conditions',
  '   (broker Marsh Specialty — hotline on binder). Customers under BAA:',
  '   contractual notice windows (typically 24–72h).',
  '',
  '7. RANSOMWARE PLAYBOOK (SUMMARY)',
  '   Do not pay without Legal + insurer approval. Preserve EDR telemetry.',
  '   Prefer restore from Object-Lock backups; dual-path rebuild runbook.',
  '   Credential reset for Okta + AWS root/break-glass after containment.',
  '',
  '8. TRAINING & EXERCISES',
  '   Annual tabletop (last: 2026-02-19). Technical restore drill linked to',
  '   DR program (last pass: 2026-06-12). Phishing simulations quarterly.',
  '',
  'Approved: CISO Office  |  Board Risk Committee informed (2026-Q1 packet)',
].join('\n')

const DR_DRILL = [
  'DISASTER RECOVERY DRILL REPORT',
  'Brightcare Digital Health — Business Continuity / ITDR',
  'Exercise ID: DR-2026-06-RESTORE  |  Date of exercise: 2026-06-12',
  'Report date: 2026-06-19  |  Classification: Internal / UW shareable',
  CONFIDENTIAL,
  '',
  '1. OBJECTIVES',
  '   Validate restore of Tier-1 Care Coordination API + Aurora primary from',
  '   immutable backups into isolated us-west-2 DR account. Measure RTO/RPO',
  '   against policy targets (RTO ≤ 4 hours; RPO ≤ 15 minutes).',
  '',
  '2. SCENARIO',
  '   Simulated ransomware encryption of prod EKS worker nodes and logical',
  '   corruption of primary Aurora writer. Assumed IdP still available (Okta).',
  '   No production customer traffic redirected (tabletop + technical restore).',
  '',
  '3. PARTICIPANTS',
  '   Incident Commander (Security), Platform SRE lead, DBA, Network eng,',
  '   Comms observer, Internal Audit observer (non-participating).',
  '',
  '4. RESULTS',
  '   Backup selected .............. S3 Object Lock snapshot 2026-06-12 06:12 UTC',
  '   Data integrity ............... Checksums matched; sample ePHI record OK',
  '   Application health ........... Smoke tests 42/42 passed in DR VPC',
  '   Measured RPO ................. ~8 minutes (ahead of 15m target)',
  '   Measured RTO ................. 3h 22m (within 4h target) — PASS',
  '   Immutable lock verified ...... Compliance-mode retention not bypassable',
  '',
  '5. ISSUES & REMEDIATIONS',
  '   I-1  Secrets Manager replication lag added ~18m. Fix: enable multi-region',
  '        replica for Tier-1 secrets (completed 2026-07-02).',
  '   I-2  Runbook step for Cloudflare DNS cutover was outdated. Fix: revised',
  '        IS-DR-RUN-004; re-validated in tabletop 2026-07-15.',
  '',
  '6. CONCLUSION',
  '   Exercise PASSED against published RTO/RPO. Next full drill scheduled',
  '   2026-12. Evidence artifacts retained in GRC vault (ticket BCM-4419).',
  '',
  'Signed: Director, Platform Reliability  |  Countersigned: CISO',
].join('\n')

const ISO_REPORT = [
  'ISO/IEC 27001:2022 — CERTIFICATION AUDIT REPORT (SUMMARY)',
  'Organization: Brightcare Digital Health, Inc.',
  'Certification body: Helix Certification Services (fictional demo CB)',
  'Certificate No.: HCS-ISMS-88421  |  Statement of Applicability: SoA v4.6',
  'Stage 2 audit dates: 2026-04-08 – 2026-04-11',
  'Certificate issued: 2026-05-02  |  Valid through: 2029-05-01',
  'Surveillance: annual  |  Next surveillance due: 2027-04',
  CONFIDENTIAL,
  '',
  '1. SCOPE OF ISMS',
  '   The Information Security Management System covering design, development,',
  '   operation, and support of the Brightcare Care Coordination Platform,',
  '   including AWS production accounts, corporate endpoints enrolled in MDM,',
  '   and supporting people/process controls at Boston HQ and remote workforce.',
  '',
  '2. AUDIT CONCLUSION',
  '   The ISMS is effectively implemented and maintained in accordance with',
  '   ISO/IEC 27001:2022. Recommendation: Certification granted.',
  '',
  '3. FINDINGS SUMMARY',
  '   Major nonconformities .......... 0',
  '   Minor nonconformities .......... 2',
  '   Opportunities for improvement .. 5',
  '',
  '   NC-M1  Supplier review cadence for one Tier-2 SaaS vendor exceeded',
  '          12-month policy by 47 days. CAPA closed 2026-05-20.',
  '   NC-M2  Physical access log sampling at HQ lobby incomplete for one',
  '          weekend. Process updated; badge system alert enabled.',
  '',
  '4. ANNEX A THEMES REVIEWED (SAMPLE)',
  '   A.5 Organizational controls — roles, threat intel, segregation of duties',
  '   A.8 Technological — malware, logging, crypto, secure development',
  '   A.5.23 Cloud services — shared responsibility & configuration baselines',
  '',
  '5. STATEMENT FOR UNDERWRITERS',
  '   Certificate and SoA available on request. This summary is a demo package',
  '   facsimile aligned to Brightcare’s attested control environment.',
].join('\n')

const COMPLIANCE_CERTS = [
  'COMPLIANCE CERTIFICATIONS & ATTESTATIONS PACKET',
  'Brightcare Digital Health, Inc.',
  'Packet ID: BC-COMP-2026-09  |  Assembled: 2026-09-10',
  CONFIDENTIAL,
  '',
  'A. HIPAA — COVERED ENTITY / BUSINESS ASSOCIATE POSTURE',
  '   Role: Business Associate to covered-entity customers',
  '   BAAs: Standard BAA executed with all ePHI-processing customers',
  '   Risk analysis: Last enterprise HIPAA security risk analysis 2026-01-28',
  '   Workforce training: Annual HIPAA + security awareness (98% completion)',
  '   Breach history (5y): None reportable under HIPAA breach rule',
  '   Exhibit: “HIPAA Compliance Attestation — Brightcare CISO” (2026-08-01)',
  '',
  'B. ISO/IEC 27001:2022',
  '   Certificate No. HCS-ISMS-88421 (see ISO report exhibit)',
  '   Valid: 2026-05-02 → 2029-05-01',
  '',
  'C. SOC 2 TYPE II',
  '   Period: 2025-07-01 → 2026-06-30; unmodified opinion (see SOC exhibit)',
  '',
  'D. ADDITIONAL',
  '   HITRUST CSF ........ Self-assessment in progress (target: 2027-H1)',
  '   GDPR .............. DPA + SCCs for EEA customers; DPO appointed',
  '   PCI DSS ........... Not in scope (no CHD stored; Stripe Checkout)',
  '',
  'E. INSURANCE / REGULATORY',
  '   Prior cyber policy: Admitted carrier; expiring 2026-09-30',
  '   No open regulatory inquiries disclosed as of packet date',
  '',
  'Prepared by: GRC Lead  |  Attested by: CISO, Brightcare Digital Health',
  'Broker copy: Marsh Specialty',
].join('\n')
