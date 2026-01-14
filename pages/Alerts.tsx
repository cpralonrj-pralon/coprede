
import React, { useState } from 'react';

export const Alerts: React.FC = () => {
  const [message, setMessage] = useState('');
  const maxChars = 500;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-8 pb-32">
      <header className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white">Nova Notificação</h1>
      </header>

      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white px-2">Destinatários</h3>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-gray-500">search</span>
          </div>
          <input 
            type="text" 
            placeholder="Buscar grupos, gestores ou equipes"
            className="w-full bg-surface-dark border-white/5 rounded-2xl pl-14 pr-4 py-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-primary outline-none transition-all shadow-lg"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          <button className="flex-shrink-0 bg-primary px-5 py-2 rounded-full text-white text-xs font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">group</span> Todos
          </button>
          <button className="flex-shrink-0 bg-surface-dark px-5 py-2 rounded-full text-gray-400 text-xs font-bold border border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">engineering</span> Equipes
          </button>
          <button className="flex-shrink-0 bg-surface-dark px-5 py-2 rounded-full text-gray-400 text-xs font-bold border border-white/5 flex items-center gap-2">
            <span className="material-symbols-outlined text-base">admin_panel_settings</span> Gestores
          </button>
        </div>

        <div className="bg-surface-dark rounded-3xl border border-white/5 p-2 space-y-1">
          {[
            { name: 'COP - Nível 1', info: 'Grupo Geral • 12 Membros', checked: true },
            { name: 'Gestão Regional SP', info: 'Gerência • 4 Membros', checked: false },
            { name: 'Técnicos de Campo', info: 'Operacional • 45 Membros', checked: false },
          ].map((item, i) => (
            <label key={i} className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl cursor-pointer transition-colors group">
              <input 
                type="checkbox" 
                defaultChecked={item.checked}
                className="h-6 w-6 rounded-lg bg-transparent border-white/10 text-primary focus:ring-offset-background-dark focus:ring-primary" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-white">{item.name}</span>
                <span className="text-xs text-gray-500 font-medium">{item.info}</span>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-bold text-white px-2">Mensagem</h3>
        
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Templates Rápidos</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            <button className="flex-shrink-0 px-4 py-2 bg-primary/10 border border-primary/20 text-primary rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">fiber_manual_record</span> Massiva
            </button>
            <button className="flex-shrink-0 px-4 py-2 bg-orange-500/10 border border-orange-500/20 text-orange-500 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">cable</span> Rompimento
            </button>
            <button className="flex-shrink-0 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 rounded-xl text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">build</span> Manutenção
            </button>
          </div>
        </div>

        <div className="relative">
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
            className="w-full h-48 bg-surface-dark border-none rounded-3xl p-6 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary outline-none transition-all shadow-lg resize-none font-medium"
            placeholder="Descreva a ocorrência, previsão de normalização e impactos..."
          />
          <div className="absolute bottom-6 right-6 text-[10px] font-black text-gray-600 uppercase">
            {message.length}/{maxChars}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 bg-surface-dark rounded-3xl border border-white/5">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">priority_high</span>
            </div>
            <span className="font-bold text-white">Alta Prioridade</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" />
            <div className="w-14 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary after:shadow-sm"></div>
          </label>
        </div>
      </section>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-background-dark/80 backdrop-blur-xl border-t border-white/5 md:relative md:bg-transparent md:border-none md:p-0">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="flex items-center justify-center gap-2 opacity-60">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-tighter">n8n Gateway: Online</span>
          </div>
          <button className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-bold py-5 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">send</span>
            Enviar Alerta
          </button>
        </div>
      </div>
    </div>
  );
};
