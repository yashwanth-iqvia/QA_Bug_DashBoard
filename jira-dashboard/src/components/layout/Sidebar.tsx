import { Bug, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AppModule = 'bugs' | 'releases';

interface SidebarProps {
  activeModule: AppModule;
  onNavigate: (module: AppModule) => void;
  collapsed?: boolean;
}

const NAV_ITEMS: { id: AppModule; label: string; icon: typeof Bug; emoji?: string }[] = [
  { id: 'bugs', label: 'Bugs', icon: Bug },
  { id: 'releases', label: 'Releases', icon: Package, emoji: '📦' },
];

export function Sidebar({ activeModule, onNavigate, collapsed = false }: SidebarProps) {
  return (
    <aside
      className={cn(
        'sticky top-[73px] z-20 flex h-[calc(100vh-73px)] shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p
          className={cn(
            'mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400',
            collapsed && 'sr-only',
          )}
        >
          Navigation
        </p>
        {NAV_ITEMS.map((item) => {
          const active = activeModule === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              title={item.label}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                collapsed && 'justify-center px-2',
              )}
            >
              {item.emoji && !collapsed ? (
                <span className="text-base leading-none" aria-hidden>
                  {item.emoji}
                </span>
              ) : (
                <Icon size={18} className={active ? 'text-blue-600 dark:text-blue-400' : ''} />
              )}
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
