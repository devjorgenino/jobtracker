import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { KanbanPage } from './pages/KanbanPage';
import { OptimizePage } from './pages/OptimizePage';
import { StrategyPage } from './pages/StrategyPage';
import { CVPage } from './pages/CVPage';
import { ExtensionPage } from './pages/ExtensionPage';
import { SettingsPage } from './pages/SettingsPage';
import { Toaster } from 'sonner';
import { useStore } from './context/store';

export function App() {
  const theme = useStore((state) => state.theme);

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors theme={theme} closeButton />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<KanbanPage />} />
          <Route path="/kanban" element={<KanbanPage />} />
          <Route path="/optimize" element={<OptimizePage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/assistant" element={<StrategyPage />} />
          <Route path="/cv" element={<CVPage />} />
          <Route path="/extension" element={<ExtensionPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
