
import React from 'react';

interface IncidentDetailProps {
  onBack: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="h-10 w-10 rounded-full bg-surface-dark flex items-center justify-center text-white border border-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-white">Detalhes da Ocorrência</h1>
        <button className="h-10 w-10 rounded-full bg-surface-dark flex items-center justify-center text-white border border-white/5">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Hero Card */}
      <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-orange-600" />
        <div className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black tracking-widest uppercase">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                Crítico
              </span>
              <h2 className="text-3xl font-black text-white tracking-tighter">#INC-9283</h2>
              <p className="text-gray-400 font-medium">Falha de Transmissão</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tempo Decorrido</p>
              <p className="text-4xl font-mono font-bold text-primary tabular-nums tracking-tight">02:14:32</p>
            </div>
          </div>

          <div className="h-px w-full bg-white/5" />

          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined">router</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Node Afetado</p>
                <p className="text-lg font-bold text-white">SP_ZS_001</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Técnico</p>
                <p className="text-lg font-bold text-primary hover:underline cursor-pointer">João Silva</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: 'chat', label: 'WhatsApp', color: 'text-green-500' },
          { icon: 'person_add', label: 'Assignar', color: 'text-blue-500' },
          { icon: 'edit_note', label: 'Editar', color: 'text-orange-500' },
          { icon: 'check_circle', label: 'Fechar', color: 'text-gray-400' },
        ].map(action => (
          <button key={action.label} className="flex flex-col items-center gap-3 group">
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-3xl bg-surface-dark border border-white/5 flex items-center justify-center transition-all group-active:scale-95 group-hover:border-primary/30">
              <span className={`material-symbols-outlined text-3xl ${action.color}`}>{action.icon}</span>
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Technical Data Section */}
      <section className="space-y-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Dados Técnicos</h3>
        <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden">
          <div className="grid grid-cols-2 divide-x divide-white/5 border-b border-white/5">
            <div className="p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tecnologia</p>
              <p className="text-lg font-bold text-white">5G Standalone</p>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Impacto Estimado</p>
              <p className="text-lg font-bold text-primary">~1.5k Clientes</p>
            </div>
          </div>
          <div className="grid grid-cols-2 divide-x divide-white/5 border-b border-white/5">
            <div className="p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Causa Raiz</p>
              <p className="text-lg font-bold text-warning">Em Análise</p>
            </div>
            <div className="p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">SLA Restante</p>
              <p className="text-lg font-bold text-white">45 min</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Descrição do Erro</p>
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              Perda de pacotes intermitente identificada na interface de backhaul do Node SP_ZS_001. Alarmes correlacionados indicam possível degradação de fibra óptica na última milha.
            </p>
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Localização</h3>
          <button className="text-xs font-bold text-primary flex items-center gap-1">
            Abrir Mapa <span className="material-symbols-outlined text-sm">open_in_new</span>
          </button>
        </div>
        <div className="relative h-64 rounded-3xl overflow-hidden bg-background-dark border border-white/5">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXcr925QGN9vnfe5Ak_ipzThtO7V9YDeQL9bso8y4CBdLKJ-HaR0HW9OiS-Al5pjh5S2LzHJQt3Or0nm-3WEMgzE5CT7NgnYAhftGJ1GHBFHBdrWmtFIxW7u1hjoVyUTDciL8h7v_tkWXUBtA8BYQFZ8ZxFyh9hvc6hEI_U9UY2BZN-vwpLm3kFoSBQDaYYjwAA_G5HdJrmcp8DbsPz9g_YEcyczbWzKut1FLpJKuGSmoEN1G_rQEWfXORNSIQyJMEURe5qM2RRGg" alt="Map" className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-zoom-in" />
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 flex items-center gap-4">
            <div className="bg-primary p-3 rounded-2xl shadow-xl shadow-primary/40">
              <span className="material-symbols-outlined text-white filled">location_on</span>
            </div>
            <div>
              <p className="text-xs font-bold text-white/60">Endereço do Site</p>
              <p className="text-base font-bold text-white">Av. Paulista, 1000 - Bela Vista, SP</p>
            </div>
          </div>
        </div>
      </section>

      {/* Action History / Timeline */}
      <section className="space-y-6 pb-24">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">Histórico de Ações</h3>
        <div className="space-y-8 relative pl-6 border-l-2 border-white/5">
          <div className="relative">
            <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background-dark shadow-[0_0_10px_rgba(224,6,46,0.5)]" />
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-bold text-white">Técnico Assignado</p>
              <span className="text-xs font-bold text-gray-600">10:30</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">João Silva assumiu a ocorrência.</p>
          </div>
          <div className="relative">
            <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-gray-600 bg-background-dark" />
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-bold text-white">Alerta Enviado (n8n)</p>
              <span className="text-xs font-bold text-gray-600">10:15</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-[#25D366]/10 text-[#25D366] text-[10px] font-black px-2 py-0.5 rounded border border-[#25D366]/20 uppercase">
                WhatsApp
              </span>
            </div>
            <p className="text-sm text-gray-400 font-medium mt-1">Notificação enviada para grupo de Operações SP.</p>
          </div>
          <div className="relative">
            <div className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-gray-600 bg-background-dark" />
            <div className="flex justify-between items-start mb-1">
              <p className="text-sm font-bold text-white">Ticket Aberto</p>
              <span className="text-xs font-bold text-gray-600">10:00</span>
            </div>
            <p className="text-sm text-gray-400 font-medium">Incidente crítico detectado automaticamente pelo sistema de monitoramento.</p>
          </div>
        </div>
      </section>

      {/* Floating Action Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 z-40">
        <button className="w-full bg-primary hover:bg-primary-dark active:scale-[0.98] transition-all text-white font-bold py-5 rounded-2xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3">
          <span className="material-symbols-outlined">add_comment</span>
          Adicionar Nova Nota
        </button>
      </div>
    </div>
  );
};
