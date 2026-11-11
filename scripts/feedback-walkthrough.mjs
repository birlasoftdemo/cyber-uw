/**
 * Headless click-through of the cyber UW demo after the client feedback pass.
 * Run with the Vite dev server on http://127.0.0.1:5173
 *   node scripts/feedback-walkthrough.mjs
 */
import { chromium } from 'playwright'
import { mkdir, copyFile } from 'node:fs/promises'
import path from 'node:path'

const BASE = process.env.CYBER_UW_URL ?? 'http://127.0.0.1:5173'
const SHOTS = path.resolve('docs/feedback-screenshots')
const ARTIFACTS = '/opt/cursor/artifacts'
const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'laptop', width: 1280, height: 800 },
]

const results = []

function record(id, pass, detail) {
  results.push({ id, pass, detail })
  const mark = pass ? 'PASS' : 'FAIL'
  console.log(`${mark}  ${id}  ${detail}`)
}

async function shot(page, name) {
  const file = path.join(SHOTS, `${name}.png`)
  await page.screenshot({ path: file, fullPage: false })
  await copyFile(file, path.join(ARTIFACTS, `${name}.png`)).catch(() => {})
  return file
}

async function shotLocator(locator, name) {
  const file = path.join(SHOTS, `${name}.png`)
  await locator.screenshot({ path: file })
  await copyFile(file, path.join(ARTIFACTS, `${name}.png`)).catch(() => {})
}

function attachMonitors(page, bucket) {
  page.on('pageerror', (error) => {
    bucket.pageErrors.push(String(error))
  })
  page.on('console', (msg) => {
    if (msg.type() === 'error') bucket.consoleErrors.push(msg.text())
  })
  page.on('requestfailed', (request) => {
    const url = request.url()
    if (url.startsWith('data:')) return
    bucket.failed.push(`${request.failure()?.errorText ?? 'failed'} ${url}`)
  })
  page.on('response', (response) => {
    const url = response.url()
    if (response.status() >= 400 && url.startsWith(BASE)) {
      bucket.http.push(`${response.status()} ${url}`)
    }
  })
}

async function login(page, email, password) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.locator('input[type="email"]').fill(email)
  await page.locator('input[type="password"]').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('heading', { name: 'Open cases' }).waitFor({ timeout: 15000 })
}

async function nav(page, name) {
  const button = page.locator('aside > nav').getByRole('button', { name, exact: true })
  await button.evaluate((element) => element.click())
}

async function openCase(page, insured) {
  const back = page.getByRole('button', { name: 'Open cases' })
  if (await back.isVisible().catch(() => false)) {
    await back.click()
    await page.getByRole('heading', { name: 'Open cases' }).waitFor()
  }
  await page.getByRole('row').filter({ hasText: insured }).click()
  await page.locator('#cuw-case-header').waitFor()
  await page.getByRole('tab', { name: 'Submission Workbench' }).click()
}

async function overflow(page) {
  return page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
}

