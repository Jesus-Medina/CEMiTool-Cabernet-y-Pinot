import { Route, Routes } from 'react-router-dom'
import SiteShell from './SiteShell'
import EnrichmentPage from './EnrichmentPage'
import ChatPage from './ChatPage'
import {
  EvidencePage,
  GeneSearchPage,
  GeneDetailPage,
  HomePage,
  MethodsPage,
  ModuleDetailPage,
  ModulesPage,
  NotFoundPage,
  StoryPage,
  T008Page,
  ValidationPage,
  ResultsPage,
} from './pages'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        {/* V2 Primary Routes */}
        <Route index element={<HomePage />} />
        <Route path="results" element={<ResultsPage />} />
        <Route path="results/modules/:moduleId" element={<ModuleDetailPage />} />
        <Route path="results/genes" element={<GeneSearchPage />} />
        <Route path="results/genes/:geneId" element={<GeneDetailPage />} />
        <Route path="methods" element={<MethodsPage />} />
        <Route path="reproducibility" element={<EvidencePage />} /> {/* Temporalmente usamos EvidencePage */}
        
        {/* Legacy / Utility Routes (not in primary nav) */}
        <Route path="story" element={<StoryPage />} />
        <Route path="modules" element={<ModulesPage />} />
        <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
        <Route path="enrichment" element={<EnrichmentPage />} />
        <Route path="genes/:geneId" element={<GeneDetailPage />} />
        <Route path="validation" element={<ValidationPage />} />
        <Route path="t008" element={<T008Page />} />
        <Route path="evidence" element={<EvidencePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
