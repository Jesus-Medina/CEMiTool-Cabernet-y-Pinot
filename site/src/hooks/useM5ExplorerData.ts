import { useEffect, useState } from 'react'
import {
  loadExternalValidation,
  loadHubs,
  loadM5Trajectory,
  loadProvenance,
  type ExternalValidationPayload,
  type HubsPayload,
  type M5TrajectoryPayload,
  type ProvenancePayload,
} from '../data/siteData'

type M5ExplorerData = {
  trajectory: M5TrajectoryPayload | null
  hubs: HubsPayload | null
  external: ExternalValidationPayload | null
  provenance: ProvenancePayload | null
  loading: boolean
  error: string | null
}

export function useM5ExplorerData(): M5ExplorerData {
  const [state, setState] = useState<M5ExplorerData>({
    trajectory: null,
    hubs: null,
    external: null,
    provenance: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true

    Promise.all([
      loadM5Trajectory(),
      loadHubs(),
      loadExternalValidation(),
      loadProvenance(),
    ])
      .then(([trajectory, hubs, external, provenance]) => {
        if (!active) return
        setState({
          trajectory,
          hubs,
          external,
          provenance,
          loading: false,
          error: null,
        })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          trajectory: null,
          hubs: null,
          external: null,
          provenance: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido al cargar M5',
        })
      })

    return () => {
      active = false
    }
  }, [])

  return state
}
