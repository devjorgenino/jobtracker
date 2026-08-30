import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Send,
  Puzzle,
  Settings,
  Briefcase,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useStore } from '../../context/store';

export const Sidebar: React.FC = () => {
  const jobs = useStore((state) => state.jobs);
  const activeCount = jobs.filter((j) => !['rejected', 'archived'].includes(j.status)).length;

  const navItems = [
    {
      to: '/',
      label: 'Tablero Kanban',
      icon: LayoutDashboard,
      badge: activeCount > 0 ? activeCount : undefined,
    },
    {
      to: '/optimize',
      label: 'Optimizar CV (ATS)',
      icon: Sparkles,
      highlight: true,
    },
    {
      to: '/strategy',
      label: 'Estrategia & Outreach',
      icon: Send,
    },
    {
      to: '/cv',
      label: 'Mi CV Maestro',
      icon: FileText,
    },
    {
      to: '/extension',
      label: 'Extensión Web (1-Clic)',
      icon: Puzzle,
    },
    {
      to: '/settings',
      label: 'OmniRoute & IA',
      icon: Settings,
    },
  ];

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-md border-r border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
            JobTracker <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">AI</span>
          </h1>
          <p className="text-[11px] text-slate-400">Career & ATS Suite</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Gestión & Postulaciones
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80',
                  item.highlight && !location.pathname.includes(item.to) && 'text-indigo-400 hover:text-indigo-300'
                )
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-slate-300 truncate">OmniRoute AI Activo</p>
            <p className="text-[10px] text-slate-400 truncate">Modelos gratuitos / locales</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
