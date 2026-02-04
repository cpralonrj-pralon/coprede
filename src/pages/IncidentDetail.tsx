
import React from 'react';
import { useApp } from '../context/AppContext';
import { fetchIncidentHistory } from '../apiService';

interface IncidentDetailProps {
  onBack: () => void;
}

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ onBack }) => {
  // Fetch History Effect
  const [history, setHistory] = React.useState<any[]>([]);
  const { selectedIncidentId } = useApp(); // Assume this hook provides the ID

  React.useEffect(() => {
    if (selectedIncidentId) {
      const loadHistory = async () => {
        const data = await fetchIncidentHistory(selectedIncidentId);
        setHistory(data);
      };
      loadHistory();
    }
  }, [selectedIncidentId]);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* ... keeping header and hero ... */}
      <header className="flex items-center justify-between">
        <button onClick={onBack} className="h-10 w-10 rounded-full bg-surface-dark flex items-center justify-center text-white border border-white/5">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold text-white">Detalhes da Ocorrência</h1>
        <button className="h-10 w-10 rounded-full bg-surface-dark flex items-center justify-center text-white border border-white/5">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Hero Card - Placeholder Static Data for now, could be dynamic too */}
      <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-orange-600" />
        <div className="p-8 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-black tracking-widest uppercase">
                <span className="h-2 w-2 rounded-full bg-primary animate-ping" />
                Crítico
              </span>
              <h2 className="text-3xl font-black text-white tracking-tighter">#INC-{selectedIncidentId || '9283'}</h2>
              <p className="text-gray-400 font-medium">Falha de Transmissão</p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Tempo Decorrido</p>
              <p className="text-4xl font-mono font-bold text-primary tabular-nums tracking-tight">--:--:--</p>
            </div>
          </div>
          {/* ... existing static details ... */}
        </div>
      </div>

      {/* Journey Data Table */}
      <section className="space-y-6 pb-24">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Jornada do Incidente (Auditoria e Logs)</h3>
          <button className="h-8 px-4 rounded-lg bg-surface-dark text-[10px] font-black text-gray-400 border border-white/5 hover:bg-white/5 uppercase tracking-wider flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Exportar Relatório
          </button>
        </div>

        <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-background-dark/50">
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap">Data / Hora</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap">Campo Alterado</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap">Valor Anterior</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap">Novo Valor</th>
                  <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap text-right">Responsável</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-gray-500 font-medium italic">
                      Nenhum registro de histórico encontrado para este incidente.
                    </td>
                  </tr>
                ) : (
                  history.map((event, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white font-mono">
                            {new Date(event.alterado_em).toLocaleDateString()}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(event.alterado_em).toLocaleTimeString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 text-[10px] font-bold text-gray-300 uppercase tracking-wider border border-white/10">
                          <span className="material-symbols-outlined text-[12px] text-primary">edit</span>
                          {event.campo_alterado?.replace('nm_', '').replace('_', ' ') || 'SISTEMA'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-red-400/80 font-mono line-through decoration-red-500/30">
                          {event.valor_anterior || '-'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-green-400 font-bold font-mono bg-green-500/5 px-2 py-0.5 rounded border border-green-500/10">
                          {event.valor_novo}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{event.alterado_por || 'System Bot'}</span>
                          <div className="h-6 w-6 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-400">
                            {(event.alterado_por || 'SB').substring(0, 2).toUpperCase()}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-background-dark/30 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Auditoria de Segurança</span>
            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Total de Eventos: {history.length}</span>
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
