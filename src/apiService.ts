import { createClient } from '@supabase/supabase-js';
import { ApiIncident, OperationalIncident } from './types';

// Supabase Initialization
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('⚠️ Supabase URL or Key is missing! Check .env or GitHub Secrets.');
}

// Prevent crash if empty, but calls will fail
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
);

// Re-export types for compatibility
export type { ApiIncident, OperationalIncident };
export interface DashboardMetrics {
    total: number;
    pending: number;
    treated: number;
    efficiency: string;
    evolutionData: { time: string; val: number }[];
    techData: { name: string; value: number; color: string }[];
    recentIncidents: any[];
    availableMarkets: string[];
    availableStatuses: string[];
    topCities: {
        name: string;
        value: number;
        topFailure: string;
        stats: { name: string; count: number; percent: number }[];
    }[];
    topCitiesOver24h?: {
        name: string;
        value: number;
        topFailure: string;
        stats: { name: string; count: number; percent: number }[];
    }[];
    outages: { market: string; type: string; count: number }[];
    qrtCount: number;
    qrtByGroup: { name: string; value: number }[];
}

// Fetch Incidents from Supabase (Real Data - Optimized)
export const fetchRawIncidents = async (): Promise<OperationalIncident[]> => {
    try {
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            // Filter out closed incidents (temporarily disabled for debug of 400 error)
            // .not('nm_status', 'ilike', '%fechado%')
            // .not('nm_status', 'ilike', '%normalizado%')
            // .not('nm_status', 'ilike', '%finalizado%')
            .order('dh_inicio', { ascending: false })
            .limit(100); // Reduce limit for debug

        if (error) {
            console.error('Supabase Fetch Error:', error);
            throw error;
        }

        // Return empty array if no data yet (don't break UI)
        return (data as OperationalIncident[]) || [];
    } catch (e) {
        console.error('Unexpected Error fetching incidents:', e);
        return [];
    }
};

// Fallback Mock for legacy Gpon Events if table not ready
export const fetchGponEvents = async (): Promise<any[]> => {
    // Ideally this should also be a Supabase table, but keeping file fetch as fallback if needed
    try {
        const response = await fetch(`${import.meta.env.BASE_URL}dados_gpon.json?t=` + new Date().getTime());
        if (!response.ok) return [];
        return await response.json();
    } catch {
        return [];
    }
};

export interface AnomalyAlert {
    id: string;
    target_type: 'NODE' | 'CITY' | 'REGION';
    target_name: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    metric_value: number;
    message: string;
    status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
    detected_at: string;
}

export const fetchAnomalies = async (): Promise<AnomalyAlert[]> => {
    try {
        const { data, error } = await supabase
            .from('anomaly_alerts')
            .select('*')
            .eq('status', 'ACTIVE')
            .order('detected_at', { ascending: false });

        if (error) {
            console.error('Error fetching anomalies:', error);
            return [];
        }
        return (data as AnomalyAlert[]) || [];
    } catch (e) {
        console.error('Unexpected error fetching anomalies:', e);
        return [];
    }
};

// Fetch the single most recently modified incident (for Auto-Analysis)
export const fetchLatestChangedIncident = async (): Promise<OperationalIncident | null> => {
    try {
        // We use 'created_at' to catch new insertions (Most reliable for "Just Arrived")
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1);

        if (error) {
            console.error('Error fetching latest incident:', error);
            return null;
        }
        return data && data.length > 0 ? (data[0] as OperationalIncident) : null;
    } catch (e) {
        console.error('Unexpected error fetching latest:', e);
        return null;
    }
};

// Fetch the last N most recently created incidents for the "Stack" view
export const fetchRecentIngestions = async (limit: number = 10): Promise<OperationalIncident[]> => {
    try {
        const { data, error } = await supabase
            .from('incidents')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching recent ingestions:', error);
            return [];
        }
        return (data as OperationalIncident[]) || [];
    } catch (e) {
        console.error('Unexpected error fetching recent ingestions:', e);
        return [];
    }
};

export const fetchIncidentHistory = async (incidentId: string): Promise<any[]> => {
    try {
        const { data, error } = await supabase
            .from('incident_history')
            .select('*')
            .eq('incident_id', incidentId)
            .order('alterado_em', { ascending: false });

        if (error) {
            console.error('Error fetching history:', error);
            return [];
        }
        return data || [];
    } catch (e) {
        console.error('Unexpected error fetching history:', e);
        return [];
    }
};

// --- METRIC CALCULATORS ---
// Adapted to work with OperationalIncident