async function main() {
  await mkdir(SHOTS, { recursive: true })
  await mkdir(ARTIFACTS, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const bucket = { pageErrors: [], consoleErrors: [], failed: [], http: [] }

  try {
    const page = await browser.newPage({ viewport: VIEWPORTS[0] })
    attachMonitors(page, bucket)

    await page.goto(`${BASE}/broker`, { waitUntil: 'networkidle' })
    await shot(page, 'broker-form')
    record('broker-route', (await page.locator('body').innerText()).length > 40, 'broker preview rendered')

    await login(page, 'uw@cyber.internal', 'uw123')
    await shot(page, 'open-cases')
    record('login-uw', true, 'underwriter reached Open cases')

    await page.getByRole('button', { name: 'New Submission' }).click()
    await page.getByRole('heading', { name: 'New Submission' }).waitFor()
    await shot(page, 'new-submission-modal')
    await page.getByRole('button', { name: 'Cancel' }).click()
    await page.getByRole('heading', { name: 'New Submission' }).waitFor({ state: 'hidden' })
    record('new-submission-modal', true, 'modal opened and closed')

    await nav(page, 'Insights')
    await page.getByText('Cyber Insurance Overview').first().waitFor({ timeout: 10000 }).catch(() => {})
    await shot(page, 'insights')
    record('insights', await page.locator('body').innerText().then((t) => t.includes('Cyber') || t.length > 80), 'insights opened')

    await nav(page, 'Escalations')
    await shot(page, 'escalations')
    record('escalations', (await page.locator('body').innerText()).length > 20, 'escalations opened')

    await nav(page, 'Cases')
    await page.getByRole('heading', { name: 'Open cases' }).waitFor()

    const cases = [
      {
        insured: 'Airbnb',
        industry: 'Travel / Hospitality Marketplace',
        revenue: '$11B',
        limit: '$25M',
        appetite: 'Refer',
        completeness: '92%',
      },
      {
        insured: 'LumenForge Software',
        industry: 'Technology / SaaS',
        revenue: '$85M',
        limit: '$5M',
        appetite: 'Within Appetite',
        completeness: '100%',
      },
      {
        insured: 'Harbor Retail Group',
        industry: 'Retail',
        revenue: '$210M',
        limit: '$15M',
        appetite: 'Decline',
        completeness: '74%',
      },
      {
        insured: 'Cascade Logistics',
        industry: 'Logistics',
        revenue: '$160M',
        limit: '$5M',
        appetite: 'Refer',
        completeness: '88%',
      },
    ]

    for (const item of cases) {
      await openCase(page, item.insured)
      const header = page.locator('#cuw-case-header')
      const text = await header.innerText()
      const folded = text.toLowerCase()
      const ok =
        folded.includes(item.insured.toLowerCase()) &&
        folded.includes(item.industry.toLowerCase()) &&
        text.includes(item.revenue) &&
        text.includes(item.limit) &&
        folded.includes(item.appetite.toLowerCase()) &&
        text.includes(item.completeness) &&
        folded.includes('cyber risk')
      record(`header-${item.insured}`, ok, text.replaceAll('\n', ' | ').slice(0, 280))
      await shotLocator(header, `header-${item.insured.toLowerCase().replace(/\s+/g, '-')}`)
    }

    await openCase(page, 'Airbnb')
    const workbench = page.locator('#cuw-workbench-root')
    await workbench.locator('#submission-intake').scrollIntoViewIfNeeded()
    const intake = await workbench.locator('#submission-intake').innerText()
    const intakeDocs = ['Cyber Application', 'InfoSec Questionnaire', 'Incident Response Plan', 'Loss Runs', 'Broker Correspondence']
    const intakeFold = intake.toLowerCase()
    record(
      'intake-documents',
      intakeDocs.every((doc) => intake.includes(doc)) &&
        ['Classified', 'Extracted', 'Missing', 'Review Required'].every((status) => intake.includes(status)),
      'five documents and the statuses used on this file',
    )
    record(
      'intake-counts',
      intake.includes('92%') && intakeFold.includes('missing documents') && intakeFold.includes('broker follow-up'),
      intake.split('\n').slice(0, 12).join(' | '),
    )
    const missingCell = await workbench.locator('#submission-intake .cuw-intake-stats div').nth(1).innerText()
    const followCell = await workbench.locator('#submission-intake .cuw-intake-stats div').nth(2).innerText()
    record('intake-missing-count', missingCell.includes('1'), missingCell.replaceAll('\n', ' '))
    record('intake-followup-count', followCell.includes('2'), followCell.replaceAll('\n', ' '))
    record(
      'entity-match',
      intake.includes('Insured matched') &&
        intake.includes('Duplicate check completed') &&
        intake.includes('Broker identified') &&
        intake.includes('Marsh Specialty'),
      'entity match lines present',
    )
    await shotLocator(workbench.locator('#submission-intake'), 'airbnb-submission-intake')

    const evidence = workbench.locator('#evidence-verification')
    await evidence.scrollIntoViewIfNeeded()
    const evidenceText = await evidence.innerText()
    const controls = ['MFA', 'EDR', 'Backups', 'Privileged access', 'Patching', 'Incident response']
    const verify = ['Verified', 'Partially Verified', 'Contradicted', 'Missing Evidence']
    const evidenceFold = evidenceText.toLowerCase()
    record(
      'evidence-controls',
      controls.every((name) => evidenceText.includes(name)) &&
        ['applicant declaration', 'document evidence', 'external observation', 'verification result', 'confidence'].every((col) => evidenceFold.includes(col)),
      'control columns present',
    )
    record(
      'evidence-statuses',
      verify.every((status) => evidenceText.includes(status)),
      verify.filter((status) => evidenceText.includes(status)).join(', '),
    )
    record(
      'mfa-contradiction',
      evidenceText.includes('MFA applies to all users') &&
        evidenceText.includes('privileged users only') &&
        evidenceText.includes('Contradicted'),
      'MFA all-users vs privileged-only contradiction',
    )
    await shotLocator(evidence, 'airbnb-evidence-verification')

    const external = workbench.locator('#external-enrichment')
    await external.scrollIntoViewIfNeeded()
    const externalText = await external.innerText()
    const categories = ['Attack Surface', 'Vulnerabilities/CVEs', 'Security Rating', 'Exposed Services', 'Third-party Dependencies']
    const findingCols = ['Source', 'Finding', 'Severity', 'Observed Date', 'Freshness', 'Entity Match', 'Underwriting Impact']
    const externalFold = externalText.toLowerCase()
    record(
      'external-categories',
      categories.every((name) => externalText.includes(name)) &&
        findingCols.every((col) => externalFold.includes(col.toLowerCase())),
      'categories and columns',
    )
    record(
      'external-simulated',
      externalText.includes('Simulated') && externalText.includes('BitSight (Simulated)'),
      'providers marked simulated',
    )
    record(
      'external-conflict',
      externalText.includes('Conflicts with applicant declarations') &&
        externalText.includes('MFA applies to all users') &&
        externalText.includes('privileged users only'),
      'declaration conflict called out',
    )
    record(
      'rating-trend',
      externalText.includes('Security rating trend') && externalText.includes('12 months'),
      'trend shown with the rating',
    )
    const ratingLine = externalText.split('\n').find((line) => line.includes('Latest simulated rating')) ?? ''
    const ratingMatch = ratingLine.match(/rating (\d+)/)
    record('rating-number', Boolean(ratingMatch), ratingLine || 'rating line missing')
    await shotLocator(external, 'airbnb-external-findings')
    await shotLocator(external.locator('.cuw-conflict'), 'airbnb-declaration-conflict')
    await shotLocator(external.locator('.cuw-trend'), 'airbnb-rating-trend')

    const measures = workbench.locator('#underwriting-measures')
    await measures.scrollIntoViewIfNeeded()
    const measuresText = await measures.innerText()
    const measuresFold = measuresText.toLowerCase()
    record(
      'separate-measures',
      ['cyber risk', 'control effectiveness', 'evidence confidence', 'submission completeness', 'appetite result'].every((label) => measuresFold.includes(label)) &&
        measuresText.includes('Refer') &&
        measuresText.includes('92%'),
      'five measures visible',
    )
    record(
      'referral-rules',
      measuresText.includes('MFA coverage below minimum threshold') &&
        measuresText.includes('Security rating below carrier appetite level'),
      'both referral rules named',
    )
    const whyButtons = measures.getByRole('button', { name: 'Why this result?' })
    record('why-count', (await whyButtons.count()) === 5, `why buttons: ${await whyButtons.count()}`)
    await whyButtons.nth(0).click()
    const whyText = await measures.innerText()
    const whyHasRating = ratingMatch ? whyText.includes(ratingMatch[1]) : false
    record('why-opens', whyText.includes('not an average') && whyHasRating, 'cyber risk why cites the same rating')
    await shotLocator(measures, 'airbnb-underwriting-measures')

    const decision = workbench.locator('#uw-decision')
    await decision.scrollIntoViewIfNeeded()
    const decisionText = await decision.innerText()
    record(
      'ai-recommendation',
      decisionText.includes('AI recommendation') && decisionText.includes('Refer'),
      'AI recommendation is Refer',
    )
    record('ai-reasons', (decisionText.match(/Reason /g) ?? []).length === 3, 'three reasons')
    record(
      'reason-links',
      (await decision.locator('a[href="#evidence-control-mfa"]').count()) === 1 &&
        (await decision.locator('a[href="#appetite-rule-CTRL-MFA-MIN"]').count()) === 1 &&
        (await decision.locator('a[href="#external-finding-security-rating"]').count()) === 1,
      'reasons link to evidence, rule, and rating',
    )
    record(
      'human-controls',
      ['Approve decision', 'Refer decision', 'Request Information decision', 'Decline decision'].every(async () => true) &&
        (await decision.getByRole('button', { name: 'Approve decision' }).count()) === 1 &&
        (await decision.getByRole('button', { name: 'Refer decision' }).count()) === 1 &&
        (await decision.getByRole('button', { name: 'Request Information decision' }).count()) === 1 &&
        (await decision.getByRole('button', { name: 'Decline decision' }).count()) === 1,
      'four human decisions',
    )
    record(
      'authority-owner',
      decisionText.includes('Exceeds delegated authority') && decisionText.includes('Priya Nair'),
      'referral owner shown',
    )
    const approve = decision.getByRole('button', { name: 'Approve decision' })
    record('approve-gated', await approve.isDisabled(), 'Approve waits for financial sign off')
    await shotLocator(decision, 'airbnb-underwriter-decision')

    await decision.locator('a[href="#evidence-control-mfa"]').click()
    await page.waitForTimeout(400)
    const mfaBox = await page.locator('#evidence-control-mfa').boundingBox()
    record('reason-navigates', Boolean(mfaBox), 'MFA evidence row is in the layout')

    await decision.scrollIntoViewIfNeeded()
    await decision.getByRole('button', { name: 'Refer decision' }).click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    const acceptConfirm = dialog.getByRole('button', { name: 'Confirm decision' })
    record('matching-decision-open', await acceptConfirm.isEnabled(), 'Refer matches AI, confirm is enabled without rationale')
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await dialog.waitFor({ state: 'hidden' })

    await decision.getByRole('button', { name: 'Request Information decision' }).click()
    await dialog.waitFor()
    const overrideConfirm = dialog.getByRole('button', { name: 'Confirm decision' })
    const blockedBefore = await overrideConfirm.isDisabled()
    await overrideConfirm.click({ force: true })
    const stillOpen = await dialog.isVisible()
    await dialog.locator('#decision-rationale').fill('Broker must confirm MFA scope before this file can move. Override of the Refer recommendation.')
    const enabledAfter = await overrideConfirm.isEnabled()
    await shot(page, 'airbnb-rationale-required')
    await overrideConfirm.click()
    await dialog.waitFor({ state: 'hidden' })
    await page.getByText('UW decision locked: Request Information.').waitFor({ timeout: 8000 })
    const recorded = await page.locator('#uw-decision').innerText()
    record(
      'override-rationale-blocks',
      blockedBefore && stillOpen && enabledAfter && recorded.includes('Broker must confirm MFA scope'),
      `blocked=${blockedBefore} stayedOpen=${stillOpen} enabledAfter=${enabledAfter}`,
    )
    await shotLocator(page.locator('#uw-decision'), 'airbnb-decision-recorded')

    await page.getByRole('button', { name: 'Open cases' }).click()
    await openCase(page, 'LumenForge Software')
    const lumenDecision = await page.locator('#uw-decision').innerText()
    record(
      'lumen-within-authority',
      lumenDecision.includes('AI recommendation') &&
        lumenDecision.includes('Approve') &&
        lumenDecision.includes('Inside delegated authority') &&
        lumenDecision.includes('James Park'),
      'clean case stays Approve and inside authority',
    )
    await shotLocator(page.locator('#uw-decision'), 'lumenforge-decision')

    await page.getByRole('button', { name: 'Open cases' }).click()
    await openCase(page, 'Harbor Retail Group')
    const harborIntake = await page.locator('#submission-intake').innerText()
    record('intake-received-status', harborIntake.includes('Received'), 'Harbor broker correspondence is Received')
    const harborEvidence = await page.locator('#evidence-verification').innerText()
    record('not-applicable-status', harborEvidence.includes('Not Applicable'), 'Harbor privileged access is Not Applicable')
    await shotLocator(page.locator('#submission-intake'), 'harbor-submission-intake')
    await shotLocator(page.locator('#evidence-verification'), 'harbor-evidence')

    await page.getByRole('button', { name: 'Open cases' }).click()
    await openCase(page, 'Cascade Logistics')
    await shotLocator(page.locator('#underwriting-measures'), 'cascade-measures')

    await page.getByRole('tab', { name: 'Birlasoft Customer Insights' }).click()
    await page.locator('#cuw-case-header').waitFor()
    await shot(page, 'customer-insights-with-header')
    record(
      'header-persists-insights',
      (await page.locator('#cuw-case-header').innerText()).includes('Cascade Logistics'),
      'header remains on customer insights',
    )

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.getByRole('tab', { name: 'Submission Workbench' }).click()
      await page.locator('#cuw-case-header').scrollIntoViewIfNeeded()
      const box = await overflow(page)
      record(
        `layout-${viewport.name}`,
        box.scrollWidth <= box.clientWidth + 1,
        `scrollWidth ${box.scrollWidth} clientWidth ${box.clientWidth}`,
      )
      await shot(page, `layout-${viewport.name}-header`)
    }

    await page.setViewportSize({ width: 1440, height: 900 })
    await page.getByRole('button', { name: 'Open cases' }).click()
    const userMenu = page.getByRole('button', { name: /James Park|Account|User/i }).first()
    if (await userMenu.count()) {
      await userMenu.click().catch(() => {})
    }
    const logout = page.getByRole('menuitem', { name: 'Log out' }).or(page.getByRole('button', { name: 'Log out' }))
    if (await logout.first().isVisible().catch(() => false)) {
      await logout.first().click()
    } else {
      await page.evaluate(() => sessionStorage.removeItem('cyber-uw-auth-session'))
      await page.goto(BASE)
    }
    await page.locator('input[type="email"]').waitFor()
    await login(page, 'ops@cyber.internal', 'ops123')
    await nav(page, 'Manage Submissions')
    await shot(page, 'manage-submissions')
    record('ops-manage-submissions', (await page.locator('body').innerText()).length > 40, 'ops shipping desk opened')
    await nav(page, 'Cases')
    await openCase(page, 'Airbnb')
    const opsText = await page.locator('#cuw-workbench-root').innerText()
    record(
      'ops-evidence-locked',
      opsText.includes('Evidence Verification') && opsText.includes('UW only'),
      'ops still cannot edit UW stages',
    )
    await shot(page, 'ops-case')

    const noisy = (line) =>
      /favicon|Download the React DevTools|ResizeObserver loop/i.test(line)
    const pageErrors = bucket.pageErrors.filter((line) => !noisy(line))
    const consoleErrors = bucket.consoleErrors.filter((line) => !noisy(line))
    const failed = bucket.failed.filter((line) => !noisy(line) && !line.includes('net::ERR_ABORTED'))
    record('console-errors', pageErrors.length === 0 && consoleErrors.length === 0, [...pageErrors, ...consoleErrors].slice(0, 5).join(' || ') || 'none')
    record('failed-requests', failed.length === 0 && bucket.http.length === 0, [...failed, ...bucket.http].slice(0, 5).join(' || ') || 'none')
  } finally {
    await browser.close()
  }

  const failed = results.filter((item) => !item.pass)
  console.log(`\n${results.length - failed.length}/${results.length} passed`)
  if (failed.length) {
    console.log(JSON.stringify(failed, null, 2))
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
