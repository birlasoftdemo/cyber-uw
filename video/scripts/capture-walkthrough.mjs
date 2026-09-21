/**
 * Capture product demo walkthrough screens at 1920×1080.
 * Requires: app at http://localhost:5174 (`npm run dev`) with DEV store hook.
 *
 * Usage (from repo root):
 *   node video/scripts/capture-walkthrough.mjs
 *
 * Uses window.__CUW_STORE__ (exposed in DEV) so mutations hit the same Zustand
 * instance the UI subscribes to — Vite dynamic imports alone create a duplicate.
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const playwrightPath = [
  '/tmp/node_modules/playwright/index.mjs',
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../node_modules/playwright/index.mjs'),
]
let chromium
for (const p of playwrightPath) {
  try {
    ;({ chromium } = await import(p))
    break
  } catch {
    /* try next */
  }
}
if (!chromium) {
  console.error('Install Playwright: npm i -D playwright && npx playwright install chromium')
  process.exit(1)
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../public/walkthrough')
const BASE = process.env.CYBER_UW_URL || 'http://localhost:5174'

async function shot(page, name) {
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(OUT, name), type: 'png' })
  console.log('✓', name)
}

async function nav(page, label) {
  await page.locator(`button[aria-label="${label}"]`).first().click({ force: true })
  await page.waitForTimeout(500)
}

async function login(page, email, password) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/password/i).fill(password)
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await page.locator('button[aria-label="Insights"]').first().waitFor({ timeout: 15000 })
  await page.waitForFunction(() => Boolean(window.__CUW_STORE__), null, { timeout: 10000 })
  await page.waitForTimeout(400)
}

/** Mutate the live UI store (not a Vite duplicate module). */
async function cuw(page, fnBody) {
  const result = await page.evaluate((body) => {
    const store = window.__CUW_STORE__
    if (!store) throw new Error('window.__CUW_STORE__ missing')
    const g = () => store.getState()
    return new Function('g', `return (${body})(g)`)(g)
  }, fnBody)
  await page.waitForTimeout(400)
  return result
}

async function logout(page) {
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /^sign in$/i }).waitFor({ timeout: 10000 })
}

async function captureOps(page) {
  await login(page, 'ops@cyber.internal', 'ops123')

  await nav(page, 'Insights')
  await shot(page, '02-ops-insights.png')

  await nav(page, 'Manage Submissions')
  await page.getByRole('tab', { name: /Shared/i }).click().catch(() => {})
  await page.waitForTimeout(400)
  await shot(page, '03-manage-submissions.png')

  await page.getByRole('tab', { name: /Templates/i }).click()
  await page.waitForTimeout(400)
  await shot(page, '04-templates.png')

  await page.getByRole('button', { name: /Create template/i }).click()
  await page.waitForTimeout(700)
  await page.getByPlaceholder(/Northwind Analytics/i).fill('Meridian Logistics')
  await page.getByPlaceholder(/Meridian Risk Brokers/i).fill('Meridian Ops Desk')
  const moduleButtons = page
    .locator('section')
    .filter({ hasText: /Modules for this broker/i })
    .locator('button')
  const modCount = await moduleButtons.count()
  for (let i = 0; i < Math.min(modCount, 6); i++) {
    await moduleButtons.nth(i).click().catch(() => {})
  }
  await shot(page, '11-ops-module-builder.png')

  const sendForm = page.getByRole('button', { name: /Send form/i })
  if (await sendForm.isEnabled().catch(() => false)) {
    await sendForm.click()
    await page.waitForTimeout(800)
  } else {
    await page.getByRole('button', { name: /^Back$/i }).click().catch(() => {})
  }

  await nav(page, 'Manage Submissions')
  await page.getByRole('tab', { name: /Shared/i }).click().catch(() => {})
  await page.waitForTimeout(400)
  await shot(page, '12-ops-returned-and-ship.png')

  // Meridian ops desk — clear gaps, Ready for UW
  const mid = await cuw(
    page,
    `g => {
      const id = g().createSubmission({
        insured: 'Meridian Logistics',
        broker: 'Meridian Ops Desk',
        sector: 'Logistics',
        limitRequestedUsd: 7500000,
        fileNames: ['Meridian_Partial_Cyber_App.pdf', 'Meridian_Broker_cover_email.pdf'],
        demoPackage: 'ops',
      })
      const c = g().cases.find(x => x.id === id)
      for (const gap of [...c.gaps]) if (gap.disposition === 'open') g().resolveGap(id, gap.id)
      if (g().cases.find(x => x.id === id).completenessPct < 80) g().markPackageComplete(id)
      g().selectCase(id)
      return id
    }`,
  )
  console.log('  Meridian case', mid)
  await nav(page, 'Decision Desk')
  await page.waitForTimeout(600)
  await shot(page, '13-ops-proceed-closure-desk.png')
  await shot(page, '06-ops-decision-desk-feedback.png')

  const ready = page.getByRole('button', { name: /Ready for UW/i })
  if (await ready.isVisible()) {
    await ready.click()
    await page.waitForTimeout(800)
  }
  await shot(page, '14-ops-uw-handoff.png')

  await nav(page, 'Referral Inbox')
  await shot(page, '05-referral-inbox.png')

  await logout(page)
}

