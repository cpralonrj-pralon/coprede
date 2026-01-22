import { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchRawIncidents, fetchGponEvents, calculateSgoMetrics, ApiIncident, OperationalIncident } from '../../../apiService';
import { GponEvent } from '../../../types';
import { realtimeService } from '../../../services/realtimeService';

export const useDashboardData = () => {
    const [allIncidents, setAllIncidents] = useState<OperationalIncident[]>([]);
    const [sgoIncidents, setSgoIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter States
    const [sgoFilters, setSgoFilters] = useState({
        time: 'Tudo',
        redes: [] as string[],
        statuses: [] as string[],
        grupos: [] as string[],
        clusters: [] as string[]
    });

    const loadData = useCallback(async () => {
        try {
            if (allIncidents.length === 0) setLoading(true);

            // Fetch Real Data from Supabase
            const data = await fetchRawIncidents();

            // Transform OperationalIncident[] to UI format if needed, or use directly
            // The UI currently expects fields like 'ticket', 'incidente', etc. from previous SGO mock
            // We map OperationalIncident to this format
            const mappedData = data.map(i => ({
                ticket: i.id_mostra,
                incidente: i.nm_tipo,
                sintoma: i.ds_sumario || i.nm_tipo,
                acionado: i.nm_status,
                dataInicio: i.dh_inicio,
                observacao: i.ds_sumario,
                cidade: i.nm_cidade,
                node: i.topologia || 'N/A',
                tecnologia: i.nm_cat_prod3 || 'N/A',
                rede: i.nm_cat_prod2 || 'N/A',
                sintomaOper: i.nm_cat_oper2 || 'N/A',
                impacto: 'MÉDIO', // Logic needed based on status/severity
                regional: i.regional,
                grupo: i.grupo,
                cluster: i.cluster,
                subcluster: i.subcluster,

                // Keep original fields for internals
                id_mostra: i.id_mostra,
                nm_origem: i.nm_origem,
                nm_status: i.nm_status,
                nm_tipo: i.nm_tipo,
                nm_cidade: i.nm_cidade,
                dh_inicio: i.dh_inicio,
                ds_sumario: i.ds_sumario,
                regional_raw: i.regional,
                topologia: i.topologia // Explicitly pass topologia
            }));

            setAllIncidents(data);
            setSgoIncidents(mappedData);
            setError(null);
        } catch (err: any) {
            console.error('Data Load Error:', err);
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [allIncidents.length]);

    // Realtime Handler maps new DB Schema to UI structure
    const handleRealtimeEvent = useCallback((payload: any) => {
        const { eventType, new: newRecord } = payload;
        // newRecord is OperationalIncident type

        setSgoIncidents(prev => {
            let updated = [...prev];

            // Check if incident already exists to handle Idempotency
            const existingIndex = updated.findIndex(inc =>
                (inc.id_mostra === newRecord.id_mostra && inc.nm_origem === newRecord.nm_origem) ||
                (inc.external_id === newRecord.id_mostra)
            );

            if (eventType === 'INSERT') {
                const rec = newRecord as OperationalIncident;

                // If it already exists, treat as UPDATE
                if (existingIndex !== -1) {
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        acionado: rec.nm_status,
                        observacao: rec.ds_sumario,
                        nm_status: rec.nm_status,
                        ds_sumario: rec.ds_sumario,
                        updated_at: new Date().toISOString()
                    };
                } else {
                    // Map DB -> UI
                    const newIncident = {
                        ticket: rec.id_mostra,
                        incidente: rec.nm_tipo,
                        sintoma: rec.ds_sumario || rec.nm_tipo,
                        acionado: rec.nm_status,
                        dataInicio: rec.dh_inicio,
                        observacao: rec.ds_sumario,
                        cidade: rec.nm_cidade,
                        node: rec.topologia || 'REALTIME',
                        tecnologia: rec.nm_cat_prod3 || 'GPON',
                        rede: rec.nm_cat_prod2 || 'VITAL',
                        sintomaOper: rec.nm_cat_oper2 || 'NOVO',
                        impacto: 'MÉDIO',
                        regional: rec.regional,
                        grupo: rec.grupo,
                        cluster: rec.cluster,
                        subcluster: rec.subcluster,

                        id_mostra: rec.id_mostra,
                        nm_origem: rec.nm_origem,
                        nm_status: rec.nm_status,
                        nm_tipo: rec.nm_tipo,
                        nm_cidade: rec.nm_cidade,
                        dh_inicio: rec.dh_inicio,
                        ds_sumario: rec.ds_sumario,
                        regional_raw: rec.regional,
                        topologia: rec.topologia // Explicitly pass topologia
                    };
                    updated = [newIncident, ...updated];
                }
            }
            else if (eventType === 'UPDATE') {
                const rec = newRecord as OperationalIncident;
                if (existingIndex !== -1) {
                    updated[existingIndex] = {
                        ...updated[existingIndex],
                        acionado: rec.nm_status,
                        observacao: rec.ds_sumario,
                        nm_status: rec.nm_status,
                        ds_sumario: rec.ds_sumario,
                        topologia: rec.topologia
                    };
                }
            }

            return updated;
        });
    }, []);

    useEffect(() => {
        loadData();
        realtimeService.subscribeToIncidents(handleRealtimeEvent);
        const interval = setInterval(loadData, 300000);
        return () => {
            clearInterval(interval);
            realtimeService.unsubscribe(handleRealtimeEvent);
        };
    }, [loadData, handleRealtimeEvent]);

    const sgoMetrics = useMemo(() => {
        let filtered = [...sgoIncidents];

        // Apply Filters
        if (sgoFilters.time !== 'Tudo') {
            const now = new Date();
            const filterDate = new Date();
            if (sgoFilters.time === 'Hoje') filterDate.setHours(0, 0, 0, 0);
            else if (sgoFilters.time === 'Ontem') {
                filterDate.setDate(now.getDate() - 1);
                filterDate.setHours(0, 0, 0, 0);
            } else if (sgoFilters.time === '7 dias') filterDate.setDate(now.getDate() - 7);
            else if (sgoFilters.time === '1 mês') filterDate.setMonth(now.getMonth() - 1);

            filtered = filtered.filter(i => new Date(i.dataInicio) >= filterDate);
        }

        if (sgoFilters.redes.length > 0) filtered = filtered.filter(i => sgoFilters.redes.includes(i.rede));
        if (sgoFilters.grupos.length > 0) filtered = filtered.filter(i => sgoFilters.grupos.includes(i.grupo));
        if (sgoFilters.clusters.length > 0) filtered = filtered.filter(i => sgoFilters.clusters.includes(i.cluster));

        if (sgoFilters.statuses.length > 0) {
            const isPending = sgoFilters.statuses.includes('Pendentes');
            const isTreated = sgoFilters.statuses.includes('Tratadas');
            if (isPending && !isTreated) {
                filtered = filtered.filter(i => {
                    const s = i.acionado?.toLowerCase() || '';
                    return s.includes('novo') || s.includes('pendente') || s.includes('open');
                });
            } else if (isTreated && !isPending) {
                filtered = filtered.filter(i => {
                    const s = i.acionado?.toLowerCase() || '';
                    return s.includes('designado') || s.includes('progresso') || s.includes('fechado') || s.includes('normalizado');
                });
            }
        }

        return {
            metrics: calculateSgoMetrics(filtered),
            filteredIncidents: filtered // Expose filtered list for Map
        };
    }, [sgoIncidents, sgoFilters]);

    // Available Options
    const options = useMemo(() => ({
        redes: Array.from(new Set(sgoIncidents.map(i => i.rede).filter(Boolean))).sort(),
        grupos: Array.from(new Set(sgoIncidents.map(i => i.grupo).filter(Boolean))).sort(),
        clusters: Array.from(new Set(sgoIncidents.map(i => i.cluster).filter(Boolean))).sort(),
        statuses: ['Pendentes', 'Tratadas'],
        times: ['Tudo', 'Hoje', 'Ontem', '7 dias', '1 mês']
    }), [sgoIncidents]);

    return {
        loading,
        error,
        sgoMetrics: sgoMetrics.metrics,
        incidents: sgoMetrics.filteredIncidents,
        sgoFilters,
        setSgoFilters,
        options,
        refresh: loadData
    };
};
