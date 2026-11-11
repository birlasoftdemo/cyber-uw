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
  await expect(page.getByRole('heading', { name: /all in progress submissions/i })).toBeVisible()
}

async function openNorthline(page: Page) {
  await page.getByRole('row', { name: /CYB-2401/i }).click()
  await expect(page.getByRole('group', { name: /case context/i })).toBeVisible()
}

async function goTracker(page: Page, label: string) {
  await page.getByRole('button', { name: label, exact: true }).click()
}

test.describe('Client feedback demo', () => {
  test('walkthrough covers feedback surfaces without console errors', async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(String(err)))
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return
      const text = msg.text()
      // Ignore benign Vite / React DevTools noise.
      if (/Download the React DevTools|vite|favicon/i.test(text)) return
      errors.push(text)
    })

    await login(page)
    await page.screenshot({ path: path.join(shotDir, `${testInfo.project.name}-01-home.png`), fullPage: true })

    await openNorthline(page)
    const header = page.getByRole('group', { name: /case context/i })
    await expect(header.getByText('Requested Limit', { exact: true })).toBeVisible()
    await expect(header.getByText('Completeness', { exact: true })).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-02-case-header.png`),
      fullPage: true,
    })

    await goTracker(page, 'New Submission')
    await expect(page.getByRole('heading', { name: /cyber documents received/i })).toBeVisible()
    await expect(page.getByLabel('Intake metrics')).toBeVisible()
    await expect(page.getByText('Submission Completeness', { exact: true })).toBeVisible()
    await expect(page.getByText('Missing Documents', { exact: true })).toBeVisible()
    await expect(page.getByText('Duplicate Docs Check', { exact: true })).toBeVisible()
    await expect(page.getByText('Complete', { exact: true }).first()).toBeVisible()
    await expect(page.getByText('Broker Follow-ups', { exact: true })).toBeVisible()
    await expect(page.locator('.spec-grid__total')).toHaveCount(0)
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-03-intake.png`),
      fullPage: true,
    })

    await goTracker(page, 'Evidence Verification')
    await expect(page.getByRole('heading', { name: /evidence verification/i })).toBeVisible()
    await expect(page.getByText(/InfoSec Questionnaire Q7/i)).toBeVisible()
    await expect(page.getByText('Contradicted').first()).toBeVisible()
    await expect(page.getByRole('columnheader', { name: /applicant declaration/i })).toHaveCount(0)
    const pillColors = await page.evaluate(() => {
      const style = (sel: string) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const cs = getComputedStyle(el)
        return { bg: cs.backgroundColor, fg: cs.color, radius: cs.borderRadius }
      }
      return {
        bad: style('.spec-grid-status--bad'),
        mid: style('.spec-grid-status--mid'),
        ok: style('.spec-grid-status--ok'),
        tokens: {
          badBg: getComputedStyle(document.documentElement).getPropertyValue('--vg-pill-bad-bg').trim(),
          badFg: getComputedStyle(document.documentElement).getPropertyValue('--vg-pill-bad-fg').trim(),
          midBg: getComputedStyle(document.documentElement).getPropertyValue('--vg-pill-mid-bg').trim(),
          midFg: getComputedStyle(document.documentElement).getPropertyValue('--vg-pill-mid-fg').trim(),
          okBg: getComputedStyle(document.documentElement).getPropertyValue('--vg-pill-ok-bg').trim(),
          okFg: getComputedStyle(document.documentElement).getPropertyValue('--vg-pill-ok-fg').trim(),
        },
      }
    })
    expect(pillColors.tokens.badBg.toLowerCase()).toBe('#fce3e4')
    expect(pillColors.tokens.badFg.toLowerCase()).toBe('#af2922')
    expect(pillColors.tokens.midBg.toLowerCase()).toBe('#eaeff5')
    expect(pillColors.tokens.midFg.toLowerCase()).toBe('#2e384a')
    expect(pillColors.tokens.okBg.toLowerCase()).toBe('#e4f6ec')
    expect(pillColors.tokens.okFg.toLowerCase()).toBe('#0c6b3e')
    expect(pillColors.bad?.bg).toBe('rgb(252, 227, 228)')
    expect(pillColors.bad?.fg).toBe('rgb(175, 41, 34)')
    expect(pillColors.mid?.bg).toBe('rgb(234, 239, 245)')
    expect(pillColors.ok?.bg).toBe('rgb(228, 246, 236)')
    expect(pillColors.bad?.radius).toBe('999px')
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-04-evidence.png`),
      fullPage: true,
    })

    await goTracker(page, 'External Risk Enrichment')
    const continueBtn = page.getByRole('button', { name: /continue to risk analysis/i })
    if (await continueBtn.isVisible().catch(() => false)) {
      await page.getByText('Bitsight', { exact: false }).first().click()
      await page.getByText('Cyence', { exact: false }).first().click()
      await page.getByText('Cytora', { exact: false }).first().click()
      await continueBtn.click()
    }
    await expect(page.getByRole('heading', { name: /external findings/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText('Simulated').first()).toBeVisible()
    await expect(page.getByText(/conflict/i).first()).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-05-enrichment.png`),
      fullPage: true,
    })

    await goTracker(page, 'Internal Risk Analysis')
    const measures = page.locator('.ra-measures')
    await expect(measures.getByText('Cyber Risk', { exact: true })).toBeVisible()
    await expect(measures.getByText('Appetite Result', { exact: true })).toBeVisible()
    await expect(page.locator('.uw-brand-badge--cr').first()).toBeVisible()
    await expect(page.locator('.uw-brand-badge--le').first()).toBeVisible()
    await expect(page.locator('.uw-brand-badge--e').first()).toBeVisible()
    await expect(page.locator('.uw-brand-badge--c').first()).toBeVisible()
    await expect(page.locator('.uw-brand-badge--l').first()).toBeVisible()

    const brandColors = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement)
      const rgb = (sel: string) => getComputedStyle(document.querySelector(sel)!).backgroundColor
      return {
        e: root.getPropertyValue('--vg-status-e').trim(),
        c: root.getPropertyValue('--vg-status-c').trim(),
        cr: root.getPropertyValue('--vg-status-cr').trim(),
        le: root.getPropertyValue('--vg-status-le').trim(),
        l: root.getPropertyValue('--vg-status-l').trim(),
        badgeCr: rgb('.uw-brand-badge--cr'),
        badgeLe: rgb('.uw-brand-badge--le'),
        badgeE: rgb('.uw-brand-badge--e'),
        badgeC: rgb('.uw-brand-badge--c'),
        badgeL: rgb('.uw-brand-badge--l'),
      }
    })
    expect(brandColors.e.toLowerCase()).toBe('#a0a0a0')
    expect(brandColors.c.toLowerCase()).toBe('#1a85ff')
    expect(brandColors.cr.toLowerCase()).toBe('#32c58b')
    expect(brandColors.le.toLowerCase()).toBe('#ff6c54')
    expect(brandColors.l.toLowerCase()).toBe('#3c923c')
    expect(brandColors.badgeE).toBe('rgb(160, 160, 160)')
    expect(brandColors.badgeC).toBe('rgb(26, 133, 255)')
    expect(brandColors.badgeCr).toBe('rgb(50, 197, 139)')
    expect(brandColors.badgeLe).toBe('rgb(255, 108, 84)')
    expect(brandColors.badgeL).toBe('rgb(60, 146, 60)')

    await page.locator('.ra-measure', { hasText: 'Appetite Result' }).getByRole('button', { name: /why this result/i }).click()
    await expect(page.getByText(/MFA coverage below minimum threshold/i).first()).toBeVisible()
    await page.screenshot({
      path: path.join(shotDir, `${testInfo.project.name}-06-risk-measures.png`),
      fullPage: true,
    })

    await goTracker(page, 'Sync to Policy Center')
    await expect(page.getByRole('heading', { name: /underwriter decision/i })).toBeVisible()
    await expect(page.getByText('AI recommendation', { exact: true })).toBeVisible()
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

    expect(errors, errors.join('\n')).toEqual([])
  })
})
