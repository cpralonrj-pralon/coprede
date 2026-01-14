
import React, { useState } from 'react';
import { MonitorTable } from '../components/MonitorTable';

interface MonitorProps {
    onBack: () => void;
}

export const Monitor: React.FC<MonitorProps> = ({ onBack }) => {
    const [selectedIncident, setSelectedIncident] = useState<any | null>(null);

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-xl">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="h-10 w-10 rounded-xl bg-background-dark flex items-center justify-center text-white border border-white/5 hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight">Monitor de Rede</h1>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mt-0.5">Visão Unificada: NewMonitor & SGO</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success animate-ping" />
                    <span className="text-[10px] font-black text-success uppercase tracking-widest">Live Connect</span>
                </div>
            </header>

            {/* Main Monitoring Table */}
            <section className="space-y-4">
                <div className="flex justify-between items-center px-2">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Ocorrências Ativas</h3>
                    <div className="flex gap-2">
                        <button className="h-8 px-3 rounded-lg bg-white/5 text-[10px] font-black text-gray-400 uppercase tracking-tighter hover:bg-white/10 transition-all border border-white/5">Exportar CSV</button>
                        <button className="h-8 px-3 rounded-lg bg-primary/10 text-[10px] font-black text-primary uppercase tracking-tighter hover:bg-primary/20 transition-all border border-primary/20">Filtro Avançado</button>
                    </div>
                </div>
                <MonitorTable onSelect={setSelectedIncident} />
            </section>

            {/* Dynamic Details Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="lg:col-span-2 space-y-6">
                    <div className={`bg-surface-dark p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden group transition-all ${selectedIncident ? 'border-primary/30 ring-1 ring-primary/20' : ''}`}>
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <span className="material-symbols-outlined text-[120px]">
                                {selectedIncident?.source === 'SGO' ? 'emergency' : 'analytics'}
                            </span>
                        </div>

                        {selectedIncident ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest mb-2 inline-block ${selectedIncident.source === 'NewMonitor' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                            }`}>
                                            ID: {selectedIncident.id}
                                        </span>
                                        <h4 className="text-3xl font-black text-white tracking-tighter leading-tight italic">
                                            {selectedIncident.title}
                                        </h4>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Registrado em</p>
                                        <p className="text-sm font-mono text-primary font-bold">{selectedIncident.time}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-background-dark/50 px-5 py-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Localidade Afetada</p>
                                        <div className="flex items-center gap-2 text-lg font-bold text-white">
                                            <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                                            {selectedIncident.location}
                                        </div>
                                    </div>
                                    <div className="bg-background-dark/50 px-5 py-4 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Plataforma</p>
                                        <div className="flex items-center gap-2 text-lg font-bold text-white">
                                            <span className="material-symbols-outlined text-success text-xl">hub</span>
                                            {selectedIncident.source} API
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-xs uppercase tracking-widest">
                                        Abrir Tratativa SGO
                                    </button>
                                    <button className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-white border border-white/10 hover:bg-white/10 transition-colors">
                                        <span className="material-symbols-outlined">share</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h4 className="text-xl font-black text-white mb-2 italic">Dashboard Analítico</h4>
                                <p className="text-sm text-gray-400 font-medium mb-6">Selecione uma linha na tabela acima para visualizar o detalhamento técnico, logs do sistema e histórico de tratativas em tempo real.</p>
                                <div className="flex gap-4">
                                    <div className="bg-background-dark/50 px-4 py-3 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-1">Impacto Total</p>
                                        <p className="text-lg font-bold text-white">--</p>
                                    </div>
                                    <div className="bg-background-dark/50 px-4 py-3 rounded-2xl border border-white/5">
                                        <p className="text-[10px] font-black text-gray-500 uppercase mb-1">SLA Crítico</p>
                                        <p className="text-lg font-bold text-primary">--</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-surface-dark p-6 rounded-3xl border border-white/5 shadow-xl">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 px-2">Logs Rápidos</h4>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-white leading-tight">Sync concluído com sucesso</p>
                                    <p className="text-[10px] text-gray-600 font-medium">Há {i * 5} minutos • Sistema Central</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
