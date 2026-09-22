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

export type M5Profile = {
  Module: string
  Cultivar: string
  Stage: string
  Year: number
  Mean: number
  SD: number
  N: number
  SE: number
}

export type M5Sample = {
  SampleName: string
  Cultivar: string
  Year: number
  Stage: string
  Replicate: number
  M5: number
}

export type M5Contrast = {
  Module: string
  Stage: string
  Year: number
  contrast: string
  estimate: number
  SE: number
  df: number
  't.ratio': number
  'p.value': number
  CI_low_unadjusted: number
  CI_high_unadjusted: number
  FDR_global_90: number | null
  FDR_within_stage_year_10: number | null
  FDR_within_module_9: number | null
}

export type M5TrajectoryPayload = {
  schema_version: number
  module: string
  profiles: M5Profile[]
  samples: M5Sample[]
  contrasts: M5Contrast[]
}

export type HubRow = {
  Module: string
  Gene: string
  Rank_kWithin: number
  kWithin: number
  kWithin_per_possible_edge: number
  kME_signed: number
  abs_kME: number
  Top_decile_kWithin: boolean
  V3_gene: string | null
  V5_gene: string | null
  V5_Chr?: string | null
  V5_GeneStart?: number | null
  V5_GeneEnd?: number | null
  V3_MapMan_annotated?: boolean
  V5_MapMan_annotated?: boolean
  V3_stilbenoid_label?: boolean
  V5_CHS_label?: boolean
  V3_TF_label?: boolean
  V5_TF_label?: boolean
  V3_NAC_label?: boolean
  V5_NAC_label?: boolean
  V5_Pfam_CHS_STS_shared_domain?: boolean
  V5_Pfam_NAC_domain?: boolean
  V3_V5_STS_CHS_label_conflict?: boolean
  Harvest_CS_minus_PN_2012?: number | null
  Harvest_CS_minus_PN_2013?: number | null
  Harvest_CS_minus_PN_2014?: number | null
  Harvest_same_direction_all_years?: boolean
}

export type HubsPayload = {
  schema_version: number
  rows: HubRow[]
}

export type ExternalValidationRow = {
  Dataset: string
  Condition: string
  Platform: string
  Module: string
  Gene: string
  Rank_kWithin: number
  Top_decile_kWithin: boolean
  Primary_Harvest_sign_stable: boolean
  Assayed: boolean
  Complete_data: boolean
  Mean_CS_minus_PN: number | null
  Direction_matches_stable_primary: boolean | null
  BH_priority_361: number | null
  BH_prespecified_top37: number | null
}

export type ExternalValidationPayload = {
  schema_version: number
  rows: ExternalValidationRow[]
}

export type ProvenanceFile = {
  path: string
  sha256: string
  bytes: number
}

export type ProvenanceArtifact = {
  artifact_id: string
  sources: ProvenanceFile[]
  scripts: ProvenanceFile[]
  parameters: Record<string, unknown>
}

export type ProvenancePayload = {
  schema_version: number
  generated_at_utc: string
  repository_commit: string | null
  repository_commit_time: string | null
  artifacts: ProvenanceArtifact[]
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

export function loadHubs() {
  return fetchJson<HubsPayload>('hubs.json')
}

export function loadExternalValidation() {
  return fetchJson<ExternalValidationPayload>('external_validation.json')
}

export function loadProvenance() {
  return fetchJson<ProvenancePayload>('provenance.json')
}
