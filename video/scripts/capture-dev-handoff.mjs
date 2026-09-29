/**
 * Capture UW persona /dev handoff walkthrough screens at 1920×1080.
 * Requires: app at http://localhost:5173 (or set CYBER_UW_URL).
 *
 * Usage (from repo root or video/):
 *   node video/scripts/capture-dev-handoff.mjs
 *
 * Uses window.__CUW_STORE__ (DEV) so mutations hit the same Zustand instance the UI uses.
 * Case walkthrough: Brightcare Digital Health (demoPackage: 'uw').
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const playwrightPath = [
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../node_modules/playwright/index.mjs'),
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../node_modules/playwright/index.mjs'),
  '/tmp/node_modules/playwright/index.mjs',
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
const OUT = path.resolve(__dirname, '../public/handoff')
const BASE = process.env.CYBER_UW_URL || 'http://localhost:5173'

fs.mkdirSync(OUT, { recursive: true })

async function shot(page, name) {
  await page.waitForTimeout(450)
  await page.screenshot({ path: path.join(OUT, name), type: 'png' })
  console.log('✓', name)
}

async function nav(page, label) {
  await page.locator(`button[aria-label="${label}"]`).first().click({ force: true })
  await page.waitForTimeout(500)
}

async function cuw(page, fnBody) {
  const result = await page.evaluate((body) => {
    const store = window.__CUW_STORE__
    if (!store) throw new Error('window.__CUW_STORE__ missing')
    const g = () => store.getState()
    return new Function('g', `return (${body})(g)`)(g)
  }, fnBody)
  await page.waitForTimeout(450)
  return result
}

async function scrollCasePaneBottom(page) {
  await page.evaluate(() => {
    const el = document.querySelector('.cuw-case-shell__pane')
    if (el) el.scrollTop = el.scrollHeight
  })
  await page.waitForTimeout(400)
}

async function captureLogin(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.evaluate(() => sessionStorage.clear())
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: /^sign in$/i }).waitFor({ timeout: 15000 })
  await shot(page, '01-login.png')
}

async function loginUw(page) {
  await page.getByLabel(/email/i).fill('uw@cyber.internal')
  await page.getByLabel(/password/i).fill('uw123')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await page.locator('button[aria-label="Cases"]').first().waitFor({ timeout: 15000 })
  await page.waitForFunction(() => Boolean(window.__CUW_STORE__), null, { timeout: 10000 })
  await page.waitForTimeout(400)
}

async function captureHandoff(page) {
  await captureLogin(page)
  await loginUw(page)

  await nav(page, 'Cases')
  await cuw(page, `g => { g().clearCaseSelection(); return null }`)
  await page.getByRole('heading', { name: /Open cases/i }).waitFor({ timeout: 8000 }).catch(() => {})
  await shot(page, '02-open-cases.png')

  await page.getByRole('button', { name: /New Submission/i }).first().click()
  await page.getByRole('heading', { name: /New Submission/i }).waitFor({ timeout: 8000 })
  await page.waitForTimeout(500)
  await shot(page, '03-new-submission.png')

  await page.getByRole('button', { name: /^Cancel$/i }).click().catch(() => {})
  await page.waitForTimeout(300)

  const caseId = await cuw(
    page,
    `g => {
      const id = g().createSubmission({
        insured: 'Brightcare Digital Health',
        broker: 'Marsh Specialty',
        sector: 'Healthcare',
        limitRequestedUsd: 5000000,
        fileNames: [
          'Brightcare_Cyber_Application_2026.pdf',
          'Brightcare_Architecture.pdf',
          'Brightcare_SOC2_TypeII.pdf',
          'Brightcare_Incident_Response_Plan.pdf',
          'Brightcare_DR_Drill_report.pdf',
          'Brightcare_ISO27001_report.pdf',
          'Brightcare_HIPAA_compliance_cert.pdf',
        ],
        demoPackage: 'uw',
      })
      g().selectCase(id)
      g().showCustomer360(id)
      return id
    }`,
  )
  console.log('  Brightcare case', caseId)

  await page.getByRole('tab', { name: /Customer Insights/i }).waitFor({ timeout: 10000 })
  await page.locator('#cuw-c360-root').waitFor({ timeout: 8000 })
  await shot(page, '04-customer-360.png')
  await scrollCasePaneBottom(page)
  await shot(page, '05-float-c360.png')

  await page.getByRole('tab', { name: /Submission Workbench/i }).click()
  await page.waitForTimeout(700)
  await page.getByRole('heading', { name: /Policy Documents/i }).first().waitFor({ timeout: 8000 })
  await scrollCasePaneBottom(page)
  await shot(page, '05b-float-docs-complete.png')
  await page.evaluate(() => {
    document.getElementById('cuw-stage-0')?.scrollIntoView({ block: 'start' })
  })
  await page.waitForTimeout(400)
  await shot(page, '06-policy-documents.png')

  await cuw(
    page,
    `g => {
      const id = ${JSON.stringify(caseId)}
      g().signOffPackage(id)
      g().setWorkflowStage(id, 1)
      return !!g().cases.find(c => c.id === id)?.packageSignOff?.signedOffAt
    }`,
  )
  await page.getByRole('heading', { name: /Risk Information/i }).first().waitFor({ timeout: 8000 })
  await page.evaluate(() => {
    document.getElementById('cuw-stage-1')?.scrollIntoView({ block: 'start' })
  })
  await page.waitForTimeout(400)
  await shot(page, '07-risk-information.png')

  await cuw(
    page,
    `g => {
      const id = ${JSON.stringify(caseId)}
      const required = [
        id + '-triage-elig',
        id + '-triage-hipaa',
        id + '-triage-mfa',
        id + '-triage-loss',
      ]
      g().signRiskItems(id, required, 'accepted', 'Handoff walkthrough — desk reviewed')
      g().setWorkflowStage(id, 1)
      return 1
    }`,
  )
  await scrollCasePaneBottom(page)
  await shot(page, '07b-float-continue-risk.png')

  await cuw(
    page,
    `g => {
      const id = ${JSON.stringify(caseId)}
      g().setWorkflowStage(id, 2)
      return 2
    }`,
  )
  await page.getByRole('heading', { name: /Risk Analysis/i }).first().waitFor({ timeout: 8000 })
  await page.evaluate(() => {
    document.getElementById('cuw-stage-2')?.scrollIntoView({ block: 'start' })
  })
  await page.waitForTimeout(500)
  await shot(page, '08-risk-analysis.png')

  await cuw(
    page,
    `g => {
      const id = ${JSON.stringify(caseId)}
      const c = g().cases.find(x => x.id === id)
      g().setWorkflowStage(id, 3)
      g().saveFinancialSignOff(id, {
        limitUsd: c.limitRequestedUsd,
        sirUsd: 100000,
        pricingTier: c.tier,
        stubPremiumUsd: Math.round(c.limitRequestedUsd * 0.012),
        managerCosign: false,
        withinAuthority: true,
      })
      return !!g().cases.find(x => x.id === id)?.financialSignOff?.signedOffAt
    }`,
  )
  await page.getByRole('heading', { name: /Getting Ready to Quote/i }).first().waitFor({ timeout: 8000 })
  await page.evaluate(() => {
    document.getElementById('cuw-stage-3')?.scrollIntoView({ block: 'start' })
  })
  await page.waitForTimeout(500)
  await shot(page, '09-getting-ready-quote.png')

  await scrollCasePaneBottom(page)
  const quoteBtn = page.locator('.cuw-float-bar').getByRole('button', { name: /^Quote$/i })
  await quoteBtn.click()
  await page.getByRole('heading', { name: /Confirm quote/i }).waitFor({ timeout: 8000 })
  await page.waitForTimeout(400)
  await shot(page, '09b-decision-confirm.png')

  await page.getByRole('button', { name: /Confirm/i }).click()
  await page.waitForTimeout(700)
  await scrollCasePaneBottom(page)
  await shot(page, '10-decision-locked.png')
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } })

try {
  console.log('Capturing UW handoff arc →', OUT)
  await captureHandoff(page)
  console.log('Done →', OUT)
} catch (err) {
  console.error(err)
  await page.screenshot({ path: path.join(OUT, '_capture-error.png') }).catch(() => {})
  process.exitCode = 1
} finally {
  await browser.close()
}
