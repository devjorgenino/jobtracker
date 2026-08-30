import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Send,
  Puzzle,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useStore } from '../../context/store';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const jobs = useStore((state) => state.jobs);
  const sidebarCollapsed = useStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useStore((state) => state.toggleSidebar);

  const activeCount = jobs.filter((j) => !['rejected', 'archived'].includes(j.status)).length;

  const navItems = [
    {
      to: '/',
      label: 'Tablero Kanban',
      shortLabel: 'Kanban',
      icon: LayoutDashboard,
      badge: activeCount > 0 ? activeCount : undefined,
    },
    {
      to: '/optimize',
      label: 'Optimizar CV (ATS)',
      shortLabel: 'ATS AI',
      icon: Sparkles,
      highlight: true,
    },
    {
      to: '/strategy',
      label: 'Estrategia & Outreach',
      shortLabel: 'Estrategia',
      icon: Send,
    },
    {
      to: '/cv',
      label: 'Mi CV Maestro',
      shortLabel: 'CV Maestro',
      icon: FileText,
    },
    {
      to: '/extension',
      label: 'Extensión Web (1-Clic)',
      shortLabel: 'Extensión',
      icon: Puzzle,
    },
    {
      to: '/settings',
      label: 'OmniRoute & IA',
      shortLabel: 'Ajustes',
      icon: Settings,
    },
  ];

  return (
    <aside
      aria-label="Navegación principal"
      className={cn(
        'bg-slate-950/90 backdrop-blur-md border-r border-slate-800/80 flex flex-col h-screen fixed left-0 top-0 z-30 select-none transition-all duration-300 ease-in-out',
        sidebarCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Single Floating Toggle Button on Sidebar Border */}
      <button
        type="button"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
        title={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
        className="absolute -right-3.5 top-6 z-40 w-7 h-7 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/90 shadow-xl shadow-black/60 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:scale-110 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 text-blue-400" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-slate-300" />
        )}
      </button>

      {/* Brand Header */}
      <div
        className={cn(
          'border-b border-slate-800/80 flex items-center transition-all duration-300',
          sidebarCollapsed ? 'p-4 justify-center' : 'p-5 justify-start'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white transition-transform hover:scale-105">
            <Briefcase className="w-5 h-5" />
          </div>
          {!sidebarCollapsed && (
            <div className="min-w-0 overflow-hidden">
              <h1 className="font-bold text-sm text-slate-100 flex items-center gap-1.5 truncate">
                JobTracker{' '}
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 truncate">Career & ATS Suite</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {!sidebarCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition-opacity duration-200">
            Gestión & Postulaciones
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              title={sidebarCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center rounded-xl text-xs font-medium transition-all group cursor-pointer',
                  sidebarCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5',
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80',
                  item.highlight && !location.pathname.includes(item.to) && 'text-indigo-400 hover:text-indigo-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn('flex items-center', sidebarCollapsed ? 'justify-center' : 'gap-3')}>
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform group-hover:scale-110',
                        isActive && 'text-white'
                      )}
                    />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {/* Badge */}
                  {!sidebarCollapsed && item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  )}

                  {/* Collapsed Mini Badge Indicator */}
                  {sidebarCollapsed && item.badge !== undefined && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500 ring-2 ring-slate-950" />
                  )}

                  {/* Hover Floating Tooltip for Collapsed State */}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-slate-100 text-xs font-medium rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
                      {item.label}
                      {item.badge !== undefined && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
        {sidebarCollapsed ? (
          <div
            className="flex justify-center p-2 rounded-xl bg-slate-900/60 border border-slate-800/80 group relative cursor-pointer"
            title="OmniRoute AI Activo (Modelos gratuitos / locales)"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-slate-200 text-[11px] rounded-lg shadow-xl border border-slate-700/80 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50">
              OmniRoute AI Activo
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-300 truncate">OmniRoute AI Activo</p>
              <p className="text-[10px] text-slate-400 truncate">Modelos gratuitos / locales</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
