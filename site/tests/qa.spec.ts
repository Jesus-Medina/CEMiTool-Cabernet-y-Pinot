import { readFileSync } from 'node:fs'
import { expect, test, type Page } from '@playwright/test'

type ModulesPayload = {
  modules: Array<{
    module: string
    cultivar_stage_significant_fdr05: boolean
    robustness_classification: string | null
  }>
}

type M5Payload = {
  samples: Array<{ Year: number }>
}

type T008Payload = {
  summary: { pending_runs: number }
}

const modules = JSON.parse(readFileSync('public/data/modules.json', 'utf8')) as ModulesPayload
const m5 = JSON.parse(readFileSync('public/data/m5_trajectory.json', 'utf8')) as M5Payload
const t008 = JSON.parse(readFileSync('public/data/t008_progress.json', 'utf8')) as T008Payload

const routes = [
  ['/', /Cabernet Sauvignon/i],
  ['/story', /Historia científica/i],
  ['/modules', /La red completa/i],
  ['/modules/M5', /M5 · fenoles/i],
  ['/modules/M10', /^M10$/i],
  ['/modules/M2', /^M2$/i],
  ['/enrichment', /Qué funciones aparecen sobrerrepresentadas/i],
  ['/validation', /piel aislada|validación/i],
  ['/t008', /T-008 · estado vivo/i],
  ['/methods', /Métodos y decisiones/i],
  ['/evidence', /De una afirmación al archivo/i],
  ['/genes/VIT_12s0028g00860', /VIT_12s0028g00860/i],
] as const

function url(route: string) {
  return `.#${route}`
}

async function waitForStablePage(page: Page) {
  await page.waitForLoadState('domcontentloaded')
  await page.locator('main').waitFor({ state: 'visible' })
  await page.waitForTimeout(150)
}

async function assertBasicAccessibility(page: Page) {
  await expect(page.locator('main')).toBeVisible()
  await expect(page.locator('nav[aria-label="Navegación principal"]')).toBeVisible()
  expect(await page.locator('h1:visible').count()).toBeGreaterThanOrEqual(1)

  const unnamed = await page.locator('button, input, select, textarea, a[href]').evaluateAll((nodes) => {
    return nodes.flatMap((node) => {
      const element = node as HTMLElement & {
        labels?: NodeListOf<HTMLLabelElement> | null
        placeholder?: string
        value?: string
      }
      const style = window.getComputedStyle(element)
      const rect = element.getBoundingClientRect()
      const visible = style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0
      if (!visible) return []

      const labels = element.labels ? Array.from(element.labels).map((label) => label.textContent ?? '').join(' ') : ''
      const name = [
        element.getAttribute('aria-label') ?? '',
        element.getAttribute('title') ?? '',
        labels,
        element.textContent ?? '',
        element.placeholder ?? '',
      ].join(' ').trim()

      return name ? [] : [`${element.tagName.toLowerCase()} ${element.getAttribute('href') ?? element.getAttribute('type') ?? ''}`]
    })
  })
  expect(unnamed).toEqual([])
}

test.describe('WEB-011 route and browser QA', () => {
  for (const [route, heading] of routes) {
    test(`${route} renders without JS errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      page.on('console', (message) => {
        if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
          errors.push(message.text())
        }
      })
      page.on('response', (response) => {
        if (response.status() >= 400) {
          errors.push(`HTTP ${response.status()} ${response.url()}`)
        }
      })

      await page.goto(url(route))
      await waitForStablePage(page)
      await expect(page.locator('h1').first()).toContainText(heading)
      await assertBasicAccessibility(page)
      expect(errors).toEqual([])
    })
  }
})

test('module filters reflect generated canonical flags', async ({ page }) => {
  await page.goto(url('/modules'))
  await expect(page.locator('.module-card')).toHaveCount(modules.modules.length)

  const significant = modules.modules.filter((row) => row.cultivar_stage_significant_fdr05).length
  await page.getByRole('button', { name: 'Interacción FDR<0,05' }).click()
  await expect(page.locator('.module-card')).toHaveCount(significant)

  const reproducible = modules.modules.filter((row) => row.robustness_classification === 'reproducible').length
  await page.getByRole('button', { name: 'Reproducible', exact: true }).click()
  await expect(page.locator('.module-card')).toHaveCount(reproducible)

  const yearDependent = modules.modules.filter((row) => row.robustness_classification === 'year-dependent').length
  await page.getByRole('button', { name: 'Dependiente del año' }).click()
  await expect(page.locator('.module-card')).toHaveCount(yearDependent)

  await page.getByRole('button', { name: 'Todos', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Buscar módulo' }).fill('M10')
  await expect(page.locator('.module-card')).toHaveCount(1)
  await expect(page.locator('.module-card')).toContainText('M10')
})

test('M5 year and replicate filters alter the view, not the source data', async ({ page }) => {
  await page.goto(url('/modules/M5'))
  await expect(page.locator('.trajectory-chart-card')).toHaveCount(3)

  await page.getByRole('button', { name: '2013', exact: true }).first().click()
  await expect(page.locator('.trajectory-chart-card')).toHaveCount(1)
  await expect(page.locator('.trajectory-chart-card h3')).toHaveText('2013')

  await page.getByRole('checkbox', { name: 'Mostrar réplicas' }).check()
  const expectedReplicates = m5.samples.filter((row) => row.Year === 2013).length
  await expect(page.locator('.replicate-point')).toHaveCount(expectedReplicates)
})

test('Evidence Browser search resolves a finding and its artifact', async ({ page }) => {
  await page.goto(url('/evidence'))
  const search = page.getByRole('searchbox', { name: 'Buscar evidencia' })
  await search.fill('t008')
  await expect(
    page.locator('.evidence-claim').filter({ hasText: 'Progreso del reprocesamiento moderno T-008' }),
  ).toHaveCount(1)
  await expect(
    page.locator('.evidence-artifact').filter({ hasText: 't008_progress' }),
  ).toHaveCount(1)
})

test('T-008 status filter matches generated pending count', async ({ page }) => {
  await page.goto(url('/t008'))
  await page.getByLabel('Estado').selectOption('PENDING')
  await expect(page.locator('.t008-table tbody tr')).toHaveCount(t008.summary.pending_runs)
})

test('mobile layout has no document-level horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'mobile-only responsive audit')

  for (const route of ['/', '/modules', '/modules/M5', '/enrichment', '/validation', '/t008', '/evidence']) {
    await page.goto(url(route))
    await waitForStablePage(page)
    const dimensions = await page.evaluate(() => {
      const clientWidth = document.documentElement.clientWidth
      const offenders = Array.from(document.querySelectorAll<HTMLElement>('body *'))
        .map((element) => {
          const rect = element.getBoundingClientRect()
          return {
            tag: element.tagName.toLowerCase(),
            className: element.className?.toString().slice(0, 120) ?? '',
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
          }
        })
        .filter((item) => item.right > clientWidth + 2 || item.left < -2)
        .sort((a, b) => b.width - a.width)
        .slice(0, 8)

      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth,
        offenders,
      }
    })
    expect(
      dimensions.scrollWidth,
      `Horizontal overflow on ${route}: ${JSON.stringify(dimensions.offenders)}`,
    ).toBeLessThanOrEqual(dimensions.clientWidth + 2)
  }
})
