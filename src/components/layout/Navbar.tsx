import React from 'react';
import { Search, Plus, Sun, Moon } from 'lucide-react';
import { useStore } from '../../context/store';

interface NavbarProps {
  onOpenAddJobModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddJobModal }) => {
  const { filters, setFilters, jobs, theme, toggleTheme } = useStore();

  const totalJobs = jobs.length;
  const appliedCount = jobs.filter((j) =>
    ['applied', 'screening', 'technical', 'final_interview'].includes(j.status)
  ).length;
  const offerCount = jobs.filter((j) => j.status === 'offer').length;

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200">
      {/* Search Input */}
      <div className="relative w-64 sm:w-80 md:w-96">
        <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar vacantes, empresas, tecnologías..."
          value={filters.search}
          onChange={(e) => setFilters({ search: e.target.value })}
          className="w-full pl-9.5 pr-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/90 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
        />
      </div>

      {/* Stats, Theme Toggle, and Action Buttons */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Stats Badges */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shadow-2xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Total:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{totalJobs}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 flex items-center gap-1.5 shadow-2xs">
            <span className="text-blue-600/80 dark:text-blue-400/70 font-medium">En Proceso:</span>
            <span className="font-bold text-blue-700 dark:text-blue-300">{appliedCount}</span>
          </div>
          {offerCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 shadow-2xs animate-pulse">
              <span>🎉</span>
              <span className="text-emerald-700/80 dark:text-emerald-300/80 font-medium">Ofertas:</span>
              <span className="font-bold text-emerald-800 dark:text-emerald-300">{offerCount}</span>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          title={theme === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer shadow-2xs flex items-center justify-center"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>

        {/* Add Job Button */}
        <button
          onClick={onOpenAddJobModal}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Nueva Vacante</span>
          <span className="sm:hidden">Nueva</span>
        </button>
      </div>
    </header>
  );
};
