import { Navigate, Route, Routes } from 'react-router-dom'
import SiteShell from './SiteShell'
import EnrichmentPage from './EnrichmentPage'
import ChatPage from './ChatPage'
import SearchPage from './SearchPage'
import {
  EvidencePage,
  GeneDetailPage,
  HomePage,
  MethodsPage,
  ModuleDetailPage,
  ResultsLandingPage,
  ModulesPage,
  NotFoundPage,
  T008Page,
  ValidationPage,
} from './pages'

export default function App() {
  return (
    <Routes>
      <Route element={<SiteShell />}>
        <Route index element={<HomePage />} />
        <Route path="story" element={<Navigate to="/" replace />} />
        <Route path="results" element={<ResultsLandingPage />} />
        <Route path="results/modules" element={<ModulesPage />} />
        <Route path="results/modules/:moduleId" element={<ModuleDetailPage />} />
        <Route path="results/function" element={<EnrichmentPage />} />
        <Route path="results/validation" element={<ValidationPage />} />
        <Route path="results/genes" element={<SearchPage />} />
        <Route path="results/genes/:geneId" element={<GeneDetailPage />} />

        <Route path="modules" element={<ModulesPage />} />
        <Route path="modules/:moduleId" element={<ModuleDetailPage />} />
        <Route path="enrichment" element={<EnrichmentPage />} />
        <Route path="genes/:geneId" element={<GeneDetailPage />} />
        <Route path="validation" element={<ValidationPage />} />
        <Route path="status/t008" element={<T008Page />} />
        <Route path="t008" element={<T008Page />} />
        <Route path="methods" element={<MethodsPage />} />
        <Route path="reproducibility" element={<EvidencePage />} />
        <Route path="evidence" element={<EvidencePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="ask" element={<ChatPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
