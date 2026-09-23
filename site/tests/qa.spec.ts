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
  ['/', /Comparar programas de coexpresión/i],
  ['/results', /Comparar los diez módulos/i],
  ['/results/modules', /Comparar los diez módulos/i],
  ['/results/modules/M5', /M5 · fenoles/i],
  ['/results/modules/M10', /^M10$/i],
  ['/results/modules/M2', /^M2$/i],
  ['/results/function', /Qué funciones aparecen sobrerrepresentadas/i],
  ['/results/validation', /piel aislada|validación/i],
  ['/results/genes', /Explora genes priorizados/i],
  ['/results/genes/VIT_12s0028g00860', /VIT_12s0028g00860/i],
  ['/methods', /Cómo se construyó la evidencia/i],
  ['/reproducibility', /Audita un resultado hasta su fuente/i],
  ['/status/t008', /Estado del reprocesamiento moderno/i],
  ['/search', /Encuentra un resultado/i],
  ['/ask', /Pregúntale al proyecto/i],
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

test('integrated GSEA ORA and yearly profiles report preserves year scope', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      errors.push(message.text())
    }
  })
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`)
  })

  await page.goto('reports/gsea_ora_year_profiles.html')
  await expect(page.getByRole('heading', { level: 1, name: /Cabernet Sauvignon y Pinot noir durante la maduración/i })).toBeVisible()

  await expect(page.locator('#auditSummary .card')).toHaveCount(4)
  await expect(page.locator('#auditTable tr')).toHaveCount(10)
  await expect(page.locator('#auditTable tr').filter({ hasText: 'M1' })).toContainText('ATTENTION_GSEA_M1_NATIVE_ROW_MISSING')
  await expect(page.locator('#auditNotice')).toContainText(/M1|ATTENTION/i)

  await expect(page.locator('.inner-tabs')).toHaveCount(0)
  await expect(page.locator('#gseaOverviewCards .card')).toHaveCount(4)
  await expect(page.locator('#gseaComposition .composition-card')).toHaveCount(6)
  await expect(page.locator('#gseaMatrix tbody tr')).toHaveCount(10)
  await expect(page.locator('#gseaMissing')).toContainText('M1')
  await expect(page.locator('#gsea-figure')).toBeVisible()
  await expect(page.locator('#gsea-method')).toBeVisible()

  await expect(page.locator('#oraBars .barrow').first()).toBeVisible()
  await expect(page.locator('#oraTable tr').first()).toContainText(/stilbenoid|Secondary metabolism/i)
  await expect(page.locator('#oraDownloadCsv')).toBeVisible()
  await expect(page.locator('#oraThemeView .card')).toHaveCount(4)
  await expect(page.locator('#oraQcCoverage .card')).toHaveCount(10)
  await expect(page.locator('#oraQcTable tr')).toHaveCount(30)
  await expect(page.locator('#oraM5v3')).toContainText(/stilbenoid|Secondary metabolism/i)
  await expect(page.locator('#oraM5v5')).not.toBeEmpty()
  await expect(page.locator('#oraGoCards .card')).toHaveCount(4)
  await expect(page.locator('#oraGoBars .barrow')).toHaveCount(6)
  await expect(page.locator('#ora-method')).toBeVisible()

  await expect(page.locator('#hubCoreCards .card')).toHaveCount(4)
  await expect(page.locator('#hubCoreSummary tr')).toHaveCount(10)
  await expect(page.locator('#hubCoreSummary tr').filter({ hasText: 'M5' })).toContainText('11')

  await page.getByRole('button', { name: /Hub-core PC1 · top 10% kWithin/i }).click()
  await expect(page.locator('#profileGrid .profile-card')).toHaveCount(10)
  await expect(page.locator('#profileGrid')).toContainText('Hub-core PC1')
  await expect(page.locator('#profileGrid .profile-card').filter({ hasText: 'M5' })).toContainText('11 hubs / 108 genes')

  await page.getByRole('button', { name: '2012', exact: true }).click()
  await expect(page.locator('#profileGrid')).toContainText('Año 2012')
  await page.getByRole('button', { name: '2014', exact: true }).click()
  await expect(page.locator('#profileGrid')).toContainText('Año 2014')

  await expect(page.locator('#profileDataTable tr')).toHaveCount(180)
  await expect(page.locator('#profileDownloadCsv')).toBeVisible()

  await expect(page.locator('#hubListModule')).toHaveValue('M5')
  await expect(page.locator('#hubListTable tr')).toHaveCount(11)
  await expect(page.locator('#hubListSummary .card')).toHaveCount(4)

  await expect(page.locator('#contrastModule')).toHaveValue('M5')
  await expect(page.locator('#contrastTable tr')).toHaveCount(9)
  await expect(page.locator('#contrastTable')).toContainText('2012')
  await expect(page.locator('#contrastTable')).toContainText('2013')
  await expect(page.locator('#contrastTable')).toContainText('2014')

  expect(errors).toEqual([])
})

test('integrated report highlights the current scientific section in the sticky navigation', async ({ page }) => {
  await page.goto('reports/gsea_ora_year_profiles.html')

  const gsea = page.locator('.anchors a[href="#gsea"]')
  const ora = page.locator('.anchors a[href="#ora"]')
  const profiles = page.locator('.anchors a[href="#profiles"]')
  const audit = page.locator('.anchors a[href="#audit"]')

  await expect(gsea).toHaveClass(/active/)
  await page.locator('#ora').scrollIntoViewIfNeeded()
  await expect(ora).toHaveClass(/active/)
  await page.locator('#profiles').scrollIntoViewIfNeeded()
  await expect(profiles).toHaveClass(/active/)
  await page.locator('#audit').scrollIntoViewIfNeeded()
  await expect(audit).toHaveClass(/active/)
})

test('integrated report switches completely between Spanish and curated scientific English', async ({ page }) => {
  await page.goto('reports/gsea_ora_year_profiles.html?utm_source=chatgpt.com')
  await expect(page.getByText(/Catalina Constanza Marchant Hurtado/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Cambiar idioma a inglés/i })).toBeVisible()

  await page.getByRole('button', { name: /Cambiar idioma a inglés/i }).click()
  await page.waitForURL(/lang=en/)
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await expect(page.getByRole('heading', { level: 1, name: /Cabernet Sauvignon and Pinot noir during ripening/i })).toBeVisible()
  await expect(page.getByText('Methods and quality control', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Expression profiles of modules M1–M10', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Switch language to Spanish/i })).toBeVisible()
  await expect(page).not.toHaveURL(/utm_source/)

  await page.getByRole('button', { name: /Switch language to Spanish/i }).click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'es')
  await expect(page.getByRole('heading', { level: 1, name: /Cabernet Sauvignon y Pinot noir durante la maduración/i })).toBeVisible()
})

test('English report has no mixed Spanish in generated profile cards and full PDF mode exposes all tables', async ({ page }) => {
  await page.goto('reports/gsea_ora_year_profiles.html?lang=en')
  await expect(page.getByRole('heading', { level: 1, name: /Cabernet Sauvignon and Pinot noir during ripening/i })).toBeVisible()
  await expect(page.locator('#profileGrid .profile-card')).toHaveCount(10)

  const profileText = await page.locator('#profileGrid').innerText()
  expect(profileText).toContain('Canonical eigengene')
  expect(profileText).toContain('Descriptive interpretation')
  expect(profileText).not.toMatch(/Eigengene canónico|Interpretación descriptiva|La mayor separación descriptiva|La dirección de esa diferencia|todos los genes del módulo|Año 20\d\d/i)

  await expect(page.getByRole('button', { name: /Download complete PDF/i })).toBeVisible()
  await expect.poll(
    () => page.evaluate(() => typeof (window as typeof window & { generateCompleteReportPdf?: unknown }).generateCompleteReportPdf),
  ).toBe('function')
})

test('standalone ORA HTML loads canonical data, bars and tabs', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error' && !message.text().includes('Failed to load resource')) {
      errors.push(message.text())
    }
  })
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()} ${response.url()}`)
  })

  await page.goto('reports/ora_beta10.html')
  await expect(page.getByRole('heading', { level: 1, name: /ORA interactivo de los diez módulos beta10/i })).toBeVisible()

  await expect(page.locator('#summaryCards .card')).toHaveCount(4)
  await expect(page.locator('#overviewBars .bar-row')).toHaveCount(10)

  await page.getByRole('button', { name: 'ORA por término' }).click()
  await expect(page.locator('#oraChart .bar-row').first()).toBeVisible()
  await page.locator('#oraModule').selectOption('M5')
  await page.locator('#oraSource').selectOption('v3_mapman')
  await expect(page.locator('#oraTable tr').first()).toContainText(/stilbenoid|Secondary metabolism/i)

  await page.getByRole('button', { name: 'M5 · auditoría' }).click()
  await expect(page.locator('#m5v3 .audit-term').first()).toBeVisible()
  await expect(page.locator('#m5v5 .audit-term').first()).toBeVisible()

  await page.getByRole('button', { name: 'GO auditado' }).click()
  await expect(page.locator('#goCards .card')).toHaveCount(4)
  await expect(page.locator('#goBars .bar-row')).toHaveCount(6)

  expect(errors).toEqual([])
})

