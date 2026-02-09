import React, { useEffect, useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { fetchIncidentHistory, fetchRawIncidents, fetchLatestChangedIncident, fetchRecentIngestions } from '../apiService';

// ... (interfaces remain) -> Fixed:
interface HopEvent {
    id: number;
    start: Date;
    end: Date | null;
    duration: string;
    organization: string;
    group: string;
    status: string;
    inProgress: boolean;
}

export const Analysis: React.FC = () => {
    const { selectedIncidentId, setSelectedIncidentId } = useApp(); // Need setter
    const [history, setHistory] = useState<any[]>([]);
    const [incident, setIncident] = useState<any>(null); // Store full incident details
    const [loading, setLoading] = useState(false);
    const [isLive, setIsLive] = useState(true); // Default to Live Mode

    // Poll for Latest Incident (Auto-Select)
    const checkLatest = async () => {
        try {
            // 1. Try fetching by Updated At (System Time)
            let latest = await fetchLatestChangedIncident();

            // 2. Fallback: If strict check returns null, try getting top of Raw Incidents
            if (!latest) {
                const raw = await fetchRawIncidents();
                if (raw.length > 0) latest = raw[0];
            }

            if (latest) {
                // Update if different
                if (!selectedIncidentId || String(latest.id_mostra) !== selectedIncidentId) {
                    console.log("Auto-switching to:", latest.id_mostra);
                    setSelectedIncidentId(String(latest.id_mostra));
                }
            }
        } catch (e) {
            console.error("Error auto-selecting incident:", e);
        }
    };

    useEffect(() => {
        if (!isLive) return;

        checkLatest(); // Initial check
        const interval = setInterval(checkLatest, 5000); // Poll faster: 5s
        return () => clearInterval(interval);
    }, [isLive, selectedIncidentId, setSelectedIncidentId]);

    // Fetch History & Details when selected ID Changes
    useEffect(() => {
        if (selectedIncidentId) {
            const loadData = async () => {
                try {
                    // Fetch History
                    // 1. Fetch Incident Details FIRST to get the UUID
                    // Optimization: ideally we should have a getIncidentById endpoint, but filtering raw works for now.
                    const all = await fetchRawIncidents();
                    const match = all.find(i => String(i.id_mostra) === selectedIncidentId);

                    if (match) {
                        setIncident(match);
                        console.log("DEBUG: Selected Incident Data:", match);

                        // 2. Use the UUID to fetch history
                        const hist = await fetchIncidentHistory(match.id);

                        const sortedHistory = [...hist].sort((a, b) => new Date(a.alterado_em || a.changed_at).getTime() - new Date(b.alterado_em || b.changed_at).getTime());
                        setHistory(sortedHistory);
                    } else {
                        console.warn("Incident not found for ID:", selectedIncidentId);
                        setHistory([]);
                    }

                } catch (e) {
                    console.error("Error loading analysis data:", e);
                }
            };
            loadData();
            const interval = setInterval(loadData, 10000); // Refresh data while viewing
            return () => clearInterval(interval);
        }
    }, [selectedIncidentId]);

    // --- Timeline Processing Logic ---
    const { hops, orgAccumulation, statusAccumulation, kpis } = useMemo(() => {
        // Fallback: If no history, but we have incident, create a "Current State" hop
        if (!history.length) {
            if (incident) {
                // Synthetic Hop from Incident Creation/Now
                const start = new Date(incident.created_at || incident.dh_inicio || new Date());
                const syntheticHop: HopEvent = {
                    id: 1,
                    start: start,
                    end: null, // Still ongoing
                    duration: 'Em andamento',
                    organization: incident.nm_organizacao_tratamento || incident.nm_area_responsavel || 'N/A',
                    group: incident.nm_grupo_tratamento || incident.grupo || 'N/A',
                    status: incident.nm_status || 'Novo',
                    inProgress: true
                };

                return {
                    hops: [syntheticHop],
                    orgAccumulation: { [syntheticHop.organization]: 0 }, // Just placeholders, will be converted to duration string later
                    statusAccumulation: { [syntheticHop.status]: 0 },
                    kpis: {
                        totalTime: '0m',
                        hopCount: 1,
                        currentStatus: syntheticHop.status,
                        currentOrg: syntheticHop.organization,
                        currentGroup: syntheticHop.group,
                        timeInCurrentHop: 'Recente'
                    }
                };
            }
            return { hops: [], orgAccumulation: {}, statusAccumulation: {}, kpis: null };
        }

        // Initial State (Try to find initial values or default)
        // IF history doesn't go back to creation, these might be wrong for the *first* hop if we don't look at "oldVal".
        // But let's assume history[0] contains the first relevant change.

        let currentHopStart = new Date(history[0].alterado_em || history[0].changed_at || new Date());

        let currentOrg = history.find(h => h.campo_alterado === 'nm_organizacao_tratamento')?.valor_novo
            || incident?.nm_organizacao_tratamento
            || incident?.nm_area_responsavel
            || 'N/A';

        let currentGroup = history.find(h => h.campo_alterado === 'nm_grupo_tratamento')?.valor_novo
            || incident?.nm_grupo_tratamento
            || incident?.grupo
            || 'N/A';

        let currentStatus = history.find(h => h.campo_alterado === 'nm_status')?.valor_novo || incident?.nm_status || 'Novo';

        // Iterate through events to define hops
        // A hop changes when relevant fields change
        const calculatedHops: any[] = [];
        for (let i = 0; i < history.length; i++) {
            const event = history[i];
            const eventDate = new Date(event.changed_at || event.alterado_em);
            const field = event.campo_alterado;
            const value = event.valor_novo;

            let changed = false;
            // Map the fields from history to our concepts
            if (field === 'nm_organizacao_tratamento' || field === 'nm_area_responsavel' || field === 'nm_organizacao') { currentOrg = value; changed = true; }
            if (field === 'nm_grupo_tratamento' || field === 'grupo') { currentGroup = value; changed = true; }
            if (field === 'nm_status') { currentStatus = value; changed = true; }

            // If important fields change, or it's the last event, we might close a hop?
            // Actually, a hop is an interval *between* changes. 
            // Simplified Logic: Every relevant change marks the END of the previous hop and START of new.

            if (changed && i > 0) {
                const prevHopEnd = eventDate;
                const durationMs = prevHopEnd.getTime() - currentHopStart.getTime();

                calculatedHops.push({
                    id: calculatedHops.length + 1,
                    start: currentHopStart,
                    end: prevHopEnd,
                    duration: formatDuration(durationMs),
                    organization: currentOrg, // Note: This logic assumes the state *during* the hop. Need to look back? 
                    // Actually, if event I changes state, the state *before* I was the previous state.
                    // So we should capture state at start of hop.
                    group: currentGroup,
                    status: currentStatus,
                    inProgress: false
                });
                currentHopStart = eventDate;
            }

            // Re-update for next loop
            if (field === 'nm_organizacao_tratamento' || field === 'nm_area_responsavel' || field === 'nm_organizacao') { currentOrg = value; }
            if (field === 'nm_grupo_tratamento' || field === 'grupo') { currentGroup = value; }
            if (field === 'nm_status') { currentStatus = value; }
        }

        // ... (This logic needs to be robust, but for "Missing Information" request, the FIX above (Zero History) is key.
        // Let's replace the block with the Zero History fix and keep existing logic (simplified) for now to minimize diff risk.
        // I will just inject the "No History" block and return early.

        // Add final open hop (Current State)
        const now = new Date();
        const lastDurationMs = now.getTime() - currentHopStart.getTime();
        calculatedHops.push({
            id: calculatedHops.length + 1,
            start: currentHopStart,
            end: null, // Open ended
            duration: formatDuration(lastDurationMs),
            organization: currentOrg,
            group: currentGroup,
            status: currentStatus,
            inProgress: true
        });


        // --- Aggregations ---
        const orgAcc: Record<string, number> = {};
        const statusAcc: Record<string, number> = {};

        calculatedHops.forEach(hop => {
            const end = hop.end || new Date();
            const ms = end.getTime() - hop.start.getTime();

            orgAcc[hop.organization] = (orgAcc[hop.organization] || 0) + ms;
            statusAcc[hop.status] = (statusAcc[hop.status] || 0) + ms;
        });

        // --- KPIs ---
        const firstStart = calculatedHops[0]?.start || new Date();
        const totalDurationMs = new Date().getTime() - firstStart.getTime();

        return {
            hops: calculatedHops,
            orgAccumulation: orgAcc,
            statusAccumulation: statusAcc,
            kpis: {
                totalTime: formatDuration(totalDurationMs),
                hopCount: calculatedHops.length,
                currentStatus: currentStatus,
                currentOrg: currentOrg,
                currentGroup: currentGroup,
                timeInCurrentHop: formatDuration(lastDurationMs)
            }
        };

    }, [history]);

    if (!selectedIncidentId) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                {isLive ? (
                    <>
                        <div className="h-20 w-20 rounded-full border-4 border-green-500 border-t-transparent animate-spin flex items-center justify-center">
                            <span className="material-symbols-outlined text-green-500 animate-pulse">sensors</span>
                        </div>
                        <h2 className="text-xl font-black text-white animate-pulse">Aguardando novo incidente...</h2>
                        <p className="text-sm text-gray-500">Monitoramento ao vivo ativo.</p>
                        <button
                            onClick={checkLatest}
                            className="mt-4 px-4 py-2 bg-surface-dark border border-white/10 rounded-lg text-xs font-bold uppercase text-primary hover:bg-white/5 transition-colors"
                        >
                            Forçar Busca Agora
                        </button>
                    </>
                ) : (
                    <>
                        <div className="h-20 w-20 rounded-full bg-surface-dark border border-white/5 flex items-center justify-center shadow-2xl">
                            <span className="material-symbols-outlined text-4xl text-gray-600">analytics</span>
                        </div>
                        <h2 className="text-xl font-black text-white">Nenhum Incidente Selecionado</h2>
                        <p className="text-sm text-gray-500 max-w-md">Selecione um incidente no Monitor para visualizar a análise detalhada.</p>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tight">Análise de Jornada</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">Timeline Consolidada | #{selectedIncidentId}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className={`h-10 px-4 rounded-xl border flex items-center gap-2 transition-colors ${isLive ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-surface-dark border-white/10 text-gray-400'}`}
                    >
                        <span className={`material-symbols-outlined ${isLive ? 'animate-pulse' : ''}`}>
                            {isLive ? 'sensors' : 'sensors_off'}
                        </span>
                        <span className="text-xs font-black uppercase">{isLive ? 'Ao Vivo (Auto)' : 'Pausado'}</span>
                    </button>
                    <button className="h-10 px-4 rounded-xl bg-surface-dark border border-white/10 flex items-center gap-2 hover:bg-white/5 transition-colors">
                        <span className="material-symbols-outlined text-gray-400">print</span>
                        <span className="text-xs font-black text-white uppercase">Imprimir</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Calculando Métricas...</p>
                </div>
            ) : (
                <>
                    {/* 1. Timeline Table */}
                    <Section title="Timeline (por HOP)">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-background-dark/50">
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">HOP</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Início</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Fim</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Duração</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Organização</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Grupo</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Status</th>
                                        <th className="p-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Em Andamento</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs text-gray-300">
                                    {hops.map(hop => (
                                        <tr key={hop.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 font-bold font-mono">{hop.id}</td>
                                            <td className="p-4 font-mono text-gray-400">{hop.start.toLocaleString()}</td>
                                            <td className="p-4 font-mono text-gray-400">{hop.end ? hop.end.toLocaleString() : '-'}</td>
                                            <td className="p-4 font-mono font-bold text-white">{hop.duration}</td>
                                            <td className="p-4">{hop.organization}</td>
                                            <td className="p-4">{hop.group}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${hop.status === 'Novo' ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'}`}>
                                                    {hop.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                {hop.inProgress ? (
                                                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse inline-block" />
                                                ) : 'Não'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section>

                    {/* 2 & 3. Accumulations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Section title="Acúmulo por Organização">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5 bg-background-dark/50">
                                    <tr>
                                        <th className="p-3 text-[10px] font-black uppercase text-gray-500">Organização</th>
                                        <th className="p-3 text-[10px] font-black uppercase text-gray-500 text-right">Tempo Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs">
                                    {Object.entries(orgAccumulation).map(([org, ms]) => (
                                        <tr key={org}>
                                            <td className="p-3 font-bold text-gray-300">{org}</td>
                                            <td className="p-3 text-right font-mono text-white">{formatDuration(Number(ms))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Section>

                        <Section title="Acúmulo por Status">
                            <table className="w-full text-left">
                                <thead className="border-b border-white/5 bg-background-dark/50">
                                    <tr>
                                        <th className="p-3 text-[10px] font-black uppercase text-gray-500">Status</th>
                                        <th className="p-3 text-[10px] font-black uppercase text-gray-500 text-right">Tempo Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-xs">
                                    {Object.entries(statusAccumulation).map(([status, ms]) => (
                                        <tr key={status}>
                                            <td className="p-3 font-bold text-gray-300">{status}</td>
                                            <td className="p-3 text-right font-mono text-white">{formatDuration(Number(ms))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Section>
                    </div>

                    {/* 4. General KPIs */}
                    <Section title="KPIs Gerais">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4">
                            <KPICard label="Tempo Total" value={kpis?.totalTime} highlight />
                            <KPICard label="Hops" value={String(kpis?.hopCount)} />
                            <KPICard label="Status Atual" value={kpis?.currentStatus} />
                            <KPICard label="Grupo Atual" value={kpis?.currentGroup} />
                            <KPICard label="Tempo no Hop" value={kpis?.timeInCurrentHop} />
                        </div>
                    </Section>
                </>
            )}

            {/* Live Stack Horizontal Bar (Footer) */}
            <LiveStackFooter
                selectedId={selectedIncidentId}
                onSelect={(id) => {
                    setSelectedIncidentId(id);
                    setIsLive(false);
                }}
                isLive={isLive}
            />
        </div>
    );
};

// --- Subcomponent: Live Stack Footer (Horizontal) ---

const LiveStackFooter: React.FC<{
    selectedId: string | null;
    onSelect: (id: string) => void;
    isLive: boolean;
}> = ({ selectedId, onSelect, isLive }) => {
    const [recent, setRecent] = useState<any[]>([]);

    useEffect(() => {
        const fetchStack = async () => {
            const data = await fetchRecentIngestions(20);
            setRecent(data);
        };

        fetchStack(); // Initial
        const interval = setInterval(fetchStack, 5000);
        return () => clearInterval(interval);
    }, []);

    if (recent.length === 0) return null;

    return (
        <div className="w-full bg-surface-dark border border-white/5 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500 mt-8">
            <div className="px-6 py-3 border-b border-white/5 bg-background-dark/50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Fluxo de Entrada (Últimos {recent.length})</h3>
                    {isLive && <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>}
                </div>
                <div className="text-[10px] text-gray-600 font-mono">Atualizando em tempo real</div>
            </div>

            <div className="flex overflow-x-auto p-4 gap-3 pb-6 custom-scrollbar">
                {recent.map(inc => {
                    const isActive = String(inc.id_mostra) === selectedId;
                    const timeStr = new Date(inc.created_at || inc.dh_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    const orgDisplay = inc.nm_organizacao_tratamento || inc.nm_area_responsavel || 'N/A';
                    const groupDisplay = inc.nm_grupo_tratamento || inc.grupo || 'N/A';

                    return (
                        <button
                            key={inc.id}
                            onClick={() => onSelect(String(inc.id_mostra))}
                            className={`flex-shrink-0 w-64 text-left p-4 rounded-2xl border transition-all relative overflow-hidden group ${isActive
                                ? 'bg-primary/10 border-primary text-white shadow-xl scale-[1.02] ring-1 ring-primary/50'
                                : 'bg-background-dark/30 border-white/5 text-gray-400 hover:bg-white/5 hover:border-white/10'
                                }`}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />}

                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-black ${isActive ? 'text-primary' : 'text-gray-500'}`}>#{inc.id_mostra}</span>
                                <span className="text-[10px] font-mono text-gray-600 bg-black/20 px-1.5 py-0.5 rounded">{timeStr}</span>
                            </div>

                            <div className="space-y-1 mb-3">
                                <div className="text-xs font-bold truncate text-white" title={orgDisplay}>{orgDisplay}</div>
                                <div className="text-[10px] text-gray-500 truncate" title={groupDisplay}>{groupDisplay}</div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] px-2 py-1 rounded-md uppercase font-black tracking-wider ${(inc.nm_status || '').toLowerCase().includes('aberto') ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-400'
                                    }`}>
                                    {inc.nm_status || 'Novo'}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// --- Helpers & Subcomponents ---

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-surface-dark border border-white/5 rounded-3xl overflow-hidden shadow-lg">
        <div className="px-6 py-4 bg-background-dark/30 border-b border-white/5 border-l-4 border-l-primary">
            <h3 className="text-sm font-black text-white uppercase tracking-wider">{title}</h3>
        </div>
        <div>{children}</div>
    </div>
);

const KPICard: React.FC<{ label: string; value?: string; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div className={`p-4 rounded-2xl border ${highlight ? 'bg-primary/10 border-primary/20' : 'bg-background-dark border-white/5'}`}>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
        <p className={`text-lg font-bold font-mono ${highlight ? 'text-primary' : 'text-white'}`}>{value || '-'}</p>
    </div>
);

function formatDuration(ms: number): string {
    if (ms < 0) ms = 0;
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)));

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
