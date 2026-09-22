export type EnrichmentSourceId = 'v3_mapman' | 'v5_mapman' | 'go'

export type EnrichmentSource = {
  id: EnrichmentSourceId
  label: string
  role: 'primary' | 'secondary'
  current: boolean
  notes: string
}

export type EnrichmentTerm = {
  Source: EnrichmentSourceId
  Module: string
  Aspect: string | null
  TermID: string
  TermName: string
  Background_N: number
  Module_n: number
  Term_background_K: number
  Overlap_k: number
  Expected_overlap: number | null
  Fold_enrichment: number | null
  p_value: number
  FDR_within_module: number | null
  FDR_global_module_terms: number | null
}

export type EnrichmentTheme = {
  Source: 'v3_mapman' | 'v5_mapman'
  Theme: string
  Module: string
  Matched_MapMan_terms: number
  Background_N: number
  Module_n: number
  Theme_background_K: number
  Overlap_k: number
  Expected_overlap: number
  Fold_enrichment: number | null
  Tested: boolean
  Reason_if_not_tested: string | null
  p_value: number | null
  Hit_genes: string | null
  FDR_global_themes: number | null
  Coverage_warning: boolean
}

export type EnrichmentQC = {
  Source: EnrichmentSourceId
  Module: string
  Assigned_module_genes: number
  Annotated_module_genes: number
  Coverage_percent: number
  Background_annotated_genes: number
  Terms_tested: number
  Global_FDR_hits: number
  Coverage_warning: boolean
}

export type FunctionalEnrichmentPayload = {
  schema_version: number
  sources: EnrichmentSource[]
  summary: {
    tested_terms: Record<EnrichmentSourceId, number>
    global_fdr05_hits: Record<EnrichmentSourceId, number>
    go_audit: Record<string, string | number | boolean | null>
    go_superseded_historical_table: string
    go_current_table: string
  }
  terms: EnrichmentTerm[]
  themes: EnrichmentTheme[]
  qc: EnrichmentQC[]
}

let request: Promise<FunctionalEnrichmentPayload> | null = null

export function loadFunctionalEnrichment() {
  if (!request) {
    request = fetch(`${import.meta.env.BASE_URL}data/functional_enrichment.json`).then(async (response) => {
      if (!response.ok) {
        throw new Error(`No se pudo cargar functional_enrichment.json (HTTP ${response.status})`)
      }
      return response.json() as Promise<FunctionalEnrichmentPayload>
    })
  }
  return request
}
