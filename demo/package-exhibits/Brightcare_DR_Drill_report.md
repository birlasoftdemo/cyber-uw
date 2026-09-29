---
title: Brightcare_DR_Drill_report.pdf
kind: Disaster Recovery Drill report
insured: Brightcare Digital Health
status: demo-facsimile
---

```
DISASTER RECOVERY DRILL REPORT
Brightcare Digital Health — Business Continuity / ITDR
Exercise ID: DR-2026-06-RESTORE  |  Date of exercise: 2026-06-12
Report date: 2026-06-19  |  Classification: Internal / UW shareable
CONFIDENTIAL — For underwriting and broker use only. Not for redistribution.

1. OBJECTIVES
   Validate restore of Tier-1 Care Coordination API + Aurora primary from
   immutable backups into isolated us-west-2 DR account. Measure RTO/RPO
   against policy targets (RTO ≤ 4 hours; RPO ≤ 15 minutes).

2. SCENARIO
   Simulated ransomware encryption of prod EKS worker nodes and logical
   corruption of primary Aurora writer. Assumed IdP still available (Okta).
   No production customer traffic redirected (tabletop + technical restore).

3. PARTICIPANTS
   Incident Commander (Security), Platform SRE lead, DBA, Network eng,
   Comms observer, Internal Audit observer (non-participating).

4. RESULTS
   Backup selected .............. S3 Object Lock snapshot 2026-06-12 06:12 UTC
   Data integrity ............... Checksums matched; sample ePHI record OK
   Application health ........... Smoke tests 42/42 passed in DR VPC
   Measured RPO ................. ~8 minutes (ahead of 15m target)
   Measured RTO ................. 3h 22m (within 4h target) — PASS
   Immutable lock verified ...... Compliance-mode retention not bypassable

5. ISSUES & REMEDIATIONS
   I-1  Secrets Manager replication lag added ~18m. Fix: enable multi-region
        replica for Tier-1 secrets (completed 2026-07-02).
   I-2  Runbook step for Cloudflare DNS cutover was outdated. Fix: revised
        IS-DR-RUN-004; re-validated in tabletop 2026-07-15.

6. CONCLUSION
   Exercise PASSED against published RTO/RPO. Next full drill scheduled
   2026-12. Evidence artifacts retained in GRC vault (ticket BCM-4419).

Signed: Director, Platform Reliability  |  Countersigned: CISO
```
