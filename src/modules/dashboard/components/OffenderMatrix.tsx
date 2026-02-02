import React, { useState } from 'react';

// Use loose type to avoid strict dependency if types file varies, 
// but aligning with OperationalIncident
interface IncidentRow {
    id_mostra: string;
    nm_tipo: string;
    nm_cidade: string;
    nm_status: string;
    topologia: string;
    dh_inicio: string;
    regional: string;
    ds_sumario?: string; // Add field
}

interface OffenderMatrixProps {
    incidents: IncidentRow[];
}

export const OffenderMatrix: React.FC<OffenderMatrixProps> = ({ incidents }) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Sort by Duration (Oldest first) implies "Offender" logic
    const sortedIncidents = [...incidents].sort((a, b) => {
        return new Date(a.dh_inicio).getTime() - new Date(b.dh_inicio).getTime();
    }).slice(0, 50); // Show top 50 offenders

    const isOver24h = (dateStr: string, status: string) => {
        if (!dateStr) return false;

        // Rule: If already being worked on, it's not a "Critical Offender" anymore
        const s = status?.toUpperCase() || '';
        if (s.includes('DESIGNADO') || s.includes('PROGRESSO') || s.includes('ATENDIMENTO')) {
            return false;
        }

        try {
            const start = new Date(dateStr).getTime();
            const now = new Date().getTime();
            const hours = (now - start) / (1000 * 60 * 60);
            return hours > 24;
        } catch { return false; }
    };

    const formatDuration = (dateStr: string) => {
        if (!dateStr) return '--';
        try {
            const start = new Date(dateStr).getTime();
            const now = new Date().getTime();
            const diffMs = now - start;

            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const days = Math.floor(hours / 24);
            const remHours = hours % 24;

            if (days > 0) return `${days}d ${remHours}h`;
            return `${hours}h`;
        } catch { return '--'; }
    };

    const toggleExpand = (id: string) => {
        if (expandedId === id) setExpandedId(null);
        else setExpandedId(id);
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Matriz de Ofensores (Top 50 Antigos)</h2>
            </div>

            <div className="overflow-x-auto rounded-3xl border border-white/5 bg-surface-dark/50">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-dark border-b border-white/5">
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Incidente</th>
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Cidade/Regional</th>
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Topologia</th>
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Tempo</th>
                            <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-center">Ofensor 24h?</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedIncidents.map((inc, idx) => {
                            const over24 = isOver24h(inc.dh_inicio, inc.nm_status);
                            const isExpanded = expandedId === inc.id_mostra;

                            // QRT Logic
                            const summary = inc.ds_sumario?.toUpperCase() || '';
                            const isQRT = summary.includes('#QRT#') || summary.includes('SUSPEITA DE QUEDA');
                            // User Rule: Lose mark if status becomes DESIGNADO (or In Progress)
                            const statusUpper = inc.nm_status?.toUpperCase() || '';
                            const isWorkingOn = statusUpper.includes('DESIGNADO') || statusUpper.includes('PROGRESSO') || statusUpper.includes('ATENDIMENTO');
                            const showQRTMark = isQRT && !isWorkingOn;

                            return (
                                <React.Fragment key={inc.id_mostra || idx}>
                                    <tr className={`hover:bg-white/5 transition-colors group ${isExpanded ? 'bg-white/5' : ''}`}>
                                        <td className="p-4 align-top">
                                            <button
                                                onClick={() => toggleExpand(inc.id_mostra)}
                                                className="flex flex-col items-start gap-1 group/btn focus:outline-none"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/50 rounded-lg transition-all group-hover/btn:scale-105">
                                                        <span className="font-black text-white text-xs tracking-wider group-hover/btn:text-primary transition-colors">
                                                            {inc.id_mostra}
                                                        </span>
                                                        <span className="material-symbols-outlined text-[10px] text-gray-500 group-hover/btn:text-primary transition-colors">
                                                            {isExpanded ? 'expand_less' : 'expand_more'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {showQRTMark && (
                                                    <div className="mt-1 px-1.5 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-wider rounded border border-orange-500/20 flex items-center gap-1 animate-pulse">
                                                        <span className="material-symbols-outlined text-[10px]">warning_amber</span>
                                                        QRT
                                                    </div>
                                                )}
                                            </button>
                                            {isExpanded && (
                                                <div className="mt-3 ml-1 text-xs text-gray-300 bg-surface-dark border-l-2 border-primary pl-3 py-2 animate-in fade-in slide-in-from-top-1">
                                                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">Resumo do Incidente</span>
                                                    {inc.ds_sumario || 'Sem descrição disponível.'}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-300">{inc.nm_cidade}</span>
                                                <span className="text-[10px] text-gray-600">{inc.regional}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            {(() => {
                                                // Debug log for first few items
                                                if (idx < 5) console.log(`Row ${idx} Topology:`, inc.topologia, typeof inc.topologia);

                                                let count = 0;
                                                let firstItem = '';

                                                if (Array.isArray(inc.topologia)) {
                                                    count = inc.topologia.length;
                                                    firstItem = inc.topologia[0];
                                                } else if (typeof inc.topologia === 'string' && inc.topologia.trim().length > 0) {
                                                    const parts = inc.topologia.split(',');
                                                    count = parts.length;
                                                    firstItem = parts[0];
                                                }

                                                if (count === 0) return <span className="text-gray-600 text-xs">-</span>;

                                                return (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold ring-1 ring-blue-500/50">
                                                            {count}
                                                        </span>
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[100px]" title={String(inc.topologia)}>
                                                            {firstItem}...
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>
                                        <td className="p-4 align-top">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${inc.nm_status?.includes('PENDENTE') ? 'bg-red-500/10 text-red-500' :
                                                inc.nm_status?.includes('DESIGNADO') ? 'bg-amber-500/10 text-amber-500' :
                                                    'bg-gray-700 text-gray-300'
                                                }`}>
                                                {inc.nm_status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center font-mono text-xs text-gray-400 align-top">
                                            {formatDuration(inc.dh_inicio)}
                                        </td>
                                        <td className="p-4 text-center align-top">
                                            {over24 ? (
                                                <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-full animate-pulse">
                                                    <span className="material-symbols-outlined text-[10px] leading-3">warning</span>
                                                    CRÍTICO
                                                </span>
                                            ) : (
                                                <span className="text-gray-700 text-xs">-</span>
                                            )}
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                        {sortedIncidents.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    Nenhum incidente encontrado.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
};
