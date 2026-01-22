import React, { useEffect, useState, useMemo } from 'react';
import { fetchRawIncidents, ApiIncident } from '../apiService';

interface MonitorRow {
    id: string; // Ticket
    source: string;
    title: string; // TipoEvento
    location: string;
    status: string; // Natureza
    time: string; // Formatted time for display
    fullObject: ApiIncident;

    // New Fields
    ticket: number;
    dataRaw: string; // Full ISO string for calc
    mercado: string;
    sintoma: string;
    cluster: string;
    equipamento: string;
}

interface MonitorTableProps {
    onSelect?: (incident: MonitorRow) => void;
}

export const MonitorTable: React.FC<MonitorTableProps> = ({ onSelect }) => {
    const [data, setData] = useState<MonitorRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [clusterFilter, setClusterFilter] = useState<string>('Todos');
    const [typeFilter, setTypeFilter] = useState<string>('Todos');

    useEffect(() => {
        const loadData = async () => {
            const isInitial = data.length === 0;
            if (isInitial) setLoading(true);
            try {
                const rawData = await fetchRawIncidents();

                // Clear error if successful
                setError(null);

                const normalizedData: MonitorRow[] = rawData.map((item) => {
                    const timeStr = item.data.split('T')[1]?.substring(0, 5) || '00:00';
                    return {
                        id: String(item.idEvento),
                        ticket: item.idEvento,
                        source: 'COp Rede',
                        title: item.tipoEvento,
                        location: `${item.cidade} - ${item.mercado}`,
                        status: item.natureza,
                        time: timeStr,
                        fullObject: item,

                        dataRaw: item.data,
                        mercado: item.mercado,
                        sintoma: item.sintoma,
                        cluster: item.grupo,
                        equipamento: item.equipamento
                    };
                });

                setData(normalizedData);
            } catch (err: any) {
                console.error('Error fetching monitor data:', err);
                setError(err.message || 'Falha na conexão com o banco de dados');
            } finally {
                setLoading(false);
            }
        };

        loadData();
        const interval = setInterval(loadData, 300000); // 5 min
        return () => clearInterval(interval);
    }, []);

    // Derived Data for Filters
    const uniqueClusters = useMemo(() => ['Todos', ...Array.from(new Set(data.map(d => d.cluster))).sort()], [data]);
    const uniqueTypes = useMemo(() => ['Todos', ...Array.from(new Set(data.map(d => d.title))).sort()], [data]);

    // 24h Logic Helper
    const isOver24h = (dateStr: string) => {
        const incidentDate = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - incidentDate.getTime();
        return diffMs > 24 * 60 * 60 * 1000;
    };

    // Filtered Data
    const filteredData = useMemo(() => {
        return data.filter(item => {
            const matchCluster = clusterFilter === 'Todos' || item.cluster === clusterFilter;
            const matchType = typeFilter === 'Todos' || item.title === typeFilter;
            return matchCluster && matchType;
        });
    }, [data, clusterFilter, typeFilter]);

    // Counters
    const criticalCount = filteredData.filter(d => isOver24h(d.dataRaw)).length;

    if (loading && data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4 bg-surface-dark rounded-3xl border border-white/5 animate-pulse">
                <div className="h-2 w-48 bg-white/10 rounded-full" />
                <div className="h-2 w-32 bg-white/5 rounded-full" />
            </div>
        );
    }

    // Error State Display
    if (error) {
        return (
            <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                <h3 className="text-lg font-bold text-white mb-1">Erro de Conexão</h3>
                <p className="text-sm text-red-400 font-mono mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/30 transition-colors"
                >
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {/* Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-surface-dark rounded-2xl border border-white/5">
                {/* ... filters ... */}
                <div className="flex items-center gap-4">
                    {/* Cluster Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Cluster</label>
                        <select
                            value={clusterFilter}
                            onChange={(e) => setClusterFilter(e.target.value)}
                            className="bg-background-dark border border-white/10 rounded-lg text-xs text-white p-2 focus:ring-1 focus:ring-primary outline-none min-w-[140px]"
                        >
                            {uniqueClusters.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Type Filter */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tipo Evento</label>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="bg-background-dark border border-white/10 rounded-lg text-xs text-white p-2 focus:ring-1 focus:ring-primary outline-none min-w-[140px]"
                        >
                            {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </div>

                {/* KPI 24h */}
                <div className="flex items-center gap-3 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <span className="material-symbols-outlined text-red-400">history_toggle_off</span>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-red-500 leading-none">{criticalCount}</span>
                        <span className="text-[9px] uppercase font-bold text-red-400/80">Acima de 24h</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-dark rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-fixed">
                        <thead>
                            <tr className="border-b border-white/5 bg-background-dark/50">
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap w-[90px]">Ticket</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap w-[110px]">Data</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap w-[100px]">Cluster</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap w-[120px]">Tipo Evento</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap w-[100px]">Mercado</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap w-[140px]">Equipamento</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest whitespace-nowrap">Sintoma</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center whitespace-nowrap w-[80px]">SLA</th>
                                <th className="p-3 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right whitespace-nowrap w-[50px]">Notif.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="p-8 text-center text-sm text-gray-500 font-medium">
                                        Nenhuma ocorrência encontrada com os filtros atuais.
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((row) => {
                                    const stale = isOver24h(row.dataRaw);

                                    // WhatsApp Message Generator
                                    const waMessage = encodeURIComponent(
                                        `🚨 *Incidente Crítico Identificado*\n\n` +
                                        `🎫 *Ticket:* ${row.ticket}\n` +
                                        `📅 *Data:* ${new Date(row.dataRaw).toLocaleDateString()} ${row.time}\n` +
                                        `📍 *Local:* ${row.cluster} - ${row.mercado}\n` +
                                        `🔧 *Equipamento:* ${row.equipamento}\n` +
                                        `⚠️ *Sintoma:* ${row.sintoma}\n` +
                                        `📊 *Status:* ${row.title}\n\n` +
                                        `Favor verificar com prioridade.`
                                    );
                                    const waLink = `https://wa.me/?text=${waMessage}`;

                                    return (
                                        <tr
                                            key={row.id}
                                            onClick={() => onSelect?.(row)}
                                            className={`hover:bg-white/[0.04] transition-all group cursor-pointer active:bg-white/10 ${stale ? 'bg-red-500/[0.02]' : ''}`}
                                        >
                                            <td className="p-3 text-[11px] font-mono text-gray-300 truncate" title={String(row.ticket)}>
                                                {row.ticket}
                                            </td>
                                            <td className="p-3 text-[11px] text-gray-400">
                                                <div className="flex flex-col leading-tight">
                                                    <span>{new Date(row.dataRaw).toLocaleDateString('pt-BR')}</span>
                                                    <span className="text-[10px] text-gray-600 font-mono">{row.time}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="truncate max-w-[90px]" title={row.cluster}>
                                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-gray-300 border border-white/10 truncate">
                                                        {row.cluster}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-[11px] font-bold text-white group-hover:text-primary transition-colors truncate" title={row.title}>
                                                {row.title}
                                            </td>
                                            <td className="p-3 text-[11px] text-gray-400 truncate" title={row.mercado}>
                                                {row.mercado}
                                            </td>
                                            <td className="p-3 text-[11px] text-gray-400 font-mono truncate" title={row.equipamento}>
                                                {row.equipamento}
                                            </td>
                                            <td className="p-3 text-[11px] text-gray-500 truncate" title={row.sintoma}>
                                                {row.sintoma}
                                            </td>
                                            <td className="p-3 text-center">
                                                {stale ? (
                                                    <div className="inline-flex items-center justify-center h-6 w-full rounded bg-red-500/10 border border-red-500/20" title="Acima de 24h">
                                                        <span className="material-symbols-outlined text-[14px] text-red-500">warning</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center justify-center h-6 w-full rounded bg-success/5 border border-success/10" title="Dentro do SLA">
                                                        <span className="material-symbols-outlined text-[14px] text-success">check_circle</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                <a
                                                    href={waLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="h-7 w-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all ml-auto"
                                                    title="Enviar no WhatsApp"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">chat</span>
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 bg-background-dark/30 border-t border-white/5 flex justify-between items-center">
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Fonte: COp Rede Centralizado</span>
                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest underline cursor-pointer hover:text-white">Atualizado a cada 5m</span>
                </div>
            </div>
        </div>
    );
};
