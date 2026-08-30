import React from 'react';
import { Search, Plus, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useStore } from '../../context/store';

interface NavbarProps {
  onOpenAddJobModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddJobModal }) => {
  const { filters, setFilters, jobs, sidebarCollapsed, toggleSidebar } = useStore();

  const totalJobs = jobs.length;
  const appliedCount = jobs.filter((j) => ['applied', 'screening', 'technical', 'final_interview'].includes(j.status)).length;
  const offerCount = jobs.filter((j) => j.status === 'offer').length;

  return (
    <header className="h-16 bg-slate-950/60 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left side: Toggle button + Search Input */}
      <div className="flex items-center gap-3 w-72 md:w-96">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          title={sidebarCollapsed ? 'Expandir menú lateral' : 'Colapsar menú lateral'}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-800 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-blue-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar vacantes, empresas, tecnologías..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Stats and Action Buttons */}
      <div className="flex items-center gap-4">
        {/* Quick Stats Badges */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">Total:</span>
            <span className="font-bold text-slate-100">{totalJobs}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-2">
            <span className="text-blue-400/70">En Proceso:</span>
            <span className="font-bold text-blue-300">{appliedCount}</span>
          </div>
          {offerCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
              <span>🎉 Ofertas:</span>
              <span className="font-bold text-emerald-300">{offerCount}</span>
            </div>
          )}
        </div>

        {/* Add Job Button */}
        <button
          onClick={onOpenAddJobModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Vacante</span>
        </button>
      </div>
    </header>
  );
};
