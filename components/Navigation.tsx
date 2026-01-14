
import React from 'react';

type View = 'login' | 'dashboard' | 'incident' | 'users' | 'alerts' | 'reports';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'incident', label: 'Monitor', icon: 'monitoring' },
    { id: 'users', label: 'Equipes', icon: 'group' },
    { id: 'alerts', label: 'Alertas', icon: 'notifications' },
    { id: 'reports', label: 'Relatórios', icon: 'description' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-surface-dark border-r border-white/5 flex-col justify-between py-6 px-4">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-white text-2xl">hub</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-white">COP Rede</span>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as View)}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                  currentView === item.id 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-2xl group-hover:scale-110 transition-transform ${currentView === item.id ? 'filled' : ''}`}>
                  {item.icon}
                </span>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4">
          <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group">
            <span className="material-symbols-outlined text-gray-400 group-hover:text-white">settings</span>
            <span className="font-medium text-sm text-gray-400 group-hover:text-white">Ajustes</span>
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 p-3 rounded-xl text-primary hover:bg-primary/10 transition-colors group"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-medium text-sm">Sair</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-dark/95 backdrop-blur-lg border-t border-white/10 px-4 py-2 flex justify-around items-center safe-area-bottom">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as View)}
            className={`flex flex-col items-center gap-1 w-full py-1 ${
              currentView === item.id ? 'text-primary' : 'text-gray-500'
            }`}
          >
            <span className={`material-symbols-outlined text-[24px] ${currentView === item.id ? 'filled' : ''}`}>
              {item.icon}
            </span>
            <span className="text-[10px] font-semibold">{item.label}</span>
          </button>
        ))}
      </nav>
    </>
  );
};
