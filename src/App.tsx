import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { ToastProvider } from '@/components/common/Toast';
import KanbanPage from '@/pages/KanbanPage';
import CVPage from '@/pages/CVPage';
import OptimizePage from '@/pages/OptimizePage';
import AssistantPage from '@/pages/AssistantPage';
import { qwenService } from '@/services/qwen';
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    qwenService.loadConfigFromStore();
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-white focus:rounded-md focus:outline-none"
        >
          Saltar al contenido principal
        </a>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<KanbanPage />} />
            <Route path="/cv" element={<CVPage />} />
            <Route path="/optimize" element={<OptimizePage />} />
            <Route path="/assistant" element={<AssistantPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
