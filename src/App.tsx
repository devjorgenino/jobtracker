import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './pages/LandingPage';
import { KanbanPage } from './pages/KanbanPage';
import { OptimizePage } from './pages/OptimizePage';
import { StrategyPage } from './pages/StrategyPage';
import { CVPage } from './pages/CVPage';
import { ExtensionPage } from './pages/ExtensionPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'sonner';
import { useStore } from './context/store';

export function App() {
  const theme = useStore((state) => state.theme);

  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors theme={theme} closeButton />
        <Routes>
          {/* Landing Page Pública */}
          <Route path="/" element={<LandingPage />} />

          {/* Rutas Públicas de Autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Rutas Protegidas de la Aplicación (Requieren Iniciar Sesión) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<KanbanPage />} />
              <Route path="/kanban" element={<Navigate to="/dashboard" replace />} />
              <Route path="/optimize" element={<OptimizePage />} />
              <Route path="/strategy" element={<StrategyPage />} />
              <Route path="/assistant" element={<StrategyPage />} />
              <Route path="/cv" element={<CVPage />} />
              <Route path="/extension" element={<ExtensionPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
