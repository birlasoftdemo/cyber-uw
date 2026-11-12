import { expect, test, type Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const shotDir = path.resolve(here, '../docs/feedback-preview/screenshots')

async function login(page: Page) {
  await page.goto('/')
  await page.getByRole('textbox', { name: /email/i }).fill('uw@cyber.internal')
  await page.getByRole('textbox', { name: /password/i }).fill('uw123')
  await page.getByRole('button', { name: /^sign in$/i }).click()
  await expect(page.getByText('Adaptive Cyber Underwriting Intelligence').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'New Submissions' })).toBeVisible()
}

async function openNorthline(page: Page) {
  await page.getByRole('row', { name: /CYB-2401/i }).click()
  await expect(page.getByRole('group', { name: /case context/i })).toBeVisible()
  await expect(page.getByRole('navigation', { name: /case journey/i })).toBeVisible()
}

async function goJourney(page: Page, label: string) {
  await page.getByRole('navigation', { name: /case journey/i }).getByRole('button', { name: label, exact: true }).click()
}

test.describe('Client feedback demo', () => {
  test('walkthrough covers feedback surfaces without console errors', async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(String(err)))
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const text = msg.text()
      if (/Download the React DevTools|vite|favicon/i.test(text)) return
      errors.push(text)
    })

    await login(page)
    await expect(page.getByText('Decision-ready', { exact: true }).first()).toBeVisible()
    await page.screenshot({ path: path.join(shotDir, `${testInfo.project.name}-01-home.png`), fullPage: true })

    await openNorthline(page)
    const header = page.getByRole('group', { name: /case context/i })
    await expect(header.getByText('Requested Limit', { exact: true })).toBeVisible()
    await expect(header.getByText('Completeness', { exact: true })).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-02-case-header.png`),
      fullPage: true,
    })

    await goJourney(page, 'Intake')
    await expect(page.getByRole('heading', { name: /cyber documents received/i })).toBeVisible()
    await expect(page.getByLabel('Intake metrics')).toBeVisible()
    await expect(page.getByText('Submission Completeness', { exact: true })).toBeVisible()
    await expect(page.getByText('Missing Documents', { exact: true })).toBeVisible()
    await expect(page.getByText('Duplicate Docs Check', { exact: true })).toBeVisible()
    await expect(page.getByText('Broker Follow-ups', { exact: true })).toBeVisible()
    await expect(page.locator('.spec-grid__total')).toHaveCount(0)
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-03-intake.png`),
      fullPage: true,
    })

    await goJourney(page, 'Evidence')
    await expect(page.getByRole('heading', { name: /evidence verification/i })).toBeVisible()
    await expect(page.getByText(/InfoSec Questionnaire Q7/i)).toBeVisible()
    await expect(page.getByText('Contradicted').first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /applicant declaration/i })).toHaveCount(0)
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-04-evidence.png`),
      fullPage: true,
    })

    await goJourney(page, 'Enrichment')
    const consentBtn = page.getByRole('button', { name: /continue to risk analysis/i })
    await expect(consentBtn).toBeVisible({ timeout: 5_000 })
    await consentBtn.click()
    await expect(page.getByRole('heading', { name: /external findings/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Simulated').first()).toBeVisible()
    await expect(page.getByText(/conflict/i).first()).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-05-enrichment.png`),
      fullPage: true,
    })

    await goJourney(page, 'Risk Analysis')
    const measures = page.locator('.ra-measures')
    await expect(measures.getByText('Cyber Risk', { exact: true })).toBeVisible()
    await expect(measures.getByText('Appetite Result', { exact: true })).toBeVisible()
    await expect(page.locator('.uw-brand-badge--cr').first()).toBeVisible()
    await page.locator('.ra-measure', { hasText: 'Appetite Result' }).getByRole('button', { name: /why this result/i }).click()
    await expect(page.getByText(/MFA coverage below minimum threshold/i).first()).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-06-risk-measures.png`),
      fullPage: true,
    })

    await goJourney(page, 'Decision')
    await expect(page.getByRole('heading', { name: /underwriter decision/i })).toBeVisible()
    await expect(page.getByText('AI recommendation', { exact: true })).toBeVisible()

    await goJourney(page, 'Integration')
    await expect(page.getByRole('heading', { name: /controlled handoff/i })).toBeVisible()
    await expect(page.getByText('Policy Administration', { exact: true })).toBeVisible()
    await expect(page.getByText('Rating / Pricing', { exact: true })).toBeVisible()
    await expect(page.getByText('Broker CRM', { exact: true })).toBeVisible()
    await expect(page.locator('.hitl-pill', { hasText: 'Refer' })).toBeVisible()

    await page.getByRole('button', { name: 'Approve', exact: true }).click()
    await expect(page.getByText(/required for overrides and material exceptions/i)).toBeVisible()
    const submit = page.getByRole('button', { name: /submit decision/i })
    await expect(submit).toBeDisabled()

    await page.getByPlaceholder(/explain why/i).fill(
      'Material exception accepted for demo after broker remediation plan.',
    )
    await expect(submit).toBeEnabled()
    await submit.click()
    await expect(page.getByRole('button', { name: /decision locked/i })).toBeVisible({ timeout: 10_000 })
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-07-hitl.png`),
      fullPage: true,
    })

    await goJourney(page, 'Audit')
    await expect(page.getByRole('heading', { name: /audit trail/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /human override/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /confidence/i })).toBeVisible()

    await page.getByRole('navigation', { name: /case journey/i }).getByRole('button', { name: 'Dashboard', exact: true }).click()
    await expect(page.getByRole('navigation', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByText('Adaptive Cyber Underwriting Intelligence').first()).toBeVisible()

    expect(errors, errors.join('\n')).toEqual([])
  })
})
