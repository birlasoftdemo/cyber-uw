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
  await expect(page.getByRole('heading', { name: 'Detailed Status' })).toBeVisible()
  await expect(page.getByRole('button', { name: /New Submissions/i })).toBeVisible()
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
    await expect(page.getByRole('heading', { name: 'Submissions Overview' })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Detailed Status' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Declined/i })).toBeVisible()
    await page.getByRole('button', { name: /New Submissions/i }).click()
    await expect(page.getByRole('row', { name: /CYB-2408/i })).toBeVisible()
    await expect(page.getByRole('row', { name: /Vanta Grid/i })).toBeVisible()
    await page.getByRole('navigation', { name: /Dashboard/i }).getByRole('button', { name: /^Dashboard$/i }).click()
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
    await expect(page.getByRole('heading', { name: /submission overview/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /basic information/i })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Intake', exact: true })).toBeVisible()
    await expect(page.getByLabel('Intake metrics')).toBeVisible()
    await expect(page.getByText('Submission Completeness', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Missing Documents', { exact: true })).toBeVisible()
    await expect(page.getByText('Duplicate Docs Check', { exact: true })).toBeVisible()
    await expect(page.getByText('Complete', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Broker Follow-ups', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('columnheader', { name: /broker follow-up/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Explain Confidence/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Explain Completeness/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /duplicate check/i })).toHaveCount(0)
    await expect(page.getByRole('columnheader', { name: /^insured$/i })).toHaveCount(0)
    await expect(page.getByRole('columnheader', { name: /^broker$/i })).toHaveCount(0)
    await expect(page.locator('.spec-grid--extract .spec-grid__row--review').first()).toBeVisible()
    await expect(
      page.locator('.spec-grid--extract .spec-grid__row--review').getByRole('button', {
        name: /Pending Review/i,
      }),
    ).toBeVisible()
    await expect(page.getByRole('heading', { name: /Integration Status/i })).toHaveCount(0)
    await expect(page.getByText('Required').first()).toBeVisible()
    await expect(page.getByText('Not Required').first()).toBeVisible()
    await expect(page.locator('.spec-grid__total')).toHaveCount(0)
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-03-intake.png`),
      fullPage: true,
    })

    await goJourney(page, 'Evidence Validation')
    await expect(page.getByRole('heading', { name: 'Evidence', exact: true })).toBeVisible()
    await expect(page.getByText(/InfoSec Questionnaire Q7/i)).toBeVisible()
    await expect(page.getByText('Contradicted').first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /applicant declaration/i })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /Explain Confidence/i })).toBeVisible()
    await page.getByRole('button', { name: /Explain Confidence/i }).click()
    await expect(page.getByRole('heading', { name: /How Evidence Confidence is scored/i })).toBeVisible()
    await page.locator('.score-explain-drawer__foot').getByRole('button', { name: 'Close' }).click()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-04-evidence.png`),
      fullPage: true,
    })

    await goJourney(page, 'Enrichment')
    const consentBtn = page.getByRole('button', { name: /continue to risk analysis/i })
    if (await consentBtn.isVisible().catch(() => false)) {
      await consentBtn.click()
    }
    await expect(page.getByRole('tab', { name: /loss run/i })).toHaveCount(0)
    await expect(page.getByRole('tab', { name: /attack surface/i })).toHaveCount(0)
    await expect(page.getByRole('tab', { name: /exposed services/i })).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Enrichment', exact: true })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByRole('columnheader', { name: /entity match/i })).toBeVisible()
    await expect(page.getByText('Y', { exact: true }).first()).toBeVisible()
    await expect(page.getByText(/conflict/i).first()).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-05-enrichment.png`),
      fullPage: true,
    })

    await goJourney(page, 'Risk Analysis')
    await expect(page.locator('.triage-sheet')).toHaveCount(0)
    const measures = page.locator('.ra-measures')
    await expect(measures.locator('.ra-measure')).toHaveCount(3)
    await expect(measures.getByText('Cyber Risk', { exact: true })).toBeVisible()
    await expect(measures.getByText('Control Effectiveness', { exact: true })).toBeVisible()
    await expect(measures.getByText('Appetite Result', { exact: true })).toBeVisible()
    await expect(page.getByText('High Level Summary', { exact: true })).toBeVisible()
    await expect(page.locator('.ra-scoreline .ra-score')).toBeVisible()
    await expect(page.getByRole('list', { name: 'Application sections' })).toHaveCount(0)
    await expect(page.getByText('Document findings', { exact: true })).toHaveCount(0)
    await expect(page.locator('.ra-sheet .spec-info-panel__bar').getByRole('heading', { name: 'Risk Analysis', exact: true })).toBeVisible()
    await expect(page.locator('.ra-sheet').getByText('Carrier desk', { exact: true })).toHaveCount(0)
    await expect(page.getByRole('button', { name: /How this model works/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /How scoring works/i })).toHaveCount(0)
    await expect(page.getByText(/Requested limit \$/i).first()).toBeVisible()
    await expect(page.locator('.ra-measure .uw-risk-card__score').first()).toHaveText(/\d+\/100/)
    await expect(page.locator('.ra-measure', { hasText: 'Appetite Result' }).locator('.uw-risk-card__score')).toHaveText(/\d+\/100/)
    await expect(page.locator('.uw-brand-badge--cr').first()).toBeVisible()
    await page.getByRole('button', { name: /How this model works/i }).click()
    await expect(page.getByRole('heading', { name: /How the desk model works/i })).toBeVisible()
    await expect(page.getByText(/Annual loss \(ALE\) is how often/i)).toBeVisible()
    await expect(page.locator('.score-explain-drawer__points li')).toHaveCount(3)
    await expect(page.getByRole('button', { name: 'Learn More' })).toBeDisabled()
    await page.locator('.score-explain-drawer__foot').getByRole('button', { name: 'Close' }).click()
    await page.locator('.ra-measure', { hasText: 'Cyber Risk' }).getByRole('button', { name: /About Cyber Risk/i }).click()
    await expect(page.getByRole('heading', { name: /How Cyber Risk is scored/i })).toBeVisible()
    await page.locator('.score-explain-drawer__foot').getByRole('button', { name: 'Close' }).click()
    await page.locator('.ra-measure', { hasText: 'Appetite Result' }).getByRole('button', { name: /why this score/i }).click()
    await expect(page.locator('.score-explain-drawer h2')).toHaveText(/Why this score - Appetite Result/i)
    await expect(page.locator('.score-explain-drawer__points li')).toHaveCount(3)
    await page.locator('.score-explain-drawer__foot').getByRole('button', { name: 'Close' }).click()

    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-06-risk-measures.png`),
      fullPage: true,
    })

    await goJourney(page, 'Decision')
    await expect(page.locator('section.hitl-panel')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Decision', exact: true })).toBeVisible()
    await expect(page.getByText('AI Summary', { exact: true })).toBeVisible()
    await expect(page.locator('.hitl-pill', { hasText: 'Refer' })).toBeVisible()
    await expect(page.locator('.hitl-authority')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Request Information', exact: true })).toHaveCount(0)
    await expect(page.locator('.hitl-controls-panel')).toBeVisible()
    await expect(page.locator('.hitl-controls')).toBeVisible()
    await expect(page.locator('.hitl-submit')).toBeVisible()
    await expect(page.locator('.hitl-ai__point-link').first()).toHaveAttribute('href', /^#/)

    await page.getByRole('button', { name: 'Approve', exact: true }).click()
    await expect(page.getByText(/required for overrides and material exceptions/i)).toBeVisible()
    const submit = page.getByRole('button', { name: /submit decision/i })
    await expect(submit).toBeDisabled()

    await page.getByPlaceholder(/explain why/i).fill(
      'Material exception accepted for demo after broker remediation plan.',
    )
    await expect(submit).toBeEnabled()
    await submit.click()
    await expect(page.getByRole('heading', { name: /Record Underwriter Approval\?/i })).toBeVisible()
    await expect(page.getByText(/Check integration status in the table below/i)).toBeVisible()
    await page.getByRole('button', { name: /Confirm approve/i }).click()
    await expect(page.getByRole('button', { name: /Saved/i })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: 'Integration Status', exact: true })).toBeVisible()
    await expect(page.getByText(/Policy Administration/i).first()).toBeVisible()
    await expect(page.getByText(/Rating\/Pricing|Rating \/ Pricing/i).first()).toBeVisible()
    await expect(page.getByText(/Broker CRM/i).first()).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-07-hitl.png`),
      fullPage: true,
    })

    await expect(page.getByRole('navigation', { name: /case journey/i }).getByRole('button', { name: 'Integration', exact: true })).toHaveCount(0)

    await goJourney(page, 'Audit')
    await expect(page.getByRole('heading', { name: 'Audit', exact: true })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /human override/i })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /confidence/i })).toBeVisible()

    await page.getByRole('button', { name: /back to dashboard/i }).click()
    await expect(page.getByRole('navigation', { name: /dashboard/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Detailed Status' })).toBeVisible()
    await expect(page.getByRole('img', { name: /Broker Follow-up/i }).first()).toBeVisible()

    expect(errors, errors.join('\n')).toEqual([])
  })
})
