import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, Loader2 } from 'lucide-react';

export const ProtectedRoute: React.FC = () => {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // Si aún está resolviendo el token de sesión inicial
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25 text-white animate-pulse">
            <Briefcase className="w-7 h-7" />
          </div>
          <div className="flex items-center gap-2.5 text-slate-400 text-sm font-medium">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>Cargando tu espacio de trabajo...</span>
          </div>
        </div>
      </div>
    );
  }

  // Si Supabase está configurado pero no hay sesión activa, redirigir al login
  if (!user && isConfigured) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si no está configurado Supabase (modo offline/local puro) o si el usuario está autenticado, renderizar la aplicación
  return <Outlet />;
};
