
import React from 'react';

export const Reports: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-10 pb-32">
      <header>
        <h1 className="text-2xl font-bold text-white tracking-tight">Exportar Relatórios</h1>
      </header>

      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white px-2">Período de Análise</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full border border-white/10 text-gray-400 text-sm font-bold hover:bg-primary/10 transition-colors">Hoje</button>
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full border border-white/10 text-gray-400 text-sm font-bold hover:bg-primary/10 transition-colors">7 dias</button>
          <button className="flex-shrink-0 px-6 py-2.5 rounded-full bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20">Personalizado</button>
        </div>

        <div className="bg-surface-dark border border-white/5 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <button className="h-10 w-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <p className="font-black text-lg text-white">Outubro 2023</p>
            <button className="h-10 w-10 rounded-full hover:bg-white/5 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-y-4">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
              <div key={d} className="text-center text-[10px] font-black text-gray-600 uppercase">{d}</div>
            ))}
            {/* Calendar Days Simulation */}
            {Array.from({ length: 14 }, (_, i) => i + 1).map(day => {
              const isSelected = day >= 5 && day <= 7;
              const isStart = day === 5;
              const isEnd = day === 7;
              
              return (
                <div 
                  key={day} 
                  className={`relative flex items-center justify-center h-12 ${isSelected ? 'bg-primary/10' : ''} ${isStart ? 'rounded-l-2xl' : ''} ${isEnd ? 'rounded-r-2xl' : ''}`}
                >
                  <button className={`h-10 w-10 rounded-full text-sm font-bold transition-all ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-gray-400 hover:bg-white/5'}`}>
                    {day}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white px-2">Filtros de Rede</h3>
        <div className="flex flex-wrap gap-3">
          {['2G', '3G', '4G', '5G', 'Fibra'].map(tech => (
            <button 
              key={tech}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold border transition-all ${['2G', '4G', '5G'].includes(tech) ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-surface-dark border-white/5 text-gray-400'}`}
            >
              {['2G', '4G', '5G'].includes(tech) && <span className="material-symbols-outlined text-base">check</span>}
              {tech}
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white px-2">Formato de Exportação</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'excel', label: 'Excel', icon: 'table_view', active: true },
            { id: 'csv', label: 'CSV', icon: 'description', active: false },
            { id: 'json', label: 'JSON', icon: 'data_object', active: false },
          ].map(fmt => (
            <button key={fmt.id} className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all ${fmt.active ? 'bg-primary/5 border-primary shadow-inner' : 'bg-surface-dark border-white/5 grayscale opacity-60'}`}>
              <span className={`material-symbols-outlined text-4xl mb-3 ${fmt.active ? 'text-primary' : 'text-gray-500'}`}>{fmt.icon}</span>
              <span className={`text-xs font-black uppercase tracking-widest ${fmt.active ? 'text-white' : 'text-gray-600'}`}>{fmt.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xl font-bold text-white">Downloads Recentes</h3>
          <button className="text-xs font-bold text-primary">Ver todos</button>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Relatório_Rede_Out.xlsx', date: '14 Out', size: '2.4 MB', icon: 'table_view', color: 'text-success' },
            { name: 'Ocorrências_Setembro.csv', date: '01 Out', size: '450 KB', icon: 'description', color: 'text-blue-500' },
          ].map((file, i) => (
            <div key={i} className="flex items-center justify-between p-5 bg-surface-dark rounded-3xl border border-white/5 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 bg-white/5 rounded-2xl flex items-center justify-center">
                  <span className={`material-symbols-outlined text-2xl ${file.color}`}>{file.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">{file.date} • {file.size}</p>
                </div>
              </div>
              <button className="h-12 w-12 rounded-full hover:bg-white/10 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                <span className="material-symbols-outlined">download</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 md:relative md:bg-transparent md:border-none md:p-0">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-between items-center px-2 font-black text-[10px] uppercase tracking-tighter text-gray-500">
            <span>Estimativa: <span className="text-white">~1.2 MB</span></span>
            <span>Linhas: <span className="text-white">452</span></span>
          </div>
          <button className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-bold py-5 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">download</span>
            Gerar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