export const calculateMetrics = (incidents: OperationalIncident[]): DashboardMetrics => {
    const total = incidents.length;
    let pending = 0;
    let treated = 0;
    let qrtCount = 0;
    const qrtByGroup: Record<string, number> = {};

    incidents.forEach(i => {
        const s = i.nm_status?.toUpperCase() || '';
        const summary = i.ds_sumario?.toUpperCase() || '';

        // Status Counts
        if (s.includes('PENDENTE') || s.includes('NOVO') || s.includes('OPEN')) {
            pending++;
        } else if (s.includes('DESIGNADO') || s.includes('PROGRESSO') || s.includes('EM ATENDIMENTO')) {
            treated++;
        }

        // QRT Monitor
        // Only count if it's a QRT incident AND it is NOT being worked on yet
        if (summary.includes('#QRT#') || summary.includes('SUSPEITA DE QUEDA')) {
            const statusUpper = i.nm_status?.toUpperCase() || '';
            const isWorkingOn = statusUpper.includes('DESIGNADO') || statusUpper.includes('PROGRESSO') || statusUpper.includes('ATENDIMENTO');

            // User Request (2026-02-03): Only count QRT if status is specifically "NOVO"
            if (statusUpper.includes('NOVO')) {
                qrtCount++;
                const g = i.grupo || 'OUTROS';
                qrtByGroup[g] = (qrtByGroup[g] || 0) + 1;
            }
        }
    });

    // Efficiency: Treated / (Pending + Treated)
    const activeTotal = pending + treated;
    const efficiency = activeTotal > 0 ? `${Math.round((treated / activeTotal) * 100)}%` : '0%';

    // Sort QRT Groups
    const qrtByGroupSorted = Object.entries(qrtByGroup)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    // Evolution Data (hourly)
    const evolutionMap: Record<string, number> = {};
    incidents.forEach(item => {
        try {
            const date = new Date(item.dh_inicio);
            const hour = date.getHours().toString().padStart(2, '0') + ':00';
            evolutionMap[hour] = (evolutionMap[hour] || 0) + 1;
        } catch { }
    });

    const evolutionData = Object.entries(evolutionMap)
        .map(([time, val]) => ({ time, val }))
        .sort((a, b) => a.time.localeCompare(b.time));

    // Tech Data / Type Data
    const eventTypeMap: Record<string, number> = {};
    incidents.forEach(item => {
        const key = item.nm_tipo || item.ds_sumario || 'Outros';
        eventTypeMap[key] = (eventTypeMap[key] || 0) + 1;
    });

    const colors = ['#e0062e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b'];
    const techData = Object.entries(eventTypeMap)
        .map(([name, count], index) => ({
            name,
            value: Math.round((count / total) * 100),
            color: colors[index % colors.length]
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    // Recent Incidents
    const recentIncidents = incidents.slice(0, 4).map(i => ({
        id: `INC-${i.id_mostra}`,
        title: i.nm_tipo,
        location: `${i.nm_cidade} - ${i.regional}`,
        time: i.dh_inicio ? new Date(i.dh_inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
        // Simple severity logic
        status: (i.nm_status?.includes('CRITICO') || i.nm_status?.includes('ROMPIMENTO')) ? 'critical' : 'pending',
        type: i.nm_tipo
    }));

    // Top Cities
    const cityMap: Record<string, number> = {};
    incidents.forEach(i => {
        const c = i.nm_cidade || 'N/A';
        cityMap[c] = (cityMap[c] || 0) + 1;
    });

    const topCities = Object.entries(cityMap)
        .map(([name, value]) => ({
            name,
            value,
            topFailure: 'N/A', // simplification
            stats: []
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

    // Outages (Logic: > 3 incidents in same city/regional with same type)
    // Simplify for now
    const outages: any[] = [];

    const availableMarkets = Array.from(new Set(incidents.map(i => i.regional))).filter(Boolean).sort();
    const availableStatuses = Array.from(new Set(incidents.map(i => i.nm_status))).filter(Boolean).sort();

    return {
        total,
        pending,
        treated,
        efficiency,
        evolutionData,
        techData,
        recentIncidents,
        availableMarkets,
        availableStatuses,
        topCities,
        outages,
        qrtCount,
        qrtByGroup: qrtByGroupSorted
    };
};

export const calculateSgoMetrics = (incidents: any[]) => {
    // Legacy support or alias to calculateMetrics if types match
    return calculateMetrics(incidents as OperationalIncident[]);
};
