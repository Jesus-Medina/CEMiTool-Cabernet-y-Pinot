import { useEffect, useState } from 'react'
import {
  loadM5Trajectory,
  loadModules,
  loadProjectSummary,
  type M5TrajectoryPayload,
  type ModulesPayload,
  type ProjectSummary,
} from '../data/siteData'

type CanonicalData = {
  project: ProjectSummary | null
  modules: ModulesPayload | null
  m5: M5TrajectoryPayload | null
  loading: boolean
  error: string | null
}

export function useCanonicalData(): CanonicalData {
  const [state, setState] = useState<CanonicalData>({
    project: null,
    modules: null,
    m5: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let active = true

    Promise.all([loadProjectSummary(), loadModules(), loadM5Trajectory()])
      .then(([project, modules, m5]) => {
        if (!active) return
        setState({ project, modules, m5, loading: false, error: null })
      })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          project: null,
          modules: null,
          m5: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Error desconocido al cargar datos canónicos',
        })
      })

    return () => {
      active = false
    }
  }, [])

  return state
}
