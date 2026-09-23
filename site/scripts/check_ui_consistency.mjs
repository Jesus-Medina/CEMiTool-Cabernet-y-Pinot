import { readdir, readFile } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const sourceRoot = new URL('../src/', import.meta.url)

const debtBudgets = [
  {
    name: 'estado asíncrono local',
    needle: '<div className="data-state',
    max: 15,
    replacement: 'AsyncState',
  },
  {
    name: 'tabla desplazable local',
    needle: '<div className="scientific-table-wrap',
    max: 5,
    replacement: 'TableFrame',
  },
  {
    name: 'estado vacío de módulo local',
    needle: '<div className="module-empty',
    max: 3,
    replacement: 'EmptyState',
  },
  {
    name: 'Link estilizado directamente como botón',
    needle: '<Link className="button button--',
    max: 4,
    replacement: 'ButtonLink',
  },
]

const prohibited = [
  {
    name: 'barra de filtros de módulos local',
    needle: '<div className="module-filter-panel',
    replacement: 'FilterBar',
  },
  {
    name: 'barra de filtros de validación local',
    needle: '<section className="validation-controls',
    replacement: 'FilterBar',
  },
  {
    name: 'estado vacío de validación local',
    needle: '<p className="validation-empty',
    replacement: 'EmptyState',
  },
]

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await walk(path))
    else if (['.tsx', '.ts'].includes(extname(entry.name))) files.push(path)
  }
  return files
}

const rootPath = fileURLToPath(sourceRoot)
const files = await walk(rootPath)
const sources = await Promise.all(files.map(async (path) => ({
  path,
  text: await readFile(path, 'utf8'),
})))

function occurrences(needle) {
  const matches = []
  for (const source of sources) {
    let offset = source.text.indexOf(needle)
    while (offset !== -1) {
      const line = source.text.slice(0, offset).split('\n').length
      matches.push(`${relative(rootPath, source.path)}:${line}`)
      offset = source.text.indexOf(needle, offset + needle.length)
    }
  }
  return matches
}

const failures = []
for (const rule of debtBudgets) {
  const matches = occurrences(rule.needle)
  if (matches.length > rule.max) {
    failures.push(`${rule.name}: ${matches.length}/${rule.max}. Usa ${rule.replacement}. Nuevos usos: ${matches.join(', ')}`)
  }
}

for (const rule of prohibited) {
  const matches = occurrences(rule.needle)
  if (matches.length > 0) {
    failures.push(`${rule.name}: prohibido. Usa ${rule.replacement}. Ubicaciones: ${matches.join(', ')}`)
  }
}

const uiSource = await readFile(join(rootPath, 'components', 'ui.tsx'), 'utf8')
for (const component of ['ButtonLink', 'Badge', 'Callout', 'ActionLink', 'ActionCard', 'AsyncState', 'EmptyState', 'FilterBar', 'TableFrame', 'ChartCard']) {
  if (!uiSource.includes(`function ${component}`)) failures.push(`Falta la primitiva requerida ${component}.`)
}

if (failures.length > 0) {
  console.error('UI consistency QA FAIL')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('UI consistency QA PASS: no new local equivalents; legacy debt did not increase.')
