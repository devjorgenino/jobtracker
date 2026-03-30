import { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Sparkles, MessageSquare, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SidebarProps {
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Solicitudes', description: 'Ver tablero de candidaturas' },
  { to: '/cv', icon: FileText, label: 'CV', description: 'Gestionar currículums' },
  { to: '/optimize', icon: Sparkles, label: 'Optimizador', description: 'Optimizar CV con IA' },
  { to: '/assistant', icon: MessageSquare, label: 'Asistente', description: 'Generar mensajes' },
];

export const Sidebar = memo(function Sidebar({ onClose, isCollapsed, onToggleCollapse }: SidebarProps) {
  return (
    <aside 
      className={cn(
        'h-screen bg-surface border-r border-border flex flex-col flex-shrink-0 relative transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-64'
      )}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className={cn(
        'p-4 border-b border-border flex items-center justify-between min-h-[64px]',
        isCollapsed && 'p-2 justify-center'
      )}>
        {!isCollapsed && (
          <h1 className="text-lg font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent flex-shrink-0" aria-hidden="true" />
            <span className="truncate">JobTracker</span>
          </h1>
        )}
        {isCollapsed && (
          <Sparkles className="w-6 h-6 text-accent flex-shrink-0" aria-hidden="true" />
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 hover:bg-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent rounded-md"
            aria-label="Cerrar menú de navegación"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        )}
      </div>
      
      <nav className={cn('flex-1 p-3 overflow-y-auto', isCollapsed && 'p-2')}>
        <ul className="space-y-1" role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    'focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface',
                    isActive
                      ? 'bg-accent text-white shadow-sm'
                      : 'text-text-muted hover:bg-white hover:text-primary hover:shadow-sm',
                    isCollapsed && 'justify-center px-2'
                  )
                }
                title={isCollapsed ? item.label : undefined}
              >
                {({ isActive }) => (
                  <>
                    <item.icon 
                      className={cn(
                        'w-5 h-5 flex-shrink-0',
                        isActive ? 'text-white' : 'text-text-muted'
                      )} 
                      aria-hidden="true" 
                    />
                    {!isCollapsed && (
                      <div className="flex flex-col text-left">
                        <span className={cn('truncate', isActive && 'text-white')}>{item.label}</span>
                        <span className={cn('text-xs font-normal', isActive ? 'text-white/70' : 'text-text-muted')}>{item.description}</span>
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toggle collapse button - siempre visible en desktop */}
      {onToggleCollapse && (
        <button
          onClick={onToggleCollapse}
          className={cn(
            'absolute top-12 right-0 translate-x-1/2 w-6 h-6 bg-white border border-border rounded-full flex items-center justify-center shadow-sm',
            'hover:bg-surface hover:shadow-md transition-all z-20 focus:outline-none focus:ring-2 focus:ring-accent'
          )}
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          aria-pressed={isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
          )}
        </button>
      )}

      <div className={cn('p-4 border-t border-border', isCollapsed && 'p-2')}>
        {!isCollapsed && (
          <p className="text-xs text-text-muted text-center">
            JobTracker AI v1.0
          </p>
        )}
      </div>
    </aside>
  );
});