test('summary page matches the V2 scientific information hierarchy', async ({ page }) => {
  await page.goto(url('/'))

  await expect(page.getByRole('heading', { level: 1, name: /Comparar programas de coexpresión/i })).toBeVisible()
  await expect(page.locator('.home-v2-study-card .home-v2-fact')).toHaveCount(8)
  await expect(page.locator('.home-v2-finding-row article')).toHaveCount(4)
  await expect(page.locator('.home-v2-flow li')).toHaveCount(6)
  await expect(page.locator('.home-v2-limit-row article')).toHaveCount(4)

  const heroImage = page.locator('.home-v2-grapes img')
  await expect(heroImage).toBeVisible()
  await expect.poll(
    () => heroImage.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0),
    { message: 'Home hero visual should load' },
  ).toBe(true)

  const m5Image = page.locator('.home-v2-m5-chart img')
  await m5Image.scrollIntoViewIfNeeded()
  await expect.poll(
    () => m5Image.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0),
    { message: 'Canonical M5 chart should load' },
  ).toBe(true)
})

test('CEMiTool module figure and filters reflect generated canonical flags', async ({ page }) => {
  await page.goto(url('/results/modules'))

  await expect(page.locator('.cemitool-profile-tile')).toHaveCount(10)
  await expect(page.locator('.cemitool-profile-tile img')).toHaveCount(10)
  await expect(page.getByRole('link', { name: /Abrir PDF original/i })).toBeVisible()

  const profileImages = page.locator('.cemitool-profile-tile img')
  for (let index = 0; index < 10; index += 1) {
    const image = profileImages.nth(index)
    await image.scrollIntoViewIfNeeded()
    await expect.poll(
      () => image.evaluate((node) => node instanceof HTMLImageElement && node.complete && node.naturalWidth > 0),
      { message: `CEMiTool profile image ${index + 1} should load` },
    ).toBe(true)
  }

  const rows = page.locator('.module-data-table tbody tr')
  await expect(rows).toHaveCount(modules.modules.length)

  const significant = modules.modules.filter((row) => row.cultivar_stage_significant_fdr05).length
  await page.getByRole('button', { name: 'Interacción FDR<0,05' }).click()
  await expect(rows).toHaveCount(significant)

  const reproducible = modules.modules.filter((row) => row.robustness_classification === 'reproducible').length
  await page.getByRole('button', { name: 'Reproducible', exact: true }).click()
  await expect(rows).toHaveCount(reproducible)

  const yearDependent = modules.modules.filter((row) => row.robustness_classification === 'year-dependent').length
  await page.getByRole('button', { name: 'Dependiente del año' }).click()
  await expect(rows).toHaveCount(yearDependent)

  await page.getByRole('button', { name: 'Todos', exact: true }).click()
  await page.getByRole('searchbox', { name: 'Buscar módulo' }).fill('M10')
  await expect(rows).toHaveCount(1)
  await expect(rows.first()).toContainText('M10')
})