async function captureCyber(page) {
  await login(page, 'uw@cyber.internal', 'uw123')

  await nav(page, 'Insights')
  await shot(page, '15-uw-insights.png')

  await page.getByRole('button', { name: /Gap-blocked backlog/i }).click()
  await page.waitForTimeout(600)
  await shot(page, '16-uw-gap-backlog-drill.png')

  await page
    .locator('tr')
    .filter({ hasText: /Northwind Health Systems/i })
    .getByRole('button', { name: /^Open$/i })
    .click()
  await page.waitForTimeout(900)
  await shot(page, '07-uw-decision-desk.png')

  await page.getByText(/MFA on external admin/i).first().scrollIntoViewIfNeeded()
  await shot(page, '08-uw-feedback-ideal-detected.png')

  // New completed · Feedback → Review Risk (sign-offs)
  await cuw(
    page,
    `g => {
      g().resolveGap('CYB-2401', 'g1')
      g().resolveGap('CYB-2401', 'g3')
      g().setWorkflowStage('CYB-2401', 2)
      g().selectCase('CYB-2401')
      return g().cases.find(x => x.id === 'CYB-2401').workflowStage
    }`,
  )
  await page.getByRole('heading', { name: /^Review Risk$/i }).first().scrollIntoViewIfNeeded()
  await shot(page, '17-uw-review-risk.png')

  await cuw(
    page,
    `g => {
      for (const id of ['thr-mfa-vpn','thr-idp-blast','imp-ransom-bi','imp-phi-reg','imp-mfa-floor']) {
        g().signRiskItem('CYB-2401', id, 'accepted')
      }
      g().setWorkflowStage('CYB-2401', 3)
      return 3
    }`,
  )
  await page.getByRole('heading', { name: /^Review Platform$/i }).first().scrollIntoViewIfNeeded()
  await shot(page, '18-uw-review-platform.png')

  await cuw(
    page,
    `g => {
      const c = g().cases.find(x => x.id === 'CYB-2401')
      for (const card of c.platformCards) g().signPlatformCard('CYB-2401', card.id, 'watch')
      g().setWorkflowStage('CYB-2401', 4)
      return c.platformCards.map(p => p.signOff)
    }`,
  )
  await page.getByRole('heading', { name: /^Review Platform$/i }).first().scrollIntoViewIfNeeded()
  await shot(page, '18b-uw-review-platform-signed.png')

  await cuw(
    page,
    `g => {
      const c = g().cases.find(x => x.id === 'CYB-2401')
      g().setWorkflowStage('CYB-2401', 4)
      g().saveFinancialSignOff('CYB-2401', {
        limitUsd: c.limitRequestedUsd,
        sirUsd: 100000,
        pricingTier: 3,
        stubPremiumUsd: 120000,
        managerCosign: true,
        cosignReason: 'Demo walkthrough — Northwind over junior authority band',
        withinAuthority: false,
      })
      return !!g().cases.find(x => x.id === 'CYB-2401').financialSignOff?.signedOffAt
    }`,
  )
  await page.getByRole('heading', { name: /^Closure$/i }).first().scrollIntoViewIfNeeded()
  await shot(page, '09-uw-closure.png')

  await nav(page, 'Referrals')
  await shot(page, '10-uw-referrals.png')
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

try {
  console.log('Capturing Ops arc…')
  await captureOps(page)
  console.log('Capturing Cyber UW arc…')
  await captureCyber(page)
  console.log('Done →', OUT)
} catch (err) {
  console.error(err)
  await page.screenshot({ path: path.join(OUT, '_capture-error.png') }).catch(() => {})
  process.exitCode = 1
} finally {
  await browser.close()
}
