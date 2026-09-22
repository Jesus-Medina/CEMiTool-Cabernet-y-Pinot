export type ProjectSummary = {
  schema_version: number
  generated_at_utc: string
  design: {
    sample_count: number
    cultivars: string[]
    stages: string[]
    years: number[]
    replicates_per_cell_values: number[]
    balanced: boolean
  }
  network: {
    primary_beta: number
    scale_free_r2: number
    mean_connectivity: number
  }
  t008: {
    total_runs: number
    validated_runs: number
    failed_runs: number
    pending_or_running_runs: number
    complete: boolean
    latest_event_utc: string | null
  }
}

export type ModuleSummary = {
  module: string
  gene_count: number
  cultivar_stage_fdr: number | null
  cultivar_stage_significant_fdr05: boolean
  robustness_classification: string | null
  robustness_note: string | null
}

export type ModulesPayload = {
  schema_version: number
  modules: ModuleSummary[]
}

export type M5Contrast = {
  Module: string
  Stage: string
  Year: number
  estimate: number
  FDR_global_90: number | null
}

export type M5TrajectoryPayload = {
  schema_version: number
  module: string
  profiles: Array<Record<string, unknown>>
  samples: Array<Record<string, unknown>>
  contrasts: M5Contrast[]
}

const cache = new Map<string, Promise<unknown>>()

function dataUrl(fileName: string) {
  return `${import.meta.env.BASE_URL}data/${fileName}`
}

async function fetchJson<T>(fileName: string): Promise<T> {
  const key = dataUrl(fileName)
  let request = cache.get(key)

  if (!request) {
    request = fetch(key).then(async (response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar ${fileName} (HTTP ${response.status})`)
      }
      return response.json() as Promise<T>
    })
    cache.set(key, request)
  }

  return request as Promise<T>
}

export function loadProjectSummary() {
  return fetchJson<ProjectSummary>('project_summary.json')
}

export function loadModules() {
  return fetchJson<ModulesPayload>('modules.json')
}

export function loadM5Trajectory() {
  return fetchJson<M5TrajectoryPayload>('m5_trajectory.json')
}
