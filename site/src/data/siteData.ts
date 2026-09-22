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

export type ModuleContrast = {
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

export type ModuleContrastsPayload = {
  schema_version: number
  contrasts: ModuleContrast[]
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

export type M5NetworkEdge = {
  Gene1: string
  Gene2: string
  Pearson_r: number
  Beta10_unsigned_adjacency: number
  Pair_group: string
}

export type M5NetworkPayload = {
  schema_version: number
  edges: M5NetworkEdge[]
}

export type ExternalValidationRow = {
  Dataset: 'GSE72421' | 'PRJNA260535'
  Condition: string
  Platform: string
  Module: 'M5' | 'M10' | 'M2'
  Gene: string
  Rank_kWithin: number
  Top_decile_kWithin: boolean
  Primary_Harvest_CS_minus_PN_2012: number | null
  Primary_Harvest_CS_minus_PN_2013: number | null
  Primary_Harvest_CS_minus_PN_2014: number | null
  Baseline_Harvest_mean_2012_2014: number | null
  Primary_Harvest_sign_stable: boolean
  Assayed: boolean
  Complete_data: boolean
  CS_observed_replicates: number
  PN_observed_replicates: number
  Mean_CS: number | null
  Mean_PN: number | null
  Mean_CS_minus_PN: number | null
  Welch_p: number | null
  Welch_CI95_lower: number | null
  Welch_CI95_upper: number | null
  Direction_matches_stable_primary: boolean | null
  CS_replicates: number
  PN_replicates: number
  CS_log2CPM_ge_0_replicates: number | null
  PN_log2CPM_ge_0_replicates: number | null
  BH_priority_361: number | null
  BH_prespecified_top37: number | null
}

export type ExternalModuleSummary = {
  Dataset: 'GSE72421' | 'PRJNA260535'
  Condition: string
  Module: 'M5' | 'M10' | 'M2'
  Module_genes: number
  Assayed_genes: number
  Complete_data_genes: number
  Stable_primary_assayed_genes: number
  Direction_matched_stable_genes: number
  Top_hubs: number
  Assayed_top_hubs: number
  Complete_data_top_hubs: number
  Direction_matched_stable_top_hubs: number
  Top_hubs_BH37_lt_005: number
  Top_hubs_BH361_lt_005: number
}

export type ExternalDatasetSummary = {
  label: string
  platform: string
  year: number
  tissue: string
  primary_condition: string
  sensitivity_conditions: string[]
  audit_rows: number
  primary_target_samples: number
  primary_samples_by_cultivar: Record<string, number>
  stage_label: string
}

export type ExternalValidationPayload = {
  schema_version: 2
  rows: ExternalValidationRow[]
  module_summary: ExternalModuleSummary[]
  source_qc: Array<{ Metric: string; Value: string | number | boolean | null }>
  datasets: {
    GSE72421: ExternalDatasetSummary
    PRJNA260535: ExternalDatasetSummary
  }
  summary: {
    primary_hub_rows: number
    frozen_priority_genes: number | null
    frozen_top_decile_hubs: number | null
    comparison_rows: number | null
  }
}

export type T008RunStatus = 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING'

export type T008Run = {
  gsm: string
  sra_run: string
  cultivar: string
  stage: string
  year: number
  replicate: number
  library_layout: string
  fastq_md5: string
  fastq_total_bytes: number
  read_count: number
  status: T008RunStatus
  pipeline_stages: Record<string, string>
  percent_mapped: number | null
  processed_fragments: number | null
  mapped_fragments: number | null
  salmon_version: string | null
  validation: string | null
}

export type T008Event = {
  UTC: string
  SRA_Run: string
  Stage: string
  Status: string
  Detail: string | number | null
}

export type T008ProgressPayload = {
  schema_version: 2
  summary: {
    total_runs: number
    validated_runs: number
    failed_runs: number
    in_progress_runs: number
    pending_runs: number
    pending_or_running_runs: number
    progress_percent: number
    complete: boolean
    latest_event_utc: string | null
    total_fastq_bytes: number
    total_reads: number
    validated_fastq_bytes: number
    validated_reads: number
    mapping_percent_min: number | null
    mapping_percent_max: number | null
    mapping_percent_mean: number | null
  }
  runs: T008Run[]
  events: T008Event[]
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

export function loadModuleContrasts() {
  return fetchJson<ModuleContrastsPayload>('module_contrasts.json')
}

export function loadHubs() {
  return fetchJson<HubsPayload>('hubs.json')
}

export function loadM5Network() {
  return fetchJson<M5NetworkPayload>('m5_network.json')
}

export function loadExternalValidation() {
  return fetchJson<ExternalValidationPayload>('external_validation.json')
}

export function loadT008Progress() {
  return fetchJson<T008ProgressPayload>('t008_progress.json')
}

export function loadProvenance() {
  return fetchJson<ProvenancePayload>('provenance.json')
}