test('results navigation stays shallow and breadcrumbs appear only on detail views', async ({ page }) => {
  await page.goto(url('/results/modules'))
  await expect(page.locator('.result-context-bar')).toBeVisible()
  await expect(page.locator('.result-context-link')).toHaveCount(4)
  await expect(page.locator('.breadcrumb-bar')).toHaveCount(0)

  await page.goto(url('/results/modules/M10'))
  await expect(page.locator('.breadcrumb-bar')).not.toContainText('Resultados')
  await expect(page.locator('.breadcrumb-bar')).toContainText('Módulos')
  await expect(page.locator('.breadcrumb-bar')).toContainText('M10')
})

test('module detail navigation allows direct return and sibling browsing', async ({ page }) => {
  await page.goto(url('/results/modules/M5'))
  await expect(page.getByRole('link', { name: /Todos los módulos/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /M4/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /M6/ })).toBeVisible()

  await page.goto(url('/results/modules/M10'))
  await expect(page.getByRole('link', { name: /Todos los módulos/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /M9/ })).toBeVisible()
})

test('M5 year and replicate filters alter the view, not the source data', async ({ page }) => {
  await page.goto(url('/results/modules/M5'))
  await expect(page.locator('.trajectory-chart-card')).toHaveCount(3)

  await page.getByRole('button', { name: '2013', exact: true }).first().click()
  await expect(page.locator('.trajectory-chart-card')).toHaveCount(1)
  await expect(page.locator('.trajectory-chart-card h3')).toHaveText('2013')

  await page.getByRole('checkbox', { name: 'Mostrar réplicas' }).check()
  const expectedReplicates = m5.samples.filter((row) => row.Year === 2013).length
  await expect(page.locator('.replicate-point')).toHaveCount(expectedReplicates)
})

test('Evidence Browser search resolves a finding and its artifact', async ({ page }) => {
  await page.goto(url('/reproducibility'))
  const search = page.getByRole('searchbox', { name: 'Buscar evidencia' })
  await search.fill('t008')
  await expect(
    page.locator('.evidence-claim').filter({ hasText: 'Progreso del reprocesamiento moderno T-008' }),
  ).toHaveCount(1)

  await page.getByRole('button', { name: /Artefactos/i }).click()
  await expect(
    page.locator('.evidence-artifact').filter({ hasText: 't008_progress' }),
  ).toHaveCount(1)
})

test('T-008 status filter matches generated pending count', async ({ page }) => {
  await page.goto(url('/status/t008'))
  await page.getByLabel('Estado').selectOption('PENDING')
  await expect(page.locator('.t008-table tbody tr')).toHaveCount(t008.summary.pending_runs)
})

test('mobile layout has no document-level horizontal overflow', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium', 'mobile-only responsive audit')

  for (const route of ['/', '/results', '/results/modules', '/results/modules/M5', '/results/function', '/results/validation', '/results/genes', '/methods', '/reproducibility', '/status/t008', '/ask']) {
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
