import { Route, Routes } from 'react-router-dom'
import SiteShell from './SiteShell'
import EnrichmentPage from './EnrichmentPage'
import {
  EvidencePage,
  GeneDetailPage,
  HomePage,
  MethodsPage,
  ModuleDetailPage,
  ModulesPage,
  NotFoundPage,
  StoryPage,
  T008Page,
  ValidationPage,
} from './pages'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<HomePage />} />
        <Route path="story" element={<StoryPage />} />
        <Route path="modules" element={<ModulesPage />} />
        <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
        <Route path="enrichment" element={<EnrichmentPage />} />
        <Route path="genes/:geneId" element={<GeneDetailPage />} />
        <Route path="validation" element={<ValidationPage />} />
        <Route path="t008" element={<T008Page />} />
        <Route path="methods" element={<MethodsPage />} />
        <Route path="evidence" element={<EvidencePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
