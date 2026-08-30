import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase/client';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted) {
          if (data.session) {
            toast.success('¡Autenticado con Google con éxito!');
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/login', { replace: true });
          }
        }
      } catch (err: any) {
        console.error('Error en AuthCallback:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'No se pudo completar la autenticación con Google.');
          toast.error('Error al verificar sesión de Google.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 3000);
        }
      }
    };

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-100 p-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl text-center flex flex-col items-center">
        {errorMsg ? (
          <>
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Error de Autenticación</h2>
            <p className="text-sm text-slate-400 mt-2">{errorMsg}</p>
            <p className="text-xs text-slate-500 mt-4">Redirigiendo a la pantalla principal...</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4 relative">
              <ShieldCheck className="w-7 h-7" />
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin absolute" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Verificando Credenciales</h2>
            <p className="text-sm text-slate-400 mt-2">
              Validando sesión segura con Google y sincronizando tu perfil en JobTracker...
            </p>
          </>
        )}
      </div>
    </div>
  );
};
