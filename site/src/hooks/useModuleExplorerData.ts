import { useEffect, useState } from 'react'
import {
  loadExternalValidation,
  loadHubs,
  loadModuleContrasts,
  loadModules,
  type ExternalValidationPayload,
  type HubsPayload,
  type ModuleContrast,
  type ModulesPayload,
} from '../data/siteData'
import {
  loadFunctionalEnrichment,
  type FunctionalEnrichmentPayload,
} from '../data/enrichmentData'

export type ModuleExplorerData = {
  modules: ModulesPayload
  contrasts: ModuleContrast[]
  hubs: HubsPayload
  external: ExternalValidationPayload
  enrichment: FunctionalEnrichmentPayload
}

export function useModuleExplorerData() {
  const [data, setData] = useState<ModuleExplorerData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([
      loadModules(),
      loadModuleContrasts(),
      loadHubs(),
      loadExternalValidation(),
      loadFunctionalEnrichment(),
    ])
      .then(([modules, contrasts, hubs, external, enrichment]) => {
        if (!active) return
        setData({
          modules,
          contrasts: contrasts.contrasts,
          hubs,
          external,
          enrichment,
        })
      })
      .catch((reason: unknown) => {
        if (!active) return
        setError(reason instanceof Error ? reason.message : 'No se pudo cargar el explorador de módulos')
      })

    return () => {
      active = false
    }
  }, [])

  return { data, error }
}
